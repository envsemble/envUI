// A field's prefix and suffix: hidden from assistive technology in the well, and read with the
// value through the field's description, before its hint and its error. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { descriptions, elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { TextField } = await importSource('TextField', [
  "export * from './packages/ui/src/forms/TextField.tsx';",
]);

/** The field's markup, its input, its affixes and the description the input reads. */
function field(props) {
  const root = firstElement(renderToString(h(TextField, props)));
  const input = elementsOf(root).find((element) => element.tag === 'input');
  const part = (name) =>
    elementsOf(root).find((element) => hasClass(element, `env-text-field-${name}`));
  return {
    input,
    prefix: part('prefix'),
    suffix: part('suffix'),
    description: descriptions(root, input).join(' '),
  };
}

test('a prefix shows with the value inside the field and is read with it', () => {
  const { input, prefix, description } = field({
    label: 'Address',
    name: 'slug',
    prefix: 'https://example.com/',
  });
  assert.equal(textOf(prefix), 'https://example.com/');
  assert.equal(prefix.attributes['aria-hidden'], 'true');
  assert.equal(description, 'https://example.com/');
  assert.equal(input.attributes.name, 'slug');
  // Before the icon and after it, a prefix and a suffix are read together.
  assert.equal(
    field({ label: 'Price', visibleLabel: false, prefix: '€', suffix: 'per month' }).description,
    '€ per month',
  );
});

test('a suffix follows the value and keeps the hint and error in the description', () => {
  const size = field({ label: 'Size', type: 'number', suffix: 'MB', description: 'Up to 10' });
  assert.equal(textOf(size.suffix), 'MB');
  assert.equal(size.suffix.attributes['aria-hidden'], 'true');
  assert.equal(size.description, 'MB Up to 10');
  const limit = field({ label: 'Limit', suffix: 'items', error: 'Use 1 or more.' });
  assert.equal(limit.input.attributes['aria-invalid'], 'true');
  assert.equal(limit.description, 'items Use 1 or more.');
  const quota = field({ label: 'Quota', suffix: 'GB', defaultValue: '12', disabled: true });
  assert.equal(quota.input.attributes.disabled, '');
  assert.equal(textOf(quota.suffix), 'GB');
});
