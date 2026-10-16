import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// The library's style sheet ships in cascade layers, and names its custom properties with the
// --env- prefix. tests/browser/CascadeLayers.spec.ts checks the cascade in browsers.

const styles = fileURLToPath(new URL('../packages/ui/src/styles/', import.meta.url));
const layerOrder = ['env.reset', 'env.tokens', 'env.base', 'env.components', 'env.utilities'];

/** The top-level statements of a style sheet: at-rule preludes and selectors, comments dropped. */
function topLevel(css) {
  const statements = [];
  let depth = 0;
  let text = '';
  let quote = null;
  for (const character of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
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

/** The bundled style sheet, as scripts/BuildLibrary.mjs writes dist/styles.css. */
async function bundled() {
  const result = await build({
    entryPoints: [join(styles, 'index.css')],
    bundle: true,
    write: false,
    loader: { '.woff2': 'file' },
    assetNames: 'assets/[name]',
    outfile: join(styles, 'out.css'),
    logLevel: 'silent',
  });
  return result.outputFiles.find((file) => file.path.endsWith('.css')).text;
}

test('the shipped style sheet puts every rule in a cascade layer of env, in order', async () => {
  const statements = topLevel(await bundled());
  assert.deepEqual(statements[0], { prelude: `@layer ${layerOrder.join(', ')}`, block: false });
  // The font face is no style rule: cascade layers don't order it.
  const rules = statements.slice(1).filter(({ prelude }) => prelude !== '@font-face');
  assert.equal(statements.length - rules.length, 2, 'One font face besides the layer order');
  const unlayered = rules.filter(
    ({ prelude, block }) => !block || !/^@layer env\.[a-z]+$/.test(prelude),
  );
  assert.deepEqual(unlayered, [], 'Every rule is inside @layer env.…');
  const used = new Set(rules.map(({ prelude }) => prelude.slice('@layer '.length)));
  for (const layer of used) assert.ok(layerOrder.includes(layer), `${layer} is one of envUI's`);
});

test('index.css imports every style sheet into a layer of env', async () => {
  const index = await readFile(join(styles, 'index.css'), 'utf8');
  const imports = [...index.matchAll(/^@import '\.\/([\w.]+)'(.*);$/gm)];
  const files = (await readdir(styles)).filter(
    (file) => file.endsWith('.css') && file !== 'index.css',
  );
  assert.deepEqual(imports.map(([, file]) => file).sort(), files.sort());
  for (const [, file, rest] of imports)
    assert.match(rest, /^ layer\(env\.(?:reset|tokens|base|components|utilities)\)$/, file);
  // Nothing is imported twice.
  assert.equal(new Set(imports.map(([, file]) => file)).size, imports.length);
});

test("the library's custom properties take the --env- prefix", async () => {
  // Base UI's positioners set these on the popup inside; envUI only reads them.
  const baseUi = new Set([
    '--anchor-height',
    '--anchor-width',
    '--available-height',
    '--available-width',
    '--transform-origin',
  ]);
  const problems = [];
  for (const file of await readdir(styles)) {
    if (!file.endsWith('.css')) continue;
    const css = (await readFile(join(styles, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [name] of css.matchAll(/(?<![\w-])--[a-z][\w-]*/g))
      if (!name.startsWith('--env-') && !baseUi.has(name)) problems.push(`${name} in ${file}`);
  }
  assert.deepEqual([...new Set(problems)], []);
});
