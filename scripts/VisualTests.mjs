// Runs the visual baseline (tests/visual) inside the official Linux Playwright image, so the
// screenshots are identical on every machine. The checkout is mounted at /work; node_modules come
// from named volumes holding a Linux install, refreshed only when package-lock.json changes.
//
//   node scripts/VisualTests.mjs [--update] [--if-docker] [Playwright arguments]
//
// --update rewrites changed and missing snapshots; without further arguments it regenerates the
// whole folder, which also drops images no test takes any more. --if-docker skips with a warning
// when Docker is not running (local `npm run verify`); in CI a missing Docker still fails.
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
const ifDocker = flag('--if-docker');

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const version = manifest.devDependencies['@playwright/test'];
if (!/^\d+\.\d+\.\d+$/.test(version))
  throw new Error(
    `@playwright/test must be pinned to an exact version to pick its image: ${version}`,
  );
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
  const message = `Docker is not running, so the visual baseline (${image}) cannot render.`;
  if (ifDocker && !process.env.CI) {
    console.warn(
      `\nSkipped the visual baseline: ${message}\nStart Docker and run \`npm run test:visual\` before a release.\n`,
    );
    process.exit(0);
  }
  console.error(`${message} Start Docker Desktop or the Docker daemon and try again.`);
  process.exit(1);
}

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
