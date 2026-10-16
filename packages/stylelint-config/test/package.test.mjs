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
  // A consumer inside the repository, so that the peer dependency resolves to the root's Stylelint.
  await mkdir(join(repository, '.cache'), { recursive: true });
  consumerDirectory = await mkdtemp(join(repository, '.cache', 'stylelint-config-consumer-'));
  const installed = join(consumerDirectory, 'node_modules/@envsemble/stylelint-config-envui');
  for (const { path } of packed.files)
    await cp(join(packageDirectory, path), join(installed, path), { recursive: true });
});

after(async () => {
  if (consumerDirectory) await rm(consumerDirectory, { recursive: true, force: true });
});

test('the package ships the config, its plugin, its token names and its documentation, and nothing else', () => {
  const files = packed.files.map(({ path }) => path.replaceAll('\\', '/')).sort();
  assert.deepEqual(files, [
    'README.md',
    'data/tokens.json',
    'index.js',
    'package.json',
    'plugins/no-private-classes.js',
    'tokens.js',
  ]);
});

test('an application extends the installed config by name', async () => {
  const script = join(consumerDirectory, 'Consumer.mjs');
  await writeFile(
    script,
    `
    import stylelint from 'stylelint';
    const { results } = await stylelint.lint({
      code: '.card .env-card-title { color: #fff; padding: 16px; z-index: 3; }',
      config: { extends: ['@envsemble/stylelint-config-envui'] },
      configBasedir: process.cwd(),
    });
    console.log(JSON.stringify(results[0].warnings.map((warning) => warning.rule).sort()));
  `,
  );
  assert.deepEqual(JSON.parse(run([script], consumerDirectory)), [
    'color-no-hex',
    'declaration-property-value-allowed-list',
    'envui/no-private-classes',
    'unit-disallowed-list',
  ]);
});
