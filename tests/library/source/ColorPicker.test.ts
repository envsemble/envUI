// ColorPicker's and ColorSwatch's markup: what a disabled and a read-only picker turn off, and how a
// swatch names its color. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, textOf } from '../../support/Markup.ts';

const { ColorPicker, ColorSwatch } = await importSource('ColorPicker', [
  "export { ColorPicker } from './packages/ui/src/forms/color/ColorPicker.tsx';",
  "export { ColorSwatch } from './packages/ui/src/forms/color/ColorSwatch.tsx';",
]);

const render = (element) => firstElement(renderToStaticMarkup(element));
const named = (root, name) =>
  elementsOf(root).filter((element) => element.attributes['aria-label'] === name);
const sliders = (root) => elementsOf(root).filter((element) => element.attributes.type === 'range');
const hexField = (root) => named(root, 'Hex').find((element) => element.tag === 'input');
const copyButton = (root) => named(root, 'Copy color').find((element) => element.tag === 'button');

test('a disabled picker disables every control; a read-only one keeps its color but copies it', () => {
  const disabled = render(
    h(ColorPicker, { label: 'Disabled color', defaultValue: '#ea4335', disabled: true }),
  );
  assert.equal(disabled.attributes.role, 'group');
  assert.equal(disabled.attributes['aria-disabled'], 'true');
  assert.equal(hexField(disabled).attributes.disabled, '');
  assert.ok(sliders(disabled).length >= 2);
  for (const slider of sliders(disabled)) assert.equal(slider.attributes.disabled, '');

  const readOnly = render(
    h(ColorPicker, { label: 'Read only color', value: '#6750a4', readOnly: true }),
  );
  assert.equal(readOnly.attributes['aria-disabled'], undefined);
  const hex = hexField(readOnly);
  // React writes the attribute as react-aria spells it; HTML reads it whatever its case.
  assert.equal(hex.attributes.readOnly ?? hex.attributes.readonly, '');
  assert.equal(hex.attributes['aria-readonly'], 'true');
  assert.equal(hex.attributes.disabled, undefined);
  for (const slider of sliders(readOnly)) assert.equal(slider.attributes.disabled, '');
  // Copy still works on a read-only picker.
  assert.equal(copyButton(readOnly).attributes.disabled, undefined);
});

test('a color swatch writes its value beside its label, and alone names itself', () => {
  const labelled = render(h(ColorSwatch, { color: '#6750a4', format: 'rgb', label: 'Violet' }));
  assert.equal(textOf(labelled), 'Violetrgb(103, 80, 164)');
  // The sample beside words is decoration.
  assert.equal(elementsOf(labelled)[1].attributes['aria-hidden'], 'true');
  const alone = render(h(ColorSwatch, { color: '#ffffff' }));
  assert.equal(alone.attributes.role, 'img');
  assert.equal(alone.attributes['aria-label'], 'white');
});
