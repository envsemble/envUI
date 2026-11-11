import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { build } from 'esbuild';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

// The library's style sheet ships in cascade layers, and names its custom properties with the
// --env- prefix. tests/component/CascadeLayers.test.tsx checks the cascade in browsers.

const styles = join(repositoryRoot, 'packages/ui/src/styles/');
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

/** The bundled style sheet, as scripts/build/BuildLibrary.ts writes dist/styles.css. */
async function bundled() {
  const result = await build({
    entryPoints: [join(styles, 'index.css')],
    bundle: true,
    write: false,
    loader: { '.woff2': 'file', '.svg': 'file' },
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
  // A style sheet without rules yet, imported into a layer, bundles to a bare `@layer env.…;`.
  const unlayered = rules.filter(({ prelude }) => !/^@layer env\.[a-z]+$/.test(prelude));
  assert.deepEqual(unlayered, [], 'Every rule is inside @layer env.…');
  const used = new Set(rules.map(({ prelude }) => prelude.slice('@layer '.length)));
  for (const layer of used) assert.ok(layerOrder.includes(layer), `${layer} is one of envUI's`);
});

test('every style sheet is imported once and puts its rules in a layer of env', async () => {
  const importsOf = async (file) => [
    ...(await readFile(join(styles, file), 'utf8')).matchAll(/^@import '\.\/([\w.]+)'(.*);$/gm),
  ];
  const index = await importsOf('index.css');
  const base = await importsOf('Base.css');
  // index.css starts with the base, which declares the layer order, and then takes every other
  // style sheet as it is.
  assert.equal(index[0][1], 'Base.css');
  const files = (await readdir(styles)).filter(
    (file) => file.endsWith('.css') && file !== 'index.css',
  );
  const imported = [...index, ...base].map(([, file]) => file);
  assert.deepEqual([...imported].sort(), files.sort());
  // Nothing is imported twice.
  assert.equal(new Set(imported).size, imported.length);
  const layer = /^ layer\(env\.(?:reset|tokens|base|components|utilities)\)$/;
  for (const [, file, rest] of [...index, ...base]) {
    if (rest) {
      // The base's own parts, which nothing else loads, take their layer as Base.css imports them.
      assert.ok(
        base.some(([, part]) => part === file),
        `${file} takes its layer from Base.css`,
      );
      assert.match(rest, layer, file);
      continue;
    }
    if (file === 'Base.css') continue;
    // Every other style sheet, which a component's module imports on its own, is one block in
    // env.components.
    const statements = topLevel(await readFile(join(styles, file), 'utf8'));
    assert.deepEqual(statements, [{ prelude: '@layer env.components', block: true }], file);
  }
});

test("the library's custom properties take the --env- prefix", async () => {
  // Base UI's positioners set these on the popup inside, its drawer the swipe's movement and its
  // accordion and collapsible the panel's height, and its tabs' indicator the selected tab's box;
  // envUI only reads them.
  const baseUi = new Set([
    '--anchor-height',
    '--anchor-width',
    '--available-height',
    '--available-width',
    '--transform-origin',
    '--drawer-swipe-movement-x',
    '--drawer-swipe-movement-y',
    '--accordion-panel-height',
    '--collapsible-panel-height',
    '--active-tab-left',
    '--active-tab-top',
    '--active-tab-width',
    '--active-tab-height',
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
