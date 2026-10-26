// `npm run verify`: every check, for releases and for merging into dev or main. It runs what
// `npm run verify` always ran, in phases that share one build and keep the machine busy without
// starving the browsers:
//
//   1. generated files, lint, formatting, types, the three builds and every unit test, side by side;
//   2. on those builds, alone: the browser specs in Chromium, Firefox and WebKit with the contrast
//      gate, and the accessibility scan of the hosted build, in one Playwright run;
//   3. the visual baseline in Docker;
//   4. live development, which edits sources, once nothing else reads them.
//
//   node scripts/Verify.mjs [--skip-visual] [--keep-going]
//
// --skip-visual (or ENVUI_SKIP_VISUAL=1) leaves the screenshots out, with a warning that the run
// does not count as verified. --keep-going runs later phases after a failure. ENVUI_WORKERS sets
// the browser workers (default: half the cores). The browsers run alone because timing-sensitive
// specs, and Firefox's slowest, fail when unit tests or Docker compete with them for the cores.
import { bin, dockerRunning, parallel, red, series, summary, task, yellow } from './TestTasks.mjs';
import { unitTestFiles } from './TestScope.mjs';

const started = performance.now();
const argv = process.argv.slice(2);
const skipVisual = argv.includes('--skip-visual') || process.env.ENVUI_SKIP_VISUAL === '1';
const keepGoing = argv.includes('--keep-going');
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

// Phase 1. The unit tests of the build run once it is done; one of them renders
// .cache/Hydration.html, which Hydration.spec.ts opens in phase 2.
const units = unitTestFiles();
const [phase1, built] = await Promise.all([
  parallel([
    task('unit tests', [...bin.node, '--test', ...units.fast], {
      detail: `${units.fast.length} files`,
    }),
    task('icons:check', node('scripts/GenerateIcons.mjs', '--check')),
    task('tokens:check palette', node('scripts/GeneratePalette.mjs', '--check')),
    task('tokens:check build', node('scripts/BuildTokens.mjs', '--check')),
    task('docs:check props', node('scripts/ExtractProps.mjs', '--check')),
    task('docs:check parts', node('scripts/GenerateParts.mjs', '--check')),
    task('docs:check pages', node('scripts/GenerateDocumentation.mjs', '--check')),
    task('lint', [...bin.eslint, '.', '--cache', '--cache-location', '.cache/eslint/']),
    task('lint:css', [...bin.stylelint, 'packages/ui/src/**/*.css', 'apps/site/src/**/*.css']),
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
      'apps/site/tsconfig.json',
      '--noEmit',
      '--incremental',
      '--tsBuildInfoFile',
      '.cache/tsc/catalogue.tsbuildinfo',
    ]),
    task('build:site', [...bin.npm, 'run', '-s', 'build:site']),
  ]),
  series([
    task('build:library', node('scripts/BuildLibrary.mjs')),
    task('unit tests on the build', [...bin.node, '--test', ...units.built], {
      detail: `${units.built.length} files`,
    }),
  ]),
]);
if ((failed(phase1) || failed(built)) && !keepGoing) finish();

// Phase 2: one Playwright run schedules the engines and the scan on the same workers.
const phase2 = await series([
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
      // As in CI: a test that passes on its second try is reported as flaky, not failed.
      '--retries=1',
    ],
    { detail: 'Chromium, Firefox, WebKit, axe' },
  ),
]);
if (failed(phase2) && !keepGoing) finish();

// Phase 3.
if (!skipVisual) {
  const visual = await series([
    task('visual baseline (Docker)', node('scripts/VisualTests.mjs', '--reporter=dot')),
  ]);
  if (failed(visual) && !keepGoing) finish();
}

// Phase 4.
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
