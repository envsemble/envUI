import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import rule from '../src/rules/no-html-elements.js';
import { inScratchFolder } from '../../../tests/support/ScratchFolder.ts';

const fixture = fileURLToPath(new URL('fixtures/app/', import.meta.url));
const app = resolve(fixture, 'src/App.js');

function lint(reexportModules, { cwd = fixture, filename = app, source = './ui' } = {}) {
  return new Linter({ cwd })
    .verify(
      `import { Table } from '${source}';\nconst table = <Table.Root role="table" />;`,
      {
        plugins: { envui: { rules: { 'no-html-elements': rule } } },
        languageOptions: { sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
        settings: { envui: { reexportModules } },
        rules: { 'envui/no-html-elements': 'error' },
      },
      filename,
    )
    .map((message) => message.ruleId ?? message.message);
}

const matched = [];

test('an absolute entry matches from any working directory', () => {
  const elsewhere = resolve(fixture, '..');
  assert.deepEqual(lint([resolve(fixture, 'src/ui')], { cwd: elsewhere }), matched);
  assert.deepEqual(lint([resolve(fixture, 'src/ui/index.ts')], { cwd: elsewhere }), matched);
  assert.deepEqual(lint([resolve(fixture, 'src/ui/')], { cwd: elsewhere }), matched);
});

test('a relative entry is read from the working directory', () => {
  assert.deepEqual(lint(['./src/ui']), matched);
  assert.deepEqual(lint(['./src/ui/index'], { source: './ui.ts' }), matched);
  assert.deepEqual(lint(['./ui'], { cwd: resolve(fixture, 'src') }), matched);
});

test('a path entry that names no module is a configuration error, and an alias names no file to look for', () => {
  const elsewhere = resolve(fixture, '..');
  const missing = resolve(elsewhere, 'src/ui');
  assert.throws(
    () => lint(['./src/ui'], { cwd: elsewhere }),
    (error) =>
      error.message.includes("settings.envui.reexportModules entry './src/ui'") &&
      error.message.includes(missing) &&
      error.message.includes(`working directory, ${elsewhere}`) &&
      error.message.includes('path.resolve(import.meta.dirname'),
  );
  assert.throws(() => lint([resolve(fixture, 'src/missing')]), /names no module/);
  assert.deepEqual(lint(['@/components/ui']), ['envui/no-html-elements']);
});

test('a module reached through a link matches its real path, from either side of the link', () =>
  inScratchFolder('settings', (directory) => {
    const link = join(directory, 'app');
    symlinkSync(fixture, link, 'junction');
    const linked = { cwd: directory, filename: join(link, 'src/App.js') };
    assert.deepEqual(lint([resolve(fixture, 'src/ui')], linked), matched);
    assert.deepEqual(lint([join(link, 'src/ui')]), matched);
  }));

test(
  'Windows paths match whatever the case of the drive letter',
  { skip: process.platform !== 'win32' },
  () => {
    const swap = (path) =>
      path.replace(/^[a-z]:/i, (drive) =>
        drive === drive.toUpperCase() ? drive.toLowerCase() : drive.toUpperCase(),
      );
    const entry = resolve(fixture, 'src/ui');
    for (const [entryPath, filename] of [
      [swap(entry), app],
      [entry, swap(app)],
      [swap(entry).toUpperCase(), app],
    ])
      assert.deepEqual(lint([entryPath], { filename }), matched, `${entryPath} from ${filename}`);
    assert.deepEqual(lint(['./src/ui'], { cwd: swap(fixture), filename: app }), matched);
  },
);
