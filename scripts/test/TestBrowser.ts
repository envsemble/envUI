// `npm run test:library` and `npm run test:site`: the library's browser tests in one engine, and the
// site's smoke and hydration specs in Chromium. They are the one command CI and `npm run verify`
// run each suite by, so the runner behind a suite can change without them. The library's are its
// component tests in Vitest's browser mode (tests/component, as `npm run test:component` and
// `test:component:engines` run them), then its Playwright specs (tests/browser/library).
//
//   node scripts/test/TestBrowser.ts <library|site> [--browser chromium|firefox|webkit]
//                                     [--shard <i>/<n>] [--retries <n>] [--no-build]
//                                     [--api.port <port>] [Playwright arguments]
//
// --browser    the library's engine (default chromium); Firefox and WebKit run its tests tagged
//              engines (Vitest) and @engines (Playwright)
// --shard      runs the i-th of n parts, for CI's parallel jobs: Vitest's by file, the site's
//              Playwright specs by test and the library's in its first part, which Vitest's
//              split leaves lightest
// --retries    tries a failed test again (default: once in CI)
// --api.port   the port of Vitest's browser server (default 63315, or the next free one); Vitest
//              reads this, not --browser.api.port
// --no-build   skips the build the suite opens, for a run that has just made it: the library's
//              Hydration.spec.ts opens .cache/Hydration.html, which a unit test renders from the
//              library's build, and the site's specs open its hosted build (npm run build:site)
//
// It starts only the servers the suite's specs open (ENVUI_SERVERS).
import { spawnSync } from 'node:child_process';
import { serversFor } from './TestScope.ts';
import { specPaths } from './FixtureImports.ts';
import { bin } from './TestTasks.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const [suite, ...argv] = process.argv.slice(2);
if (suite !== 'library' && suite !== 'site')
  throw new Error('Usage: TestBrowser.ts <library|site> [options]');

// Its own options, as --name value or --name=value; Vitest's --api.port, the port of its browser
// server, goes to Vitest, and what it does not read to Playwright.
const passed: string[] = [];
const vitestPassed: string[] = [];
const options: { browser: string; shard?: string; retries?: string; build: boolean } = {
  browser: 'chromium',
  retries: process.env.CI ? '1' : undefined,
  build: true,
};
for (let index = 0; index < argv.length; index++) {
  const [name, inline] = argv[index]!.split(/=(.*)/s, 2) as [string, string | undefined];
  if (name === '--no-build') options.build = false;
  else if (name === '--api.port') vitestPassed.push(`--api.port=${inline ?? argv[++index]}`);
  else if (name === '--browser' || name === '--shard' || name === '--retries') {
    const value = inline ?? argv[++index];
    if (!value) throw new Error(`${name} needs a value`);
    options[name.slice(2) as 'browser' | 'shard' | 'retries'] = value;
  } else passed.push(argv[index]!);
}
const { browser, shard, retries } = options;
if (
  !['chromium', 'firefox', 'webkit'].includes(browser) ||
  (suite === 'site' && browser !== 'chromium')
)
  throw new Error(
    `The ${suite}'s browser tests run in ${suite === 'site' ? 'chromium' : 'chromium, firefox or webkit'}: ${browser}`,
  );

/** Runs a command; `required` stops the run at a failure, else it fails the run at its end. */
let failed = false;
const run = (command: string[], env: Record<string, string> = {}, required = true) => {
  const [file, ...args] = command as [string, ...string[]];
  const result = spawnSync(file, args, {
    cwd: repositoryRoot,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status === 0) return;
  if (required) process.exit(result.status ?? 1);
  failed = true;
};
const folder = `tests/browser/${suite}/`;
// The library's few specs, its hydration, run whole in its first shard, so only that shard builds
// the library for them; the site's split by test. A shard may hold none of a runner's tests.
const shardIndex = shard?.split('/')[0];
const playwrightShard = suite === 'library' ? undefined : shard;
const playwrightRuns = suite !== 'library' || !shard || shardIndex === '1';
const playwright = [
  ...bin.playwright,
  'test',
  `--project=${browser}`,
  ...(playwrightShard ? [`--shard=${playwrightShard}`, '--pass-with-no-tests'] : []),
  ...(retries ? [`--retries=${retries}`] : []),
  folder,
];

if (options.build && suite === 'site') run([...bin.npm, 'run', '-s', 'build:site']);
// Only Chromium opens the hydration page, and only the shard that holds its spec needs the build.
if (options.build && suite === 'library' && browser === 'chromium' && playwrightRuns) {
  const listed = spawnSync(playwright[0]!, [...playwright.slice(1), '--list', ...passed], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, ENVUI_SERVERS: 'none' },
  });
  if (listed.status !== 0 || /\bHydration\.spec\.ts\b/.test(listed.stdout)) {
    run([...bin.node, 'scripts/build/BuildLibrary.ts']);
    run([...bin.node, '--test', '--test-reporter=dot', 'tests/library/Hydration.test.mjs']);
  }
}

if (suite === 'library')
  run(
    [
      ...bin.vitest,
      'run',
      '--config',
      'tests/component/vitest.config.ts',
      // Chromium's files that emulate touch are projects of their own (vitest.config.ts).
      `--project=${browser === 'chromium' ? 'chromium*' : browser}`,
      // The accessibility scan of the fixtures runs in `npm run test:a11y`.
      `--tags-filter=${browser === 'chromium' ? '!a11y' : 'engines'}`,
      ...vitestPassed,
      ...(shard ? [`--shard=${shard}`, '--passWithNoTests'] : []),
      ...(retries ? [`--retry=${retries}`] : []),
    ],
    {},
    false,
  );
const specs = [...specPaths(repositoryRoot)]
  .filter(([, path]) => path.startsWith(folder))
  .map(([name]) => name);
if (playwrightRuns)
  run([...playwright, ...passed], { ENVUI_SERVERS: serversFor(specs).join(',') || 'none' }, false);
process.exit(failed ? 1 : 0);
