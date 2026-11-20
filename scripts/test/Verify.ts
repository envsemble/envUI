import { availableParallelism } from 'node:os';
import {
  bin,
  componentTestCommand,
  dockerRunning,
  parallel,
  playwrightCommand,
  series,
  summary,
  task,
  type TaskResult,
} from './TestTasks.ts';
import { red, yellow } from '../Terminal.ts';
import { checks, generateDocumentation } from './StaticChecks.ts';
import { unitTestFiles } from './TestScope.ts';
import { portsFor } from '../DevServers.ts';

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

const playwrightOptions = (folder: string) => [
  '--reporter=dot',
  '--retries=1',
  `--output=test-results/${folder}`,
];
const browserSuite =
  (...args: string[]) =>
  (folder: string) => [
    ...node('scripts/test/TestBrowser.ts', ...args, '--no-build'),
    ...playwrightOptions(folder),
  ];
const suites: { name: string; weight: number; run: (folder: string) => string[] }[] = [
  { name: 'library (Chromium)', weight: 5, run: browserSuite('library', '--browser=chromium') },
  { name: 'library (Firefox)', weight: 2, run: browserSuite('library', '--browser=firefox') },
  { name: 'library (WebKit)', weight: 2, run: browserSuite('library', '--browser=webkit') },
  { name: 'site', weight: 1, run: browserSuite('site') },
  {
    name: 'accessibility (site)',
    weight: 1,
    run: (folder) => playwrightCommand(['a11y'], playwrightOptions(folder)),
  },
  {
    name: 'accessibility (fixtures)',
    weight: 1,
    run: () => componentTestCommand('a11y', ['--reporter=dot']),
  },
  ...(skipVisual
    ? []
    : [
        {
          name: 'visual baseline (Docker)',
          weight: 3,
          run: (folder: string) =>
            node(
              'scripts/test/VisualTests.ts',
              '--reporter=dot',
              `--output=test-results/${folder}`,
            ),
        },
      ]),
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
const phase2 = await parallel(
  suites.map((suite, index) => {
    const workers = workersOf(suite.weight);
    const folder = suite.name.replace(/\W+/g, '-').replace(/-$/, '').toLowerCase();
    return task(suite.name, suite.run(folder), {
      env: { ...portsFor(index), ENVUI_WORKERS: String(workers) },
      detail: `${workers} workers`,
    });
  }),
);
if (failed(phase2) && !keepGoing) finish();

await series([
  task(
    'live development',
    playwrightCommand(
      ['live-development'],
      ['--no-deps', ...playwrightOptions('live-development')],
    ),
    { env: { ENVUI_SERVERS: 'site' } },
  ),
]);
finish();
