import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

// Hover and focus inside never change a component's layout. A part that grows under the pointer
// can push its neighbours, wrap the row it sits in and move out from under the pointer, which
// takes the hover away, so it shrinks back and the loop repeats: the flicker an avatar group had
// when it spread with margins. Such a part moves with translate, rotate or scale, or keeps the room
// it grows into. This test reads every component style sheet and rejects a layout property in a
// rule for :hover or :focus-within, also one a custom property set there carries into it.

const root = fileURLToPath(new URL('../../', import.meta.url));
const styles = join(root, 'packages/ui/src/styles');

/** Properties that size or place a box, or its text. Colors, transforms and opacity are free. */
const layout =
  /^(?:margin|padding|inline-size|block-size|width|height|(?:min|max)-(?:inline-size|block-size|width|height)|gap|row-gap|column-gap|flex(?:-[a-z]+)?|grid(?:-[a-z]+)*|display|position|inset(?:-[a-z]+)*|top|right|bottom|left|font|font-size|font-weight|font-family|letter-spacing|word-spacing|line-height|white-space|border-(?:[a-z]+-)*width|aspect-ratio)(?:-[a-z]+)*$/;

/**
 * Rules that change layout with focus on purpose, by style sheet and selector, with the reason. A
 * table's header row, visually hidden in the narrow stacked layout, shows while focus is inside it,
 * so a keyboard user sees the sort buttons they reach.
 */
const allowed = new Set([
  "Table.css .env-table-region[data-narrow-layout='stack'] .env-table-head:focus-within",
]);

/**
 * Declarations that read a custom property a state sets without moving anything, by style sheet,
 * selector and property, with the reason. The fieldset that draws a field's frame lies over the
 * control, absolutely positioned, and takes no room: the wider frame of a focused field grows
 * inward from the same outer edge, and the notch keeps its place, through its offsets.
 */
const allowedReads = new Set([
  'TextField.css .env-text-field-border { inset-block }',
  'TextField.css .env-text-field-border { padding-inline }',
]);

const isState = (selector) =>
  /:(?:hover|focus-within)\b/.test(selector.replace(/:not\([^)]*\)/g, ''));
const sheets = readdirSync(styles).filter(
  (file) => file.endsWith('.css') && !file.startsWith('Tokens'),
);

test('no hover or focus-within rule sets a layout property', () => {
  const found = [];
  for (const file of sheets) {
    postcss.parse(readFileSync(join(styles, file), 'utf8')).walkRules((rule) => {
      if (!isState(rule.selector)) return;
      const selector = rule.selector.replace(/\s+/g, ' ');
      if (allowed.has(`${file} ${selector}`)) return;
      rule.walkDecls((declaration) => {
        if (layout.test(declaration.prop))
          found.push(`${file} ${selector} { ${declaration.prop} }`);
      });
    });
  }
  assert.deepEqual(found, []);
});

test('no custom property set on hover or with focus inside reaches a layout property', () => {
  const found = [];
  for (const file of sheets) {
    const sheet = postcss.parse(readFileSync(join(styles, file), 'utf8'));
    // The custom properties a state rule sets, and those computed from them.
    const changing = new Set();
    sheet.walkRules((rule) => {
      if (!isState(rule.selector)) return;
      rule.walkDecls(/^--/, (declaration) => changing.add(declaration.prop));
    });
    const reads = (value) => [...changing].some((name) => value.includes(`var(${name}`));
    for (let grew = true; grew;) {
      grew = false;
      sheet.walkDecls(/^--/, (declaration) => {
        if (!changing.has(declaration.prop) && reads(declaration.value)) {
          changing.add(declaration.prop);
          grew = true;
        }
      });
    }
    sheet.walkDecls((declaration) => {
      const name = `${file} ${declaration.parent.selector} { ${declaration.prop} }`;
      if (layout.test(declaration.prop) && reads(declaration.value) && !allowedReads.has(name))
        found.push(name);
    });
  }
  assert.deepEqual(found, []);
});
