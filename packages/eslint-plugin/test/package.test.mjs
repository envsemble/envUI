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
    'src/data/vocabulary.json',
    'src/index.js',
    'src/rules/label-vocabulary.js',
    'src/rules/no-field-in-list-row.js',
    'src/rules/no-html-elements.js',
    'src/rules/no-link-in-clickable-row.js',
    'src/rules/no-raw-colors.js',
    'src/rules/no-raw-graphics.js',
    'src/tokens.js',
    'src/utilities.js',
  ]);
});

test('an application lints with the installed recommended and strict configs', async () => {
  const script = join(packed.directory, 'Consumer.mjs');
  await writeFile(
    script,
    `
    import { Linter } from 'eslint';
    import envui from '@envsemble/eslint-plugin-envui';
    import { createRequire } from 'node:module';
    const location = createRequire(import.meta.url).resolve('@envsemble/eslint-plugin-envui');
    const code = "import { Alert } from '@envsemble/envui';\\n" +
      "export const App = () => <form style={{ color: '#000', display: 'grid' }}><button>Save</button><Button>Proceed</Button><img src='https://cdn.example/logo.png' alt='' /></form>;";
    const rules = (config) => new Linter().verify(code, [config], 'App.jsx').map((message) => message.ruleId ?? message.message);
    console.log(JSON.stringify({ location, recommended: rules(envui.configs.recommended), strict: rules(envui.configs.strict) }));
  `,
  );
  const { location, recommended, strict } = JSON.parse(runNode(script, [], packed.directory));
  assert.ok(
    location.startsWith(packed.directory),
    `the package resolves from the consumer: ${location}`,
  );
  assert.deepEqual(recommended, ['envui/no-raw-colors', 'envui/no-raw-graphics']);
  assert.deepEqual(strict, [
    'envui/no-raw-colors',
    'envui/no-html-elements',
    'envui/label-vocabulary',
    'envui/no-raw-graphics',
  ]);
});
