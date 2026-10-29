// settings.envui.reexportModules: where a path entry is read from, and how it matches imports.
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import rule from '../src/rules/no-html-elements.js';

/** An application whose `src/ui/index.ts` re-exports envUI. */
const fixture = fileURLToPath(new URL('fixtures/app/', import.meta.url));
const app = resolve(fixture, 'src/App.js');

/**
 * The rules that report `<Menu.Root role="menu">` imported from <source>: none when the source is
 * a module that re-exports envUI, whose Menu.Root owns the role, else `no-html-elements`.
 */
function lint(reexportModules, { cwd = fixture, filename = app, source = './ui' } = {}) {
  return new Linter({ cwd })
    .verify(
      `import { Menu } from '${source}';\nconst menu = <Menu.Root role="menu" />;`,
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

/** What a source that matches an entry reports: nothing. */
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

test('a path entry that names no module is a configuration error', () => {
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
  // An alias is not a path, and names no file to look for.
  assert.deepEqual(lint(['@/components/ui']), ['envui/no-html-elements']);
});

test('a module reached through a link matches its real path', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'envui-settings-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const link = join(directory, 'app');
  // A junction needs no privileges on Windows; elsewhere the type is ignored.
  symlinkSync(fixture, link, 'junction');
  // A file under the link imports the module the entry names by its real path, and the other way.
  const linked = { cwd: directory, filename: join(link, 'src/App.js') };
  assert.deepEqual(lint([resolve(fixture, 'src/ui')], linked), matched);
  assert.deepEqual(lint([join(link, 'src/ui')]), matched);
});

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
