// settings.envui.reexportModules: where a path entry is read from, and how it matches imports.
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import rule from '../src/rules/no-renamed-exports.js';

/** An application whose `src/ui/index.ts` re-exports envUI. */
const fixture = fileURLToPath(new URL('fixtures/app/', import.meta.url));
const app = resolve(fixture, 'src/App.js');

/** The rules that report `import { Input } from <source>`: `no-renamed-exports` when it matches. */
function lint(reexportModules, { cwd = fixture, filename = app, source = './ui' } = {}) {
  return new Linter({ cwd })
    .verify(
      `import { Input } from '${source}';`,
      {
        plugins: { envui: { rules: { 'no-renamed-exports': rule } } },
        languageOptions: { sourceType: 'module' },
        settings: { envui: { reexportModules } },
        rules: { 'envui/no-renamed-exports': 'error' },
      },
      filename,
    )
    .map((message) => message.ruleId ?? message.message);
}

const reported = ['envui/no-renamed-exports'];

test('an absolute entry matches from any working directory', () => {
  const elsewhere = resolve(fixture, '..');
  assert.deepEqual(lint([resolve(fixture, 'src/ui')], { cwd: elsewhere }), reported);
  assert.deepEqual(lint([resolve(fixture, 'src/ui/index.ts')], { cwd: elsewhere }), reported);
  assert.deepEqual(lint([resolve(fixture, 'src/ui/')], { cwd: elsewhere }), reported);
});

test('a relative entry is read from the working directory', () => {
  assert.deepEqual(lint(['./src/ui']), reported);
  assert.deepEqual(lint(['./src/ui/index'], { source: './ui.ts' }), reported);
  assert.deepEqual(lint(['./ui'], { cwd: resolve(fixture, 'src') }), reported);
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
  assert.deepEqual(lint(['@/components/ui']), []);
});
