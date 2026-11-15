import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { burnInFiles } from './ChooseJobs.ts';
import { readDurations } from './ComponentShards.ts';
import { isComponentTest } from './FixtureImports.ts';
import { serversFor, specNeeds } from './TestScope.ts';
import { bin } from './TestTasks.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';
import { median } from '../measure/Median.ts';

const { values, positionals: files } = parseArgs({
  allowPositionals: true,
  options: { runs: { type: 'string', default: '5' }, 'api.port': { type: 'string' } },
});
const runs = Number(values.runs);
if (!Number.isInteger(runs) || runs < 1) throw new Error(`--runs takes a whole number: ${runs}`);
const unknown = files.filter((file) => !burnInFiles([file]).length);
if (!files.length || unknown.length)
  throw new Error(
    `Usage: BurnIn.ts [--runs <n>] [--api.port <port>] <file>..., each a component test or a Playwright spec${unknown.length ? `, not ${unknown.join(', ')}` : ''}`,
  );

let failed = false;
const run = (command: string[], env: Record<string, string> = {}, required = false) => {
  const [file, ...args] = command as [string, ...string[]];
  console.log(`\n${command.slice(1).join(' ')}`);
  const result = spawnSync(file, args, {
    cwd: repositoryRoot,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status === 0) return;
  if (required) process.exit(result.status ?? 1);
  failed = true;
};

const componentTests = files.filter(isComponentTest);
const componentBudgetSeconds = 6 * 60;
const durations = readDurations();
const typical = median(Object.values(durations));
const componentSeconds = componentTests.reduce(
  (sum, file) => sum + (durations[file] ?? typical),
  0,
);
const componentRuns = Math.max(
  2,
  Math.min(runs, Math.floor(componentBudgetSeconds / componentSeconds)),
);
if (componentRuns < runs)
  console.log(
    `The ${componentTests.length} component test files take about ${Math.round(componentSeconds)} s a run, so they run ${componentRuns} times, not ${runs}.`,
  );
const specs = files
  .filter((file) => !isComponentTest(file))
  .map((file) => ({ file, name: file.replace(/^.*\/|\.spec\.ts$/g, '') }))
  .map((spec) => ({ ...spec, needs: specNeeds(spec.name) }));
const live = specs.filter((spec) => spec.needs.live);
const others = specs.filter((spec) => !spec.needs.live);

if (componentTests.length)
  run([
    ...bin.vitest,
    'run',
    '--config',
    'tests/component/vitest.config.ts',
    '--project=chromium*',
    '--tags-filter=!a11y',
    '--passWithNoTests',
    '--retry=0',
    `--repeats=${componentRuns - 1}`,
    ...(values['api.port'] ? [`--api.port=${values['api.port']}`] : []),
    ...componentTests,
  ]);

if (others.some((spec) => spec.needs.site)) run([...bin.npm, 'run', '-s', 'build:site'], {}, true);
if (others.some((spec) => spec.needs.library)) {
  run([...bin.node, 'scripts/build/BuildLibrary.ts'], {}, true);
  run(
    [...bin.node, '--test', '--test-reporter=dot', 'tests/library/package/Hydration.test.ts'],
    {},
    true,
  );
}
const playwright = (group: typeof specs, project: string, options: string[] = []) =>
  run(
    [
      ...bin.playwright,
      'test',
      `--project=${project}`,
      ...options,
      '--retries=0',
      `--repeat-each=${runs}`,
      ...group.map((spec) => spec.file),
    ],
    { ENVUI_SERVERS: serversFor(group.map((spec) => spec.name)).join(',') || 'none' },
  );
if (others.length) playwright(others, 'chromium');
if (live.length) playwright(live, 'live-development', ['--no-deps', '--workers=1']);

console.log(
  failed
    ? '\nThe burn-in failed: a test above failed in one of its runs. Make it wait for the condition it checks (AGENTS.md, Tests).'
    : '\nEvery test passed every run.',
);
process.exit(failed ? 1 : 0);
