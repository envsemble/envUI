// `npm run test:library` and `npm run test:site`: the library's browser tests in one engine, and the
// site's smoke and hydration specs in Chromium. They are the one command CI and `npm run verify`
// run each suite by, so the runner behind a suite can change without them.
//
//   node scripts/test/TestBrowser.ts <library|site> [--browser chromium|firefox|webkit]
//                                     [--shard <i>/<n>] [--no-build] [Playwright arguments]
//
// --browser    the library's engine (default chromium); Firefox and WebKit run its @engines tests
// --shard      runs the i-th of n equal parts, for CI's parallel jobs
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

// Its own options, as --name value or --name=value; what it does not read goes to Playwright.
const passed: string[] = [];
const options: { browser: string; shard?: string; build: boolean } = {
  browser: 'chromium',
  build: true,
};
for (let index = 0; index < argv.length; index++) {
  const [name, inline] = argv[index]!.split(/=(.*)/s, 2) as [string, string | undefined];
  if (name === '--no-build') options.build = false;
  else if (name === '--browser' || name === '--shard') {
    const value = inline ?? argv[++index];
    if (!value) throw new Error(`${name} needs a value`);
    options[name === '--browser' ? 'browser' : 'shard'] = value;
  } else passed.push(argv[index]!);
}
const { browser, shard } = options;
if (
  !['chromium', 'firefox', 'webkit'].includes(browser) ||
  (suite === 'site' && browser !== 'chromium')
)
  throw new Error(
    `The ${suite}'s browser tests run in ${suite === 'site' ? 'chromium' : 'chromium, firefox or webkit'}: ${browser}`,
  );

const run = (command: string[], env: Record<string, string> = {}) => {
  const [file, ...args] = command as [string, ...string[]];
  const result = spawnSync(file, args, {
    cwd: repositoryRoot,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
const folder = `tests/browser/${suite}/`;
const playwright = [
  ...bin.playwright,
  'test',
  `--project=${browser}`,
  ...(shard ? [`--shard=${shard}`] : []),
  folder,
];

if (options.build && suite === 'site') run([...bin.npm, 'run', '-s', 'build:site']);
// Only Chromium opens the hydration page, and only the shard that holds its spec needs the build.
if (options.build && suite === 'library' && browser === 'chromium') {
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

const specs = [...specPaths(repositoryRoot)]
  .filter(([, path]) => path.startsWith(folder))
  .map(([name]) => name);
run([...playwright, ...passed], { ENVUI_SERVERS: serversFor(specs).join(',') || 'none' });
