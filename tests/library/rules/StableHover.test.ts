import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { declarations } from '../../support/CssDeclarations.ts';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

// Hover and focus inside never change a component's layout. A part that grows under the pointer
// can push its neighbours, wrap the row it sits in and move out from under the pointer, which
// takes the hover away, so it shrinks back and the loop repeats: the flicker an avatar group had
// when it spread with margins. Such a part moves with translate, rotate or scale, or keeps the room
// it grows into. This test reads every component style sheet and rejects a layout property in a
// rule for :hover or :focus-within, also one a custom property set there carries into it.

const styles = join(repositoryRoot, 'packages/ui/src/styles');

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

const isState = (selector: string) =>
  /:(?:hover|focus-within)\b/.test(selector.replace(/:not\([^)]*\)/g, ''));
const sheets = readdirSync(styles).filter(
  (file) => file.endsWith('.css') && !file.startsWith('Tokens'),
);

test('no hover or focus-within rule sets a layout property', () => {
  const found: string[] = [];
  for (const file of sheets)
    for (const { selector, prop } of declarations(readFileSync(join(styles, file), 'utf8')))
      if (isState(selector) && !allowed.has(`${file} ${selector}`) && layout.test(prop))
        found.push(`${file} ${selector} { ${prop} }`);
  assert.deepEqual(found, []);
});

test('no custom property set on hover or with focus inside reaches a layout property', () => {
  const found: string[] = [];
  for (const file of sheets) {
    const sheet = declarations(readFileSync(join(styles, file), 'utf8'));
    const custom = sheet.filter(({ prop }) => prop.startsWith('--'));
    // The custom properties a state rule sets, and those computed from them.
    const changing = new Set(
      custom.filter(({ selector }) => isState(selector)).map(({ prop }) => prop),
    );
    const reads = (value: string) => [...changing].some((name) => value.includes(`var(${name}`));
    for (let grew = true; grew;) {
      grew = false;
      for (const { prop, value } of custom)
        if (!changing.has(prop) && reads(value)) {
          changing.add(prop);
          grew = true;
        }
    }
    for (const { selector, prop, value } of sheet) {
      const name = `${file} ${selector} { ${prop} }`;
      if (layout.test(prop) && reads(value) && !allowedReads.has(name)) found.push(name);
    }
  }
  assert.deepEqual(found, []);
});
