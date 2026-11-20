import { availableParallelism } from 'node:os';
import {
  bin,
  dockerRunning,
  parallel,
  series,
  summary,
  task,
  type TaskResult,
} from './TestTasks.ts';
import { red, yellow } from '../Terminal.ts';
import { checks, generateDocumentation } from './StaticChecks.ts';
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

if (!skipVisual && !(await dockerRunning())) {
  console.error(
    red(
      'Docker is not running, so the visual baseline cannot render. Start it, or run `npm run verify:no-visual` (the run then does not count as verified).',
    ),
  );
  process.exit(1);
}

await series([generateDocumentation]);

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
const ports = (index: number) => ({
  ENVUI_SITE_PORT: String(Number(process.env.ENVUI_SITE_PORT || defaultPorts.site) + 10 * index),
  ENVUI_FIXTURE_PORT: String(
    Number(process.env.ENVUI_FIXTURE_PORT || defaultPorts.fixture) + 10 * index,
  ),
  ENVUI_SITE_BUILD_PORT: String(
    Number(process.env.ENVUI_SITE_BUILD_PORT || defaultPorts.siteBuild) + 10 * index,
  ),
});
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
    return task(
      suite.name,
      node('scripts/test/VisualTests.ts', '--reporter=dot', `--output=test-results/${folder}`),
      { env, detail },
    );
  }),
);
if (failed(phase2) && !keepGoing) finish();

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
