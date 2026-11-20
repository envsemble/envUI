import { spawnSync } from 'node:child_process';
import { serversFor } from './TestScope.ts';
import { browserTestPaths } from './BrowserTests.ts';
import { bin, componentTestCommand, playwrightCommand } from './TestTasks.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

const [suite, ...argv] = process.argv.slice(2);
if (suite !== 'library' && suite !== 'site')
  throw new Error(
    'Usage: TestBrowser.ts <library|site> [--browser chromium|firefox|webkit] [--shard <i>/<n>] [--retries <n>] [--no-build] [--api.port <port>] [Playwright arguments]',
  );

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
const shardIndex = shard?.split('/')[0];
const playwrightShard = suite === 'library' ? undefined : shard;
const playwrightRuns = suite !== 'library' || !shard || shardIndex === '1';
const playwright = playwrightCommand(
  [browser],
  [
    ...(playwrightShard ? [`--shard=${playwrightShard}`] : []),
    ...(playwrightShard || suite === 'library' ? ['--pass-with-no-tests'] : []),
    ...(retries ? [`--retries=${retries}`] : []),
    folder,
  ],
);

if (options.build && suite === 'site') run([...bin.npm, 'run', '-s', 'build:site']);
if (options.build && suite === 'library' && browser === 'chromium' && playwrightRuns) {
  const listed = spawnSync(playwright[0]!, [...playwright.slice(1), '--list', ...passed], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, ENVUI_SERVERS: 'none' },
  });
  if (listed.status !== 0 || /\bHydration\.spec\.ts\b/.test(listed.stdout)) {
    run([...bin.node, 'scripts/build/BuildLibrary.ts']);
    run([...bin.node, '--test', '--test-reporter=dot', 'tests/library/package/Hydration.test.ts']);
  }
}

if (suite === 'library')
  run(
    componentTestCommand(browser as 'chromium' | 'firefox' | 'webkit', [
      ...vitestPassed,
      ...(shard ? [`--shard=${shard}`, '--passWithNoTests'] : []),
      ...(retries ? [`--retry=${retries}`] : []),
    ]),
    {},
    false,
  );
const specs = [...browserTestPaths(repositoryRoot)]
  .filter(([, path]) => path.startsWith(folder))
  .map(([name]) => name);
if (playwrightRuns)
  run([...playwright, ...passed], { ENVUI_SERVERS: serversFor(specs).join(',') || 'none' }, false);
process.exit(failed ? 1 : 0);
