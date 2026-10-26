import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// envUI draws no drop shadows: popups, dialogs, sheets, toasts and tooltips separate by their fill,
// their edge and, for modals, the scrim. Rings drawn with box-shadow stay: focus rings and halos
// (no offset, no blur), inset edges and selection bars, and a hairline line one pixel below or
// beside a box. This test reads the shipped style sheet, dev mode's own and the catalogue's, and
// rejects every other shadow, also one a custom property carries into box-shadow. The catalogue has
// one exception, by request: the very faint shadow its example canvases, tiles and its own cards
// take, `--catalogue-card-shadow`, and half of it for a small card, `--catalogue-card-shadow-subtle`
// (Stage.css), a device of the documentation that envUI never ships.

const root = fileURLToPath(new URL('../', import.meta.url));
const styles = join(root, 'packages/ui/src/styles');

/** The bundled style sheet, as scripts/build/BuildLibrary.ts writes dist/styles.css. */
async function shipped() {
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

/** Dev mode's style sheet, the template literal of packages/ui/src/dev/ui/styles.ts. */
async function devMode() {
  const source = await readFile(join(root, 'packages/ui/src/dev/ui/styles.ts'), 'utf8');
  const css = source.match(/\/\* css \*\/ `([\s\S]*?)`/)?.[1];
  assert.ok(css, 'styles.ts holds dev mode’s style sheet');
  return css;
}

async function catalogue() {
  const folder = join(root, 'apps/site/src/styles');
  const files = (await readdir(folder)).filter((name) => name.endsWith('.css'));
  return Promise.all(files.map((name) => readFile(join(folder, name), 'utf8')));
}

/** Every declaration of a style sheet, comments dropped, as [property, value]. */
function declarations(css) {
  const found = [];
  const pattern = /(?:^|[{;])\s*(-{0,2}[a-zA-Z][\w-]*)\s*:\s*([^;{}]+)/g;
  for (const [, property, value] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(pattern))
    found.push([property, value.trim()]);
  return found;
}

/** Splits `value` at `separator` outside parentheses. */
function split(value, separator) {
  const parts = [];
  let depth = 0;
  let part = '';
  for (const character of value) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (depth === 0 && separator.test(character)) {
      if (part.trim()) parts.push(part.trim());
      part = '';
    } else part += character;
  }
  if (part.trim()) parts.push(part.trim());
  return parts;
}

/** Every value `value` can take, its var() replaced by each value declared for it or its fallback. */
function expand(value, properties, depth = 0) {
  const start = value.indexOf('var(');
  if (start < 0 || depth > 8) return [value];
  let end = start + 4;
  for (let open = 1; open > 0; end += 1) {
    if (value[end] === '(') open += 1;
    if (value[end] === ')') open -= 1;
  }
  const [name, ...rest] = split(value.slice(start + 4, end - 1), /,/);
  const fallback = rest.length ? rest.join(', ') : null;
  const candidates = [...(properties.get(name.trim()) ?? [])];
  if (fallback !== null) candidates.push(fallback.trim());
  if (!candidates.length) candidates.push(`unresolved(${name.trim()})`);
  return [...new Set(candidates)].flatMap((candidate) =>
    expand(value.slice(0, start) + candidate + value.slice(end), properties, depth + 1),
  );
}

const length = /^(-?[\d.]+)(px|rem|em)?$/;
const pixels = (token) => {
  const [, number, unit] = token.match(length);
  return Number(number) * (unit === 'rem' || unit === 'em' ? 16 : 1);
};

/** Why one layer of a box-shadow is a drop shadow, or null for a ring, an inset edge or a hairline. */
function dropShadow(layer) {
  const tokens = split(layer, /\s/);
  if (tokens.some((token) => token.startsWith('unresolved(')))
    return 'it reads a property no sheet declares';
  const inset = tokens.includes('inset');
  const lengths = tokens.filter((token) => length.test(token) || token.startsWith('calc('));
  if (lengths.some((token) => token.startsWith('calc(')))
    return inset ? null : 'it computes its offsets';
  const [x = 0, y = 0, blur = 0, spread = 0] = lengths.map(pixels);
  if (blur !== 0) return 'it blurs';
  if (inset || (x === 0 && y === 0)) return null;
  // A line one pixel beside the box, such as an underline or a header's hairline.
  if (
    spread === 0 &&
    Math.min(Math.abs(x), Math.abs(y)) === 0 &&
    Math.max(Math.abs(x), Math.abs(y)) <= 1
  )
    return null;
  return 'it is offset';
}

function problems(sheets, { allowed = [] } = {}) {
  const all = sheets
    .flatMap(declarations)
    .filter(
      ([property, value]) => !allowed.some((name) => property === name || value === `var(${name})`),
    );
  const properties = new Map();
  for (const [property, value] of all)
    if (property.startsWith('--'))
      properties.set(property, [...(properties.get(property) ?? []), value]);
  const found = [];
  for (const [property, value] of all) {
    if (/^(-webkit-)?box-shadow$/.test(property)) {
      for (const expanded of expand(value, properties)) {
        if (/^(none|initial|inherit|unset|revert|revert-layer)$/.test(expanded)) continue;
        for (const layer of split(expanded, /,/)) {
          const reason = dropShadow(layer);
          if (reason) found.push(`${property}: ${value} (as ${layer}): ${reason}`);
        }
      }
    } else if (property === 'text-shadow' && value !== 'none') {
      found.push(`${property}: ${value}`);
    } else if (/^(-webkit-)?(backdrop-)?filter$/.test(property)) {
      for (const expanded of expand(value, properties))
        if (/drop-shadow\(/.test(expanded)) found.push(`${property}: ${value}`);
    }
  }
  return [...new Set(found)];
}

test('no envUI style sheet draws a drop shadow; rings stay', async () => {
  assert.deepEqual(problems([await shipped()]), [], 'The shipped style sheet');
  assert.deepEqual(problems([await shipped(), await devMode()]), [], 'Dev mode’s style sheet');
  assert.deepEqual(
    problems(await catalogue(), {
      allowed: ['--catalogue-card-shadow', '--catalogue-card-shadow-subtle'],
    }),
    [],
    'The catalogue’s style sheets',
  );
});

test('no token or custom property is a shadow', async () => {
  const css = await shipped();
  const shadows = declarations(css)
    .map(([property]) => property)
    .filter((property) => /^--env-.*shadow$/.test(property));
  assert.deepEqual([...new Set(shadows)], []);
});

test('the check tells drop shadows from rings', () => {
  const properties = new Map([['--ring', ['0.125rem']]]);
  const check = (value) =>
    problems([`--ring: ${properties.get('--ring')[0]}; .a { box-shadow: ${value}; }`]).length === 0;
  // Rings, inset edges, selection bars and hairlines stay.
  assert.ok(check('0 0 0 var(--ring) blue'));
  assert.ok(check('inset 0 0 0 1px red, inset 0 0 0 1px red'));
  assert.ok(check('inset 0.1875rem 0 0 blue'));
  assert.ok(check('0 0.0625rem 0 gray'));
  assert.ok(check('none'));
  // Drop shadows don't.
  assert.ok(!check('0 1px 2px 0 rgb(0 0 0 / 0.3)'));
  assert.ok(!check('0 0.25rem 0 0 black'));
  assert.ok(!check('0 0 0.5rem blue'));
  assert.ok(!check('var(--missing)'));
  assert.ok(problems(['.a { filter: drop-shadow(0 1px 2px black); }']).length === 1);
  assert.ok(problems(['.a { text-shadow: 0 1px black; }']).length === 1);
});
