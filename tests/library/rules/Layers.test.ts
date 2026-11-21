import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';
import { shippedStyleSheet } from '../../support/StyleSheets.ts';
import { withoutComments } from '../../../scripts/site/CssComments.ts';

const styles = styleSheetsDirectory;
const layerOrder = ['env.reset', 'env.tokens', 'env.base', 'env.components', 'env.utilities'];

function topLevel(css: string) {
  const statements: { prelude: string; block: boolean }[] = [];
  let depth = 0;
  let text = '';
  let quote = null;
  for (const character of withoutComments(css)) {
    if (quote) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === '{') {
      if (depth === 0) statements.push({ prelude: text.trim(), block: true });
      depth += 1;
      text = '';
      continue;
    } else if (character === '}') {
      depth -= 1;
      text = '';
      continue;
    } else if (character === ';' && depth === 0) {
      statements.push({ prelude: text.trim(), block: false });
      text = '';
      continue;
    }
    if (depth === 0) text += character;
  }
  return statements.filter(({ prelude }) => prelude);
}

test('the shipped style sheet puts every rule in a cascade layer of env, in order', async () => {
  const statements = topLevel(await shippedStyleSheet());
  assert.deepEqual(statements[0], { prelude: `@layer ${layerOrder.join(', ')}`, block: false });
  const rules = statements.slice(1).filter(({ prelude }) => prelude !== '@font-face');
  assert.equal(statements.length - rules.length, 2, 'One font face besides the layer order');
  const unlayered = rules.filter(({ prelude }) => !/^@layer env\.[a-z]+$/.test(prelude));
  assert.deepEqual(unlayered, [], 'Every rule is inside @layer env.…');
  const used = new Set(rules.map(({ prelude }) => prelude.slice('@layer '.length)));
  for (const layer of used) assert.ok(layerOrder.includes(layer), `${layer} is one of envUI's`);
});

test('every style sheet is imported once and puts its rules in a layer of env', async () => {
  const importsOf = async (file: string) => [
    ...(await readFile(join(styles, file), 'utf8')).matchAll(/^@import '\.\/([\w.]+)'(.*);$/gm),
  ];
  const index = await importsOf('index.css');
  const base = await importsOf('Base.css');
  assert.equal(index[0][1], 'Base.css');
  const files = (await readdir(styles)).filter(
    (file) => file.endsWith('.css') && file !== 'index.css',
  );
  const imported = [...index, ...base].map(([, file]) => file);
  assert.deepEqual([...imported].sort(), files.sort());
  assert.equal(new Set(imported).size, imported.length);
  const layer = /^ layer\(env\.(?:reset|tokens|base|components|utilities)\)$/;
  for (const [, file, rest] of [...index, ...base]) {
    if (rest) {
      assert.ok(
        base.some(([, part]) => part === file),
        `${file} takes its layer from Base.css`,
      );
      assert.match(rest, layer, file);
      continue;
    }
    if (file === 'Base.css') continue;
    const statements = topLevel(await readFile(join(styles, file), 'utf8'));
    assert.deepEqual(statements, [{ prelude: '@layer env.components', block: true }], file);
  }
});
