// `npm run verify`: every check, for releases and for merging into dev or main. It runs what
// `npm run verify` always ran, in phases that share their work:
//
//   1. generated files, lint, formatting, types and the three builds, side by side;
//   2. on those builds: the unit tests, the browser specs in Chromium, Firefox and WebKit with the
//      contrast gate, the accessibility scan of the hosted build, and the visual baseline in Docker;
//   3. live development, which edits sources, once nothing else reads them.
//
//   node scripts/Verify.mjs [--skip-visual] [--keep-going] [--serial]
//
// --skip-visual (or ENVUI_SKIP_VISUAL=1) leaves the screenshots out, with a warning that the run
// does not count as verified. --keep-going runs later phases after a failure. --serial runs the
// visual baseline after the browser specs instead of beside them, for a machine short of cores.
// ENVUI_WORKERS sets the browser workers (default: half the cores).
import { bin, dockerRunning, parallel, red, series, summary, task, yellow } from './TestTasks.mjs';
import { unitTestFiles } from './TestScope.mjs';

const started = performance.now();
const argv = process.argv.slice(2);
const skipVisual = argv.includes('--skip-visual') || process.env.ENVUI_SKIP_VISUAL === '1';
const keepGoing = argv.includes('--keep-going');
const serial = argv.includes('--serial');
const node = (script, ...args) => [...bin.node, script, ...args];
const failed = (results) => results.some((result) => !result.ok && !result.optional);
const finish = () => {
  const ok = summary('verify', started);
  if (skipVisual)
    console.log(
      yellow(
        '!! SKIPPED THE VISUAL BASELINE: no screenshot was compared, so this run is not a full `npm run verify`.',
      ),
    );
  process.exit(ok ? 0 : 1);
};

// Docker first, so a run without it fails at once rather than after the other checks.
if (!skipVisual && !(await dockerRunning())) {
  console.error(
    red(
      'Docker is not running, so the visual baseline cannot render. Start it, or run `npm run verify:no-visual` (the run then does not count as verified).',
    ),
  );
  process.exit(1);
}

// The catalogue's documentation module is generated, not committed; everything below reads it.
await series([task('generate documentation', node('scripts/GenerateDocumentation.mjs'))]);

// The visual baseline renders in Docker from the sources, apart from the host's builds, so it
// starts now and runs beside phases 1 and 2.
const visual =
  !skipVisual && !serial
    ? parallel([
        task('visual baseline (Docker)', node('scripts/VisualTests.mjs', '--reporter=dot')),
      ])
    : undefined;

// Phase 1. The hydration test renders .cache/Hydration.html from the library build, for
// Hydration.spec.ts in phase 2.
const hydration = 'tests/Hydration.test.mjs';
const [phase1, built] = await Promise.all([
  parallel([
    task('icons:check', node('scripts/GenerateIcons.mjs', '--check')),
    task('tokens:check palette', node('scripts/GeneratePalette.mjs', '--check')),
    task('tokens:check build', node('scripts/BuildTokens.mjs', '--check')),
    task('docs:check props', node('scripts/ExtractProps.mjs', '--check')),
    task('docs:check pages', node('scripts/GenerateDocumentation.mjs', '--check')),
    task('docs:check manifest', node('scripts/GenerateManifest.mjs', '--check')),
    task('lint', [...bin.eslint, '.', '--cache', '--cache-location', '.cache/eslint/']),
    task('lint:css', [...bin.stylelint, 'packages/ui/src/**/*.css', 'apps/catalogue/src/**/*.css']),
    task('format:check', [...bin.prettier, '--check', '.']),
    task('typecheck ui', [
      ...bin.tsc,
      '-p',
      'packages/ui/tsconfig.json',
      '--noEmit',
      '--incremental',
      '--tsBuildInfoFile',
      '.cache/tsc/ui.tsbuildinfo',
    ]),
    task('typecheck catalogue', [
      ...bin.tsc,
      '-p',
      'apps/catalogue/tsconfig.json',
      '--noEmit',
      '--incremental',
      '--tsBuildInfoFile',
      '.cache/tsc/catalogue.tsbuildinfo',
    ]),
    task('build:catalogue', [...bin.npm, 'run', '-s', 'build:catalogue']),
    task('build:site', [...bin.npm, 'run', '-s', 'build:site']),
  ]),
  series([
    task('build:library', node('scripts/BuildLibrary.mjs')),
    task('hydration unit test', [...bin.node, '--test', hydration]),
  ]),
]);
if ((failed(phase1) || failed(built)) && !keepGoing) {
  await visual;
  finish();
}

// Phase 2: one Playwright run schedules the engines and the scan on the same workers.
const units = Object.values(unitTestFiles())
  .flat()
  .filter((file) => file !== hydration);
const phase2 = await parallel([
  task('unit tests', [...bin.node, '--test', ...units], { detail: `${units.length} more files` }),
  task(
    'browser, contrast and accessibility',
    [
      ...bin.playwright,
      'test',
      '--project=chromium',
      '--project=firefox',
      '--project=webkit',
      '--project=a11y',
      '--reporter=dot',
    ],
    { detail: 'Chromium, Firefox, WebKit, axe' },
  ),
]);
const visualResults = visual
  ? await visual
  : !skipVisual
    ? await parallel([
        task('visual baseline (Docker)', node('scripts/VisualTests.mjs', '--reporter=dot')),
      ])
    : [];
if ((failed(phase2) || failed(visualResults)) && !keepGoing) finish();

// Phase 3.
await series([
  task('live development', [
    ...bin.playwright,
    'test',
    '--project=live-development',
    '--no-deps',
    '--reporter=dot',
  ]),
]);
finish();
