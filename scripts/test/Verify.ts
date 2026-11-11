// `npm run verify`: every check, for releases and for merging into dev or main. It runs what
// `npm run verify` always ran, the parts side by side in phases that share one build:
//
//   1. generated files, lint, formatting, types, the three builds and every unit test;
//   2. on those builds, the browser suites, each with its own servers, ports and share of the
//      browser workers: the library in Chromium with the contrast gate, in Firefox and in WebKit,
//      the site's smoke, the accessibility scans of the site's pages and of the fixtures, and the
//      visual baseline in Docker;
//   3. live development, which edits sources, once nothing else reads them.
//
//   node scripts/test/Verify.ts [--skip-visual] [--keep-going]
//
// --skip-visual (or ENVUI_SKIP_VISUAL=1) leaves the screenshots out, with a warning that the run
// does not count as verified. --keep-going runs later phases after a failure. ENVUI_WORKERS sets
// the browser workers all suites share (default: half the cores), and ENVUI_SITE_PORT,
// ENVUI_FIXTURE_PORT and ENVUI_SITE_BUILD_PORT the first suite's ports, the others taking the ten
// after each. The summary gives each part's time.
import { availableParallelism } from 'node:os';
import {
  bin,
  dockerRunning,
  parallel,
  red,
  series,
  summary,
  task,
  yellow,
  type TaskResult,
} from './TestTasks.ts';
import { checks, generateDocumentation } from './Checks.ts';
import { unitTestFiles } from './TestScope.ts';
import { defaultPorts } from './CheckoutMarker.ts';

const started = performance.now();
const argv = process.argv.slice(2);
const skipVisual = argv.includes('--skip-visual') || process.env.ENVUI_SKIP_VISUAL === '1';
const keepGoing = argv.includes('--keep-going');
const node = (script: string, ...args: string[]) => [...bin.node, script, ...args];
const failed = (results: TaskResult[]) => results.some((result) => !result.ok && !result.optional);
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

// Everything below reads the generated documentation.
await series([generateDocumentation]);

// Phase 1. The unit tests of the build run once it is done; one of them renders
// .cache/Hydration.html, which Hydration.spec.ts opens in phase 2.
const units = unitTestFiles();
const [phase1, built] = await Promise.all([
  parallel([
    task('unit tests', [...bin.node, '--test', ...units.fast], {
      detail: `${units.fast.length} files`,
    }),
    ...checks['icons:check'](),
    ...checks['tokens:check'](),
    ...checks['docs:check'](),
    ...checks.lint(),
    ...checks['lint:css'](),
    ...checks['lint:unused'](),
    ...checks['format:check'](),
    ...checks.typecheck(),
    task('build:site', [...bin.npm, 'run', '-s', 'build:site']),
  ]),
  series([
    task('build:library', node('scripts/build/BuildLibrary.ts')),
    task('unit tests on the build', [...bin.node, '--test', ...units.built], {
      detail: `${units.built.length} files`,
    }),
  ]),
]);
if ((failed(phase1) || failed(built)) && !keepGoing) finish();

// Phase 2. Each suite's share of the workers, by its weight: about its test time on one worker,
// so the suites end near the same time. The visual baseline renders in its own container.
const suites = [
  { name: 'library (Chromium)', weight: 5, run: ['library', '--browser=chromium'] },
  { name: 'library (Firefox)', weight: 2, run: ['library', '--browser=firefox'] },
  { name: 'library (WebKit)', weight: 2, run: ['library', '--browser=webkit'] },
  { name: 'site', weight: 1, run: ['site'] },
  { name: 'accessibility (site)', weight: 1 },
  { name: 'accessibility (fixtures)', weight: 1 },
  ...(skipVisual ? [] : [{ name: 'visual baseline (Docker)', weight: 3 }]),
];
const configured = process.env.ENVUI_WORKERS;
const totalWorkers = configured
  ? /^\d+$/.test(configured)
    ? Number(configured)
    : Math.floor((availableParallelism() * parseFloat(configured)) / 100)
  : Math.floor(availableParallelism() / 2);
const totalWeight = suites.reduce((sum, suite) => sum + suite.weight, 0);
const workersOf = (weight: number) =>
  Math.max(1, Math.round((Math.max(totalWorkers, suites.length) * weight) / totalWeight));
/** The servers' ports of the suite at `index`: the ten after the one before's. */
const ports = (index: number) => ({
  ENVUI_SITE_PORT: String(Number(process.env.ENVUI_SITE_PORT || defaultPorts.site) + 10 * index),
  ENVUI_FIXTURE_PORT: String(
    Number(process.env.ENVUI_FIXTURE_PORT || defaultPorts.fixture) + 10 * index,
  ),
  ENVUI_SITE_BUILD_PORT: String(
    Number(process.env.ENVUI_SITE_BUILD_PORT || defaultPorts.siteBuild) + 10 * index,
  ),
});
// As in CI: a test that passes on its second try is reported as flaky, not failed. Each suite
// writes its own results folder, as Playwright empties the one it writes at its start.
const playwrightOptions = (folder: string) => [
  '--reporter=dot',
  '--retries=1',
  `--output=test-results/${folder}`,
];
const phase2 = await parallel(
  suites.map((suite, index) => {
    const workers = workersOf(suite.weight);
    const env = { ...ports(index), ENVUI_WORKERS: String(workers) };
    const detail = `${workers} workers`;
    const folder = suite.name.replace(/\W+/g, '-').replace(/-$/, '').toLowerCase();
    if (suite.run)
      return task(
        suite.name,
        [
          ...node('scripts/test/TestBrowser.ts', ...suite.run, '--no-build'),
          ...playwrightOptions(folder),
        ],
        { env, detail },
      );
    if (suite.name === 'accessibility (site)')
      return task(
        suite.name,
        [...bin.playwright, 'test', '--project=a11y', ...playwrightOptions(folder)],
        { env, detail },
      );
    if (suite.name === 'accessibility (fixtures)')
      return task(
        suite.name,
        [
          ...bin.vitest,
          'run',
          '--config',
          'tests/component/vitest.config.ts',
          '--project=chromium',
          '--tags-filter=a11y',
          '--reporter=dot',
        ],
        { env, detail },
      );
    // The screenshots get no second try.
    return task(
      suite.name,
      node('scripts/test/VisualTests.ts', '--reporter=dot', `--output=test-results/${folder}`),
      { env, detail },
    );
  }),
);
if (failed(phase2) && !keepGoing) finish();

// Phase 3, on the development server alone.
await series([
  task(
    'live development',
    [
      ...bin.playwright,
      'test',
      '--project=live-development',
      '--no-deps',
      ...playwrightOptions('live-development'),
    ],
    { env: { ENVUI_SERVERS: 'site' } },
  ),
]);
finish();
