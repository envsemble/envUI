// DropZone's markup: a button named by its visible text over a hidden file input, busy and
// disabled states, and an error that describes it. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { descriptions, elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { DropZone } = await importSource('DropZone', [
  "export * from './packages/ui/src/forms/DropZone.tsx';",
]);

/** The zone's markup, its button, its file input and the name its button's labels give it. */
function zone(props) {
  const root = firstElement(renderToString(h(DropZone, { onFilesAccepted() {}, ...props })));
  const elements = elementsOf(root);
  const button = elements.find((element) => element.tag === 'button');
  const name = button.attributes['aria-labelledby']
    .split(' ')
    .map((id) => textOf(elements.find((element) => element.attributes.id === id)))
    .join(' ');
  const input = elements.find((element) => element.attributes.type === 'file');
  return { root, elements, button, input, name };
}

test('the zone is a button named by its visible text over a hidden file input', () => {
  const { button, input, name } = zone({
    label: 'Drop a logo here, or browse',
    description: 'PNG, JPG or WebP up to 2 MB',
    accept: 'image/png,image/jpeg,.webp',
  });
  // The name is what the zone shows, its label and then its description, so speech input finds it.
  assert.equal(name, 'Drop a logo here, or browse PNG, JPG or WebP up to 2 MB');
  assert.equal(button.attributes['aria-describedby'], undefined);
  assert.equal(input.attributes.hidden, '');
  assert.equal(input.attributes.tabindex, '-1');
  assert.equal(input.attributes.accept, 'image/png,image/jpeg,.webp');
  assert.equal(input.attributes.multiple, undefined);
  assert.equal(zone({ label: 'Attach', multiple: true }).input.attributes.multiple, '');
});

test('a pending zone reports that it is busy and a disabled one takes no files', () => {
  const pending = zone({ label: 'Uploading the logo', pending: true });
  assert.equal(pending.button.attributes['aria-busy'], 'true');
  assert.equal(pending.button.attributes['aria-disabled'], 'true');
  assert.ok(pending.elements.some((element) => hasClass(element, 'env-spinner')));
  const disabled = zone({ label: 'Uploads are paused', disabled: true });
  assert.equal(disabled.button.attributes.disabled, '');
  assert.equal(disabled.input.attributes.disabled, '');
});

test('an error is linked to the zone', () => {
  const cover = zone({
    label: 'Drop a cover image',
    error: 'Choose an image at least 1200 pixels wide.',
  });
  assert.equal(cover.root.attributes['data-invalid'], '');
  assert.deepEqual(descriptions(cover.root, cover.button), [
    'Choose an image at least 1200 pixels wide.',
  ]);
});
