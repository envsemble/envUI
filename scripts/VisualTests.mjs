// Runs the visual baseline (tests/visual) inside the official Linux Playwright image, so the
// screenshots are identical on every machine. The checkout is mounted at /work; node_modules come
// from named volumes holding a Linux install, refreshed only when package-lock.json changes.
//
//   node scripts/VisualTests.mjs [--update] [--skip] [--preflight] [Playwright arguments]
//
// --update rewrites changed and missing snapshots; without further arguments it regenerates the
// whole folder, which also drops images no test takes any more.
//
// Docker is required, so a run without it fails; --preflight only checks that, so `npm run verify`
// fails before its other checks rather than after them. To skip the baseline knowingly, set
// ENVUI_SKIP_VISUAL=1 or pass --skip (`npm run verify:no-visual` does); either prints a warning that
// the screenshots were not compared.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(name);
  if (index !== -1) args.splice(index, 1);
  return index !== -1;
};
const update = flag('--update');
const skip = flag('--skip') || process.env.ENVUI_SKIP_VISUAL === '1';
const preflight = flag('--preflight');

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const version = manifest.devDependencies['@playwright/test'];
if (!/^\d+\.\d+\.\d+$/.test(version))
  throw new Error(
    `@playwright/test must be pinned to an exact version to pick its image: ${version}`,
  );
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

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

if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
  console.error(
    [
      `Docker is not running, so the visual baseline cannot render in ${image}.`,
      'Start Docker Desktop or the Docker daemon and try again. To skip the baseline knowingly, set',
      'ENVUI_SKIP_VISUAL=1 or run `npm run verify:no-visual`; the run then does not count as verified.',
    ].join('\n'),
  );
  process.exit(1);
}
if (preflight) process.exit(0);

// One set of volumes per checkout, so worktrees with different lockfiles do not reinstall each other.
const checkout = createHash('sha256').update(root).digest('hex').slice(0, 10);
const lock = createHash('sha256')
  .update(readFileSync(new URL('../package-lock.json', import.meta.url)))
  .update(image)
  .digest('hex');
const modules = ['node_modules', 'packages/ui/node_modules', 'apps/catalogue/node_modules'];
const volumes = modules.flatMap((path) => [
  '--mount',
  `type=volume,source=envui-visual-${checkout}-${path.replaceAll('/', '-')},target=/work/${path}`,
]);

const script = `
set -e
stamp=node_modules/.envui-visual-lock
if [ "$(cat "$stamp" 2>/dev/null)" != "$ENVUI_VISUAL_LOCK" ]; then
  echo "Installing Linux dependencies in the visual volumes..."
  find ${modules.join(' ')} -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  npm ci --no-audit --no-fund --loglevel=error
  echo "$ENVUI_VISUAL_LOCK" > "$stamp"
fi
node scripts/GenerateDocumentation.mjs
# A full update starts from an empty folder, so specimens that were renamed or removed leave no
# stale images behind; unchanged images are written byte for byte as before.
if [ "$ENVUI_VISUAL_FRESH" = 1 ]; then rm -rf tests/visual/snapshots; fi
exec npx playwright test --project=visual "$@"
`;
const fresh = update && args.length === 0;

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    '--mount',
    `type=bind,source=${root},target=/work`,
    ...volumes,
    '--mount',
    'type=volume,source=envui-visual-npm-cache,target=/root/.npm',
    '--workdir',
    '/work',
    '--env',
    'ENVUI_VISUAL=docker',
    '--env',
    `ENVUI_VISUAL_LOCK=${lock}`,
    ...(fresh ? ['--env', 'ENVUI_VISUAL_FRESH=1'] : []),
    ...(process.env.CI ? ['--env', 'CI=1'] : []),
    image,
    'bash',
    '-c',
    script,
    'visual',
    ...(update ? ['--update-snapshots=changed'] : []),
    ...args,
  ],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
