import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { repositoryRoot } from '../RepositoryPaths.ts';

const args = process.argv.slice(2);
const flag = (name: string) => {
  const index = args.indexOf(name);
  if (index !== -1) args.splice(index, 1);
  return index !== -1;
};
const update = flag('--update');
const skip = flag('--skip') || process.env.ENVUI_SKIP_VISUAL === '1';
const preflight = flag('--preflight');

const imageDigests: Record<string, string> = {
  '1.65.0': 'sha256:6e3fb709361521eb27161606e6da6d2674e5e89fa16516cb37d6fdd91372273d',
};
const platform = 'linux/amd64';

const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'));
const version = manifest.devDependencies['@playwright/test'];
if (!/^\d+\.\d+\.\d+$/.test(version))
  throw new Error(
    `@playwright/test must be pinned to an exact version to pick its image: ${version}`,
  );
const tag = `mcr.microsoft.com/playwright:v${version}-noble`;
if (!imageDigests[version])
  throw new Error(
    `No pinned image for Playwright ${version}. Run \`docker buildx imagetools inspect ${tag}\` and add its Digest to imageDigests in scripts/test/VisualTests.ts.`,
  );
const image = `${tag}@${imageDigests[version]}`;

if (skip && preflight) process.exit(0);
if (skip) {
  const rule = '!'.repeat(78);
  console.warn(
    [
      '',
      rule,
      '!! SKIPPED THE VISUAL BASELINE: no screenshot was compared.',
      `!! ${process.env.ENVUI_SKIP_VISUAL === '1' ? 'ENVUI_SKIP_VISUAL=1 is set' : '--skip was passed'}, so this run is not a full \`npm run verify\`.`,
      '!! Start Docker and run `npm run test:visual` before pushing or releasing.',
      rule,
      '',
    ].join('\n'),
  );
  process.exit(0);
}

const info = spawnSync('docker', ['info', '--format', '{{json .SecurityOptions}}'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore'],
});
if (info.status !== 0) {
  console.error(
    [
      `Docker is not running, so the visual baseline cannot render in ${tag}.`,
      'Start Docker Desktop or the Docker daemon and try again. To skip the baseline knowingly, set',
      'ENVUI_SKIP_VISUAL=1 or run `npm run verify:no-visual`; the run then does not count as verified.',
    ].join('\n'),
  );
  process.exit(1);
}
if (preflight) process.exit(0);

const hostUser =
  process.platform === 'linux' && process.getuid!() !== 0 && !info.stdout.includes('rootless')
    ? `${process.getuid!()}:${process.getgid!()}`
    : undefined;

const checkout = createHash('sha256').update(repositoryRoot).digest('hex').slice(0, 10);
const lock = createHash('sha256')
  .update(readFileSync(resolve(repositoryRoot, 'package-lock.json')))
  .update(`${image} ${platform}`)
  .digest('hex');
const modules = ['node_modules', 'packages/ui/node_modules', 'apps/site/node_modules'];
const npmCache = '/npm-cache';
const volumes = [
  ...modules.flatMap((path) => [
    '--mount',
    `type=volume,source=envui-visual-${checkout}-${path.replaceAll('/', '-')},target=/work/${path}`,
  ]),
  '--mount',
  `type=volume,source=envui-visual-npm-cache,target=${npmCache}`,
];
const container = [
  'run',
  '--rm',
  '--platform',
  platform,
  '--mount',
  `type=bind,source=${repositoryRoot},target=/work`,
  ...volumes,
  '--workdir',
  '/work',
];

if (hostUser) {
  const prepared = spawnSync(
    'docker',
    [
      ...container,
      '--env',
      `ENVUI_HOST_USER=${hostUser}`,
      image,
      'sh',
      '-c',
      `
for dir in ${modules.join(' ')} ${npmCache}; do
  [ "$(stat -c %u:%g "$dir")" = "$ENVUI_HOST_USER" ] || chown -R "$ENVUI_HOST_USER" "$dir"
done
for output in test-results tests/visual/snapshots apps/site/src/generated; do
  [ ! -e "$output" ] || find "$output" -user 0 -exec chown "$ENVUI_HOST_USER" {} +
done
`,
    ],
    { stdio: 'inherit' },
  );
  if (prepared.status !== 0) process.exit(prepared.status ?? 1);
}

const script = `
set -e
stamp=node_modules/.envui-visual-lock
if [ "$(cat "$stamp" 2>/dev/null)" != "$ENVUI_VISUAL_LOCK" ]; then
  echo "Installing Linux dependencies in the visual volumes..."
  find ${modules.join(' ')} -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  npm ci --no-audit --no-fund --loglevel=error
  echo "$ENVUI_VISUAL_LOCK" > "$stamp"
fi
node scripts/docs/GenerateDocumentation.ts
exec npx playwright test --project=visual "$@"
`;

const choosesUpdate = args.some((arg) => /^(?:-u|--update-snapshots(?:=.*)?)$/.test(arg));
const updateMode = update
  ? ['--update-snapshots=changed']
  : choosesUpdate
    ? []
    : ['--update-snapshots=none'];

const result = spawnSync(
  'docker',
  [
    ...container,
    '--init',
    '--ipc=host',
    ...(hostUser ? ['--user', hostUser, '--env', 'HOME=/tmp'] : []),
    '--env',
    'ENVUI_VISUAL=docker',
    '--env',
    `ENVUI_VISUAL_LOCK=${lock}`,
    '--env',
    `npm_config_cache=${npmCache}`,
    ...(process.env.CI ? ['--env', 'CI=1'] : []),
    ...['ENVUI_WORKERS', 'ENVUI_SITE_PORT', 'ENVUI_SITE_BUILD_PORT', 'ENVUI_FIXTURE_PORT'].flatMap(
      (name) => (process.env[name] ? ['--env', `${name}=${process.env[name]}`] : []),
    ),
    image,
    'bash',
    '-c',
    script,
    'visual',
    ...updateMode,
    ...args,
  ],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
