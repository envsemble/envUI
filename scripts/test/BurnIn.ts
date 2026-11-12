// CI's burn-in: runs the browser test files a pull request adds or edits several times in a row, in
// Chromium and with no retries, so that a test that passes only some of the time fails the pull
// request that brings it rather than a later one. The CI workflow's `Changes` job picks the files
// (burnInFiles in scripts/test/ChooseJobs.ts).
//
//   node scripts/test/BurnIn.ts [--runs <n>] [--api.port <port>] <file>...
//
// --runs       how many times each test runs (default 5); any failed run fails the burn-in
// --api.port   the port of Vitest's browser server, as for `npm run test:library`
//
// The component tests repeat each test with Vitest's --repeats, which runs it once and then that
// many times more, its hooks each time; the Playwright specs with --repeat-each, each run a test
// of its own on a fresh page. Live development edits sources, so its runs go one at a time, last.
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { burnInFiles } from './ChooseJobs.ts';
import { isComponentTest } from './FixtureImports.ts';
import { serversFor, specNeeds } from './TestScope.ts';
import { bin } from './TestTasks.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

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

/** Runs a command; `required` stops the burn-in at a failure, else it fails the burn-in at its end. */
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
// A spec by its name, as TestScope.ts reads it: SiteSmoke for tests/browser/site/SiteSmoke.spec.ts.
const specs = files
  .filter((file) => !isComponentTest(file))
  .map((file) => ({ file, name: file.replace(/^.*\/|\.spec\.ts$/g, '') }))
  .map((spec) => ({ ...spec, needs: specNeeds(spec.name) }));
const live = specs.filter((spec) => spec.needs.live);
const others = specs.filter((spec) => !spec.needs.live);

// As CI's Chromium jobs run them: every test but the accessibility scan, here without retries.
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
    `--repeats=${runs - 1}`,
    ...(values['api.port'] ? [`--api.port=${values['api.port']}`] : []),
    ...componentTests,
  ]);

// The builds the specs open: the site's hosted build, and the library's hydration page, which a
// unit test renders from the library build.
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
    ? `\nThe burn-in failed: a test above failed in one of its ${runs} runs. Make it wait for the condition it checks (AGENTS.md, Tests).`
    : `\nEvery test passed ${runs} times in a row.`,
);
process.exit(failed ? 1 : 0);
