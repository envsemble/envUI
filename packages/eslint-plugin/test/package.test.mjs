import assert from 'node:assert/strict';
import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { installAsPacked, runNode } from '../../../tests/support/Npm.ts';

let packed;

before(async () => {
  packed = await installAsPacked(fileURLToPath(new URL('../', import.meta.url)));
});

after(async () => {
  if (packed) await rm(packed.directory, { recursive: true, force: true });
});

test('the package ships the plugin, its data and its documentation, and nothing else', () => {
  assert.deepEqual(packed.files, [
    'CHANGELOG.md',
    'LICENSE',
    'README.md',
    'index.d.ts',
    'package.json',
    'src/colorPolicy.js',
    'src/data/elements.json',
    'src/data/entryPoints.json',
    'src/data/tokens.json',
    'src/index.js',
    'src/rules/no-html-elements.js',
    'src/rules/no-inline-layout.js',
    'src/rules/no-raw-colors.js',
    'src/rules/no-raw-graphics.js',
    'src/tokens.js',
    'src/utilities.js',
  ]);
});

test('an application lints with the installed recommended config', async () => {
  const script = join(packed.directory, 'Consumer.mjs');
  await writeFile(
    script,
    `
    import { Linter } from 'eslint';
    import envui from '@envsemble/eslint-plugin-envui';
    import { createRequire } from 'node:module';
    const location = createRequire(import.meta.url).resolve('@envsemble/eslint-plugin-envui');
    const code = "import { Alert } from '@envsemble/envui';\\n" +
      "export const App = () => <form style={{ color: '#000', display: 'grid' }}><button /><img src='logo.png' alt='' /></form>;";
    const messages = new Linter().verify(code, [envui.configs.recommended], 'App.jsx');
    console.log(JSON.stringify({ location, rules: messages.map((message) => message.ruleId ?? message.message) }));
  `,
  );
  const { location, rules } = JSON.parse(runNode(script, [], packed.directory));
  assert.ok(
    location.startsWith(packed.directory),
    `the package resolves from the consumer: ${location}`,
  );
  assert.deepEqual(rules, [
    'envui/no-raw-colors',
    'envui/no-inline-layout',
    'envui/no-html-elements',
    'envui/no-raw-graphics',
  ]);
});
