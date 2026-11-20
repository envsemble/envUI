import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { declarations, shippedStyleSheet } from '../../support/StyleSheets.ts';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

async function catalogue() {
  const folder = join(repositoryRoot, 'apps/site/src');
  const files = (await readdir(folder, { recursive: true })).filter((name) =>
    name.endsWith('.css'),
  );
  return Promise.all(files.map((name) => readFile(join(folder, name), 'utf8')));
}

function split(value, separator) {
  const parts: string[] = [];
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
  const hairlineBesideBox =
    spread === 0 &&
    Math.min(Math.abs(x), Math.abs(y)) === 0 &&
    Math.max(Math.abs(x), Math.abs(y)) <= 1;
  if (hairlineBesideBox) return null;
  return 'it is offset';
}

function problems(sheets, { allowed = [] } = {}) {
  const all = sheets
    .flatMap(declarations)
    .filter(
      ({ prop, value }) => !allowed.some((name) => prop === name || value === `var(${name})`),
    );
  const properties = new Map();
  for (const { prop, value } of all)
    if (prop.startsWith('--')) properties.set(prop, [...(properties.get(prop) ?? []), value]);
  const found: string[] = [];
  for (const { prop: property, value } of all) {
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

const avatarShadow = '--_avatar-shadow';
const popupShadow = '--env-popup-shadow';
const tooltipShadow = '--env-tooltip-shadow';
const segmentShadow = '--_segmented-control-shadow';
const libraryShadows = [avatarShadow, popupShadow, tooltipShadow, segmentShadow];

const catalogueShadows = [
  '--catalogue-card-shadow',
  '--catalogue-card-shadow-subtle',
  '--catalogue-card-shadow-raised',
  '--catalogue-card-shadow-recessed',
];

test('no envUI style sheet draws a drop shadow but the avatars’, the popups’, the tooltips’ and the chosen segment’s; rings stay', async () => {
  const library = { allowed: libraryShadows };
  assert.deepEqual(problems([await shippedStyleSheet()], library), [], 'The shipped style sheet');
  assert.deepEqual(
    problems(await catalogue(), { allowed: catalogueShadows }),
    [],
    'The catalogue’s style sheets',
  );
});

test('no token or custom property is a shadow but the avatars’, the popups’, the tooltips’ and the chosen segment’s', async () => {
  const css = await shippedStyleSheet();
  const shadows = declarations(css)
    .map(({ prop }) => prop)
    .filter((prop) => /^--(?:env-|_).*shadow$/.test(prop));
  assert.deepEqual([...new Set(shadows)].sort(), [...libraryShadows].sort());
});

function valuesOf(css, name) {
  return [
    ...new Set(
      declarations(css)
        .filter(({ prop }) => prop === name)
        .map(({ value }) => value.replace(/\s+/g, ' ')),
    ),
  ];
}

function frostedShadows(css, name) {
  const values = valuesOf(css, name);
  assert.ok(values.includes('none'), `${name}: solid popups have no shadow`);
  const shadows = values.filter((value) => value !== 'none');
  assert.equal(shadows.length, 2, `${name}: one shadow in light, one in dark`);
  for (const value of shadows)
    for (const layer of split(value, /,/)) {
      const [x, y, blur, ...rest] = split(layer, /\s/);
      assert.equal(x, '0', 'it falls straight down');
      assert.match(y, /^\d+px$/);
      assert.match(blur, /^\d+px$/);
      const color = rest.at(-1);
      assert.match(color, /^oklch\(from var\(--env-color-[\w-]+\) /, layer);
      assert.ok(rest.length <= 2, layer);
    }
  return shadows;
}

function usersOf(css, name) {
  return declarations(css)
    .filter(({ prop, value }) => prop === 'box-shadow' && value === `var(${name})`)
    .map(({ selector }) => selector);
}

test('the popups’ shadow is soft, follows the theme, goes where popups are solid and stays on popups', async () => {
  const css = await shippedStyleSheet();
  frostedShadows(css, popupShadow);
  assert.deepEqual(usersOf(css, popupShadow).sort(), [
    '.env-command-palette',
    '.env-popup',
    '.env-surface.env-dialog',
  ]);
});

test('the tooltips’ shadow is smaller than the popups’, goes where they are solid and stays on tooltips', async () => {
  const css = await shippedStyleSheet();
  const [light, dark] = frostedShadows(css, tooltipShadow);
  const [popupLight, popupDark] = frostedShadows(css, popupShadow);
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
  const css = await shippedStyleSheet();
  const values = valuesOf(css, avatarShadow);
  assert.equal(values.length, 1, 'one shadow');
  const [, ringName, shadow] = values[0].match(/^var\(\s*(--[\w-]+),\s*(.*?)\s*\)$/);
  assert.equal(ringName, '--_avatar-group-ring-layers');
  const rings = declarations(css).filter(({ prop }) => prop === ringName);
  assert.equal(rings.length, 1, 'AvatarGroup.css declares the rings');
  for (const layer of split(rings[0].value, /,/)) {
    const [x, y, blur] = split(layer, /\s/);
    assert.deepEqual([x, y, blur], ['0', '0', '0'], layer);
  }
  const [x, y, blur, ...rest] = split(shadow, /\s/);
  assert.deepEqual([x, y, blur], ['0', '1px', '2px']);
  assert.equal(rest.length, 1, 'no spread, one color');
  assert.match(rest[0], /^oklch\(\s*from var\(--_surface-color, var\(--env-color-bg-page\)\)/);
  assert.deepEqual(usersOf(css, avatarShadow), ['.env-avatar']);
});

test('the chosen segment’s shadow is small, follows the theme, gives way at high contrast and stays on it', async () => {
  const css = await shippedStyleSheet();
  const values = valuesOf(css, segmentShadow);
  assert.equal(values.length, 1, 'one declaration');
  const [edge, ...layers] = split(values[0].replace(/^var\(|\)$/g, ''), /,/);
  assert.equal(edge, '--_segmented-control-high-contrast-edge');
  assert.equal(layers.length, 2, 'a shadow and a hairline');
  const [drop, ring] = layers.map((layer) => split(layer, /\s/));
  assert.deepEqual(drop.slice(0, 3), ['0', '1px', '2px']);
  assert.equal(drop.length, 4, 'no spread, one color');
  assert.match(drop[3], /^oklch\(from var\(--env-color-[\w-]+\) /);
  assert.deepEqual(ring.slice(0, 3), ['0', '0', '0']);
  assert.equal(dropShadow(layers[1]), null);
  const [edgeValue] = valuesOf(css, '--_segmented-control-high-contrast-edge');
  assert.match(edgeValue, /^var\(--_theme-high-contrast\) inset 0 0 0 /);
  assert.deepEqual(usersOf(css, segmentShadow), [
    '.env-segmented-control-item[data-checked]',
    '.env-segmented-control-thumb[data-placed]',
  ]);
});

test('the check tells drop shadows from rings', () => {
  const properties = new Map([['--ring', ['0.125rem']]]);
  const check = (value) =>
    problems([`:root { --ring: ${properties.get('--ring')[0]}; } .a { box-shadow: ${value}; }`])
      .length === 0;
  assert.ok(check('0 0 0 var(--ring) blue'));
  assert.ok(check('inset 0 0 0 1px red, inset 0 0 0 1px red'));
  assert.ok(check('inset 0.1875rem 0 0 blue'));
  assert.ok(check('0 0.0625rem 0 gray'));
  assert.ok(check('none'));
  assert.ok(!check('0 1px 2px 0 rgb(0 0 0 / 0.3)'));
  assert.ok(!check('0 0.25rem 0 0 black'));
  assert.ok(!check('0 0 0.5rem blue'));
  assert.ok(!check('var(--missing)'));
  assert.ok(problems(['.a { filter: drop-shadow(0 1px 2px black); }']).length === 1);
  assert.ok(problems(['.a { text-shadow: 0 1px black; }']).length === 1);
});
