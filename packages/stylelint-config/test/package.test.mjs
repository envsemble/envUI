import assert from 'node:assert/strict';
import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { installAsPacked, runNode } from '../../../tests/support/Npm.mjs';

let packed;

before(async () => {
  packed = await installAsPacked(fileURLToPath(new URL('../', import.meta.url)));
});

after(async () => {
  if (packed) await rm(packed.directory, { recursive: true, force: true });
});

test('the package ships the config, its color policy, its token names and its documentation, and nothing else', () => {
  assert.deepEqual(packed.files, [
    'CHANGELOG.md',
    'README.md',
    'package.json',
    'src/colorPolicy.js',
    'src/data/tokens.json',
    'src/index.js',
    'src/tokens.js',
  ]);
});

test('an application extends the installed config by name', async () => {
  const script = join(packed.directory, 'Consumer.mjs');
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
  assert.deepEqual(JSON.parse(runNode(script, [], packed.directory)), [
    'color-no-hex',
    'declaration-property-value-allowed-list',
    'unit-disallowed-list',
  ]);
});
