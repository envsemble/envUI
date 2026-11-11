// Kbd's markup: one key cap, or keys pressed together as key caps joined by plus inside an outer kbd.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';
import { elementsOf, firstElement, hasClass, textOf } from '../support/Markup.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Kbd } = await importSource('Kbd', [
  "export { Kbd } from './packages/ui/src/content/Kbd.tsx';",
]);

const render = (element) => firstElement(renderToStaticMarkup(element));

test('keys render as key caps joined by plus', () => {
  const combination = render(h(Kbd, { keys: ['Ctrl', 'P'] }));
  assert.equal(combination.tag, 'kbd');
  assert.ok(hasClass(combination, 'env-kbd-combination'));
  assert.equal(textOf(combination), 'Ctrl+P');
  const caps = elementsOf(combination).filter(
    (element) => element.tag === 'kbd' && hasClass(element, 'env-kbd'),
  );
  assert.deepEqual(caps.map(textOf), ['Ctrl', 'P']);
  const key = render(h(Kbd, null, 'F2'));
  assert.equal(key.tag, 'kbd');
  assert.ok(hasClass(key, 'env-kbd'));
  assert.equal(textOf(key), 'F2');
});
