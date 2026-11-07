import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// envUI draws no drop shadows: sheets, toasts and tooltips separate by their fill, their edge and,
// for modals, the backdrop. Rings drawn with box-shadow stay: focus rings and halos
// (no offset, no blur), inset edges and selection bars, and a hairline line one pixel below or
// beside a box. This test reads the shipped style sheet, dev mode's own and the catalogue's, and
// rejects every other shadow, also one a custom property carries into box-shadow. The library has
// two exceptions, by request: the faint, small shadow under an avatar,
// `--env-avatar-shadow` (Avatar.css), so stacked avatars part from one another; and the soft shadow
// of the frosted popups, `--env-popup-shadow` (Popup.css), which keeps a translucent popup's edge
// where it crosses an area of its own color, gone wherever the popup is solid; dialogs, which take
// the popups' fill, cast it too; and the soft shadow under a segmented control's chosen segment,
// `--env-segmented-control-shadow` (SegmentedControl.css), the raised thumb that rises out of its
// track, which an edge replaces at high contrast. They are the only
// custom properties of envUI that are shadows, and no token is one. The catalogue has
// one exception, by request: the very faint shadow its example canvases, tiles and its own cards
// take, `--catalogue-card-shadow`, and half of it for a small card, `--catalogue-card-shadow-subtle`, and a stronger one for cards laid over one another,
// `--catalogue-card-shadow-raised`, and the canvases' own, `--catalogue-card-shadow-recessed`, gone in the dark themes
// (Stage.css), a device of the documentation that envUI never ships.

const root = fileURLToPath(new URL('../', import.meta.url));
const styles = join(root, 'packages/ui/src/styles');

