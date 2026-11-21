import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Kbd } = await importSource('Kbd', [
  "export { Kbd } from './packages/ui/src/content/Kbd.tsx';",
]);

const render = (element: ReactElement) => firstElement(renderToStaticMarkup(element));

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

test('a key can be any content, and the separator a word, or none', () => {
  const arrow = h('svg', { 'aria-label': 'Up' });
  const icons = render(h(Kbd, { keys: ['⌘', arrow], separator: null }));
  assert.equal(
    elementsOf(icons).filter((element) => hasClass(element, 'env-kbd-separator')).length,
    0,
  );
  assert.ok(elementsOf(icons).some((element) => element.tag === 'svg'));
  const sequence = render(h(Kbd, { keys: ['G', 'I'], separator: 'then' }));
  assert.equal(textOf(sequence), 'GthenI');
  assert.deepEqual(
    elementsOf(sequence)
      .filter((element) => hasClass(element, 'env-kbd-separator'))
      .map(textOf),
    ['then'],
  );
});
