import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const packageDirectory = fileURLToPath(new URL('../', import.meta.url));
const repository = resolve(packageDirectory, '../..');
let packed;
let consumerDirectory;

/** npm's CLI script, also when the tests run without npm. */
function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    ...(process.env.PATH ?? '')
      .split(delimiter)
      .map((directory) => join(directory, 'node_modules/npm/bin/npm-cli.js')),
  ];
  const candidate = candidates.find((path) => path?.endsWith('.js') && existsSync(path));
  assert.ok(candidate, 'Run these tests through npm test, or with npm installed beside Node.');
  return candidate;
}

function run(args, cwd) {
  return execFileSync(process.execPath, args, {
    cwd,
    encoding: 'utf8',
    env: Object.fromEntries(Object.entries(process.env).filter(([name]) => !/^npm_/i.test(name))),
  });
}

before(async () => {
  const result = JSON.parse(
    run(
      [npmCli(), 'pack', '--dry-run', '--json', '--ignore-scripts', '--loglevel=error'],
      packageDirectory,
    ),
  );
  // A list, or an object by package name when npm packs inside a workspace.
  [packed] = Array.isArray(result) ? result : Object.values(result);
  // A consumer inside the repository, so that the peer dependency resolves to the root's ESLint.
  await mkdir(join(repository, '.cache'), { recursive: true });
  consumerDirectory = await mkdtemp(join(repository, '.cache', 'eslint-plugin-consumer-'));
  const installed = join(consumerDirectory, 'node_modules/@envsemble/eslint-plugin-envui');
  for (const { path } of packed.files)
    await cp(join(packageDirectory, path), join(installed, path), { recursive: true });
});

after(async () => {
  if (consumerDirectory) await rm(consumerDirectory, { recursive: true, force: true });
});

test('the package ships the plugin, its data and its documentation, and nothing else', () => {
  const files = packed.files.map(({ path }) => path.replaceAll('\\', '/')).sort();
  assert.deepEqual(files, [
    'README.md',
    'index.d.ts',
    'package.json',
    'src/data/elements.json',
    'src/data/renames.json',
    'src/data/tokens.json',
    'src/index.js',
    'src/rules/no-html-elements.js',
    'src/rules/no-private-classes.js',
    'src/rules/no-raw-colors.js',
    'src/rules/no-renamed-exports.js',
    'src/tokens.js',
    'src/utilities.js',
  ]);
});

test('an application lints with the installed recommended config', async () => {
  const script = join(consumerDirectory, 'Consumer.mjs');
  await writeFile(
    script,
    `
    import { Linter } from 'eslint';
    import envui from '@envsemble/eslint-plugin-envui';
    import { createRequire } from 'node:module';
    const location = createRequire(import.meta.url).resolve('@envsemble/eslint-plugin-envui');
    const code = "import { Notice } from '@envsemble/envui';\\n" +
      "export const App = () => <form style={{ color: '#000' }} className='env-card'><button /></form>;";
    const messages = new Linter().verify(code, [envui.configs.recommended], 'App.jsx');
    console.log(JSON.stringify({ location, rules: messages.map((message) => message.ruleId ?? message.message) }));
  `,
  );
  const { location, rules } = JSON.parse(run([script], consumerDirectory));
  assert.ok(
    location.startsWith(consumerDirectory),
    `the package resolves from the consumer: ${location}`,
  );
  assert.deepEqual(rules, [
    'envui/no-renamed-exports',
    'envui/no-raw-colors',
    'envui/no-private-classes',
    'envui/no-html-elements',
  ]);
});