/** The bundled style sheet, as scripts/build/BuildLibrary.ts writes dist/styles.css. */
async function shipped() {
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

/**
 * The library's drop shadows: under avatars, under frosted popups and
 * tooltips, and under a segmented control's chosen segment.
 */
const avatarShadow = '--env-avatar-shadow';
const popupShadow = '--env-popup-shadow';
const tooltipShadow = '--env-tooltip-shadow';
const segmentShadow = '--env-segmented-control-shadow';
const libraryShadows = [avatarShadow, popupShadow, tooltipShadow, segmentShadow];

test('no envUI style sheet draws a drop shadow but the avatars’, the popups’, the tooltips’ and the chosen segment’s; rings stay', async () => {
  const library = { allowed: libraryShadows };
  assert.deepEqual(problems([await shipped()], library), [], 'The shipped style sheet');
  assert.deepEqual(
    problems([await shipped(), await devMode()], library),
    [],
    'Dev mode’s style sheet',
  );
  assert.deepEqual(
    problems(await catalogue(), {
      allowed: [
        '--catalogue-card-shadow',
        '--catalogue-card-shadow-subtle',
        '--catalogue-card-shadow-raised',
        '--catalogue-card-shadow-recessed',
      ],
    }),
    [],
    'The catalogue’s style sheets',
  );
});

test('no token or custom property is a shadow but the avatars’, the popups’, the tooltips’ and the chosen segment’s', async () => {
  const css = await shipped();
  const shadows = declarations(css)
    .map(([property]) => property)
    .filter((property) => /^--env-.*shadow$/.test(property));
  assert.deepEqual([...new Set(shadows)].sort(), [...libraryShadows].sort());
});

/** The values a frosted shadow takes: one in light, one in dark, and none where it is solid. */
function frostedShadows(css, name) {
  const values = [
    ...new Set(
      declarations(css)
        .filter(([property]) => property === name)
        .map(([, value]) => value.replace(/\s+/g, ' ')),
    ),
  ];
  // The light and the dark shadow, and none: at high contrast, under reduced transparency and
  // forced colors, where the popup is solid.
  assert.ok(values.includes('none'), `${name}: solid popups have no shadow`);
  const shadows = values.filter((value) => value !== 'none');
  assert.equal(shadows.length, 2, `${name}: one shadow in light, one in dark`);
  for (const value of shadows)
    for (const layer of split(value, /,/)) {
      const [x, y, blur, ...rest] = split(layer, /\s/);
      assert.equal(x, '0', 'it falls straight down');
      assert.match(y, /^\d+px$/);
      assert.match(blur, /^\d+px$/);
      // An optional negative spread, then a color derived from a token, never a literal color.
      const color = rest.at(-1);
      assert.match(color, /^oklch\(from var\(--env-color-[\w-]+\) /, layer);
      assert.ok(rest.length <= 2, layer);
    }
  return shadows;
}

/** The selectors whose box-shadow is the property `name`. */
function usersOf(css, name) {
  return [
    ...css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(new RegExp(String.raw`([^{}]+)\{[^{}]*box-shadow:\s*var\(${name}\)`, 'g')),
  ].map(([, selector]) => selector.trim().replace(/\s+/g, ' '));
}

test('the popups’ shadow is soft, follows the theme, goes where popups are solid and stays on popups', async () => {
  const css = await shipped();
  frostedShadows(css, popupShadow);
  // Only the frosted popups use it.
  assert.deepEqual(usersOf(css, popupShadow).sort(), [
    '.env-command-palette',
    '.env-popup',
    '.env-rich-text-suggestions',
    '.env-surface.env-dialog',
  ]);
});

test('the tooltips’ shadow is smaller than the popups’, goes where they are solid and stays on tooltips', async () => {
  const css = await shipped();
  const [light, dark] = frostedShadows(css, tooltipShadow);
  const [popupLight, popupDark] = frostedShadows(css, popupShadow);
  // A single layer, its blur below the popups’ largest.
  const blurOf = (value) =>
    Math.max(...split(value, /,/).map((layer) => parseFloat(split(layer, /\s/)[2])));
  for (const [tooltip, popup] of [
    [light, popupLight],
    [dark, popupDark],
  ]) {
    assert.equal(split(tooltip, /,/).length, 1, 'one layer');
    assert.ok(blurOf(tooltip) < blurOf(popup), 'smaller than a popup’s');
  }
  assert.deepEqual(usersOf(css, tooltipShadow), ['.env-tooltip']);
});

test('the avatars’ shadow is small, faint and follows the surface below', async () => {
  const css = await shipped();
  const values = [
    ...new Set(
      declarations(css)
        .filter(([property]) => property === avatarShadow)
        .map(([, value]) => value.replace(/\s+/g, ' ')),
    ),
  ];
  // Avatar.css declares it; the count of a group is flat. In a group, the group's rings take its
  // place: rings alone, with no offset and no blur.
  assert.equal(values.length, 1, 'one shadow');
  const [, ringName, shadow] = values[0].match(/^var\(\s*(--[\w-]+),\s*(.*?)\s*\)$/);
  assert.equal(ringName, '--env-avatar-group-ring-layers');
  const rings = declarations(css).filter(([property]) => property === ringName);
  assert.equal(rings.length, 1, 'AvatarGroup.css declares the rings');
  for (const layer of split(rings[0][1], /,/)) {
    const [x, y, blur] = split(layer, /\s/);
    assert.deepEqual([x, y, blur], ['0', '0', '0'], layer);
  }
  // A single layer, 1px down and blurred 2px, with no spread.
  const [x, y, blur, ...rest] = split(shadow, /\s/);
  assert.deepEqual([x, y, blur], ['0', '1px', '2px']);
  assert.equal(rest.length, 1, 'no spread, one color');
  // Its color is derived from the surface below, never a literal color.
  assert.match(rest[0], /^oklch\(\s*from var\(--env-surface-color, var\(--env-color-bg-page\)\)/);
  // Only an avatar uses it.
  const users = [
    ...css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/([^{}]+)\{[^}]*box-shadow:\s*var\(--env-avatar-shadow\)/g),
  ].map(([, selector]) => selector.trim().replace(/\s+/g, ' '));
  assert.deepEqual(users, ['.env-avatar']);
});

test('the chosen segment’s shadow is small, follows the theme, gives way at high contrast and stays on it', async () => {
  const css = await shipped();
  const values = [
    ...new Set(
      declarations(css)
        .filter(([property]) => property === segmentShadow)
        .map(([, value]) => value.replace(/\s+/g, ' ')),
    ),
  ];
  assert.equal(values.length, 1, 'one declaration');
  // The high-contrast edge first, then the shadow and a hairline ring as its fallback.
  const [edge, ...layers] = split(values[0].replace(/^var\(|\)$/g, ''), /,/);
  assert.equal(edge, '--env-segmented-control-high-contrast-edge');
  assert.equal(layers.length, 2, 'a shadow and a hairline');
  const [drop, ring] = layers.map((layer) => split(layer, /\s/));
  // 1px down, blurred 2px, with no spread, in a color derived from a token.
  assert.deepEqual(drop.slice(0, 3), ['0', '1px', '2px']);
  assert.equal(drop.length, 4, 'no spread, one color');
  assert.match(drop[3], /^oklch\(from var\(--env-color-[\w-]+\) /);
  // The hairline is a ring, with no offset or blur.
  assert.deepEqual(ring.slice(0, 3), ['0', '0', '0']);
  assert.equal(dropShadow(layers[1]), null);
  // The edge is valid only under high contrast (Theme.css's switch), and an inset ring.
  const [edgeValue] = declarations(css)
    .filter(([property]) => property === '--env-segmented-control-high-contrast-edge')
    .map(([, value]) => value.replace(/\s+/g, ' '));
  assert.match(edgeValue, /^var\(--env-theme-high-contrast\) inset 0 0 0 /);
  // The chosen segment, and the thumb that travels to it.
  assert.deepEqual(usersOf(css, segmentShadow), [
    '.env-segmented-control-item[data-checked]',
    '.env-segmented-control-thumb:not([hidden])',
  ]);
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
