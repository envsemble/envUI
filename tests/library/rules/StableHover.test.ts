import assert from 'node:assert/strict';
import { test } from 'node:test';
import { declarations, libraryStyleSheets } from '../../support/StyleSheets.ts';

const layout =
  /^(?:margin|padding|inline-size|block-size|width|height|(?:min|max)-(?:inline-size|block-size|width|height)|gap|row-gap|column-gap|flex(?:-[a-z]+)?|grid(?:-[a-z]+)*|display|position|inset(?:-[a-z]+)*|top|right|bottom|left|font|font-size|font-weight|font-family|letter-spacing|word-spacing|line-height|white-space|border-(?:[a-z]+-)*width|aspect-ratio)(?:-[a-z]+)*$/;

const layoutChangesOnFocusOnPurpose = new Set([
  "Table.css :is( .env-table-region[data-narrow-layout='stack'] > .env-table, .env-table-region[data-narrow-layout='stack'] > .env-skeleton-content > .env-table ) > .env-table-head:focus-within",
]);

const stateReadsThatMoveNothing = new Set([
  'TextField.css .env-text-field-border { inset-block }',
  'TextField.css .env-text-field-border { padding-inline }',
]);

const isState = (selector: string) =>
  /:(?:hover|focus-within)\b/.test(selector.replace(/:not\([^)]*\)/g, ''));
const sheets = libraryStyleSheets().filter(({ name }) => !name.startsWith('Tokens'));

test('no hover or focus-within rule sets a layout property', () => {
  const found: string[] = [];
  for (const { name: file, text } of sheets)
    for (const { selector, prop } of declarations(text))
      if (
        isState(selector) &&
        !layoutChangesOnFocusOnPurpose.has(`${file} ${selector}`) &&
        layout.test(prop)
      )
        found.push(`${file} ${selector} { ${prop} }`);
  assert.deepEqual(found, []);
});

test('no custom property set on hover or with focus inside reaches a layout property', () => {
  const found: string[] = [];
  for (const { name: file, text } of sheets) {
    const sheet = declarations(text);
    const custom = sheet.filter(({ prop }) => prop.startsWith('--'));
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
      if (layout.test(prop) && reads(value) && !stateReadsThatMoveNothing.has(name))
        found.push(name);
    }
  }
  assert.deepEqual(found, []);
});
