// Card's markup: its heading's level, the element it renders, and a pressable card as a native
// button or link, named by its text. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Card, Button, Text } = await importSource('Card', [
  "export * from './packages/ui/src/layout/Card.tsx';",
  "export * from './packages/ui/src/actions/Button.tsx';",
  "export * from './packages/ui/src/foundations/Text.tsx';",
]);

const render = (element) => firstElement(renderToString(element));
const byClass = (root, name) => elementsOf(root).find((element) => hasClass(element, name));

test('a card heading takes its level, three by default, with its description under it', () => {
  const card = render(h(Card, { title: 'Default level', description: 'A sentence under it.' }));
  const heading = byClass(card, 'env-card-title');
  assert.equal(heading.tag, 'h3');
  assert.equal(textOf(heading), 'Default level');
  assert.equal(textOf(byClass(card, 'env-card-description')), 'A sentence under it.');
  assert.equal(
    byClass(render(h(Card, { title: 'Fourth', headingLevel: 4 })), 'env-card-title').tag,
    'h4',
  );
});

test('render gives a card its element, and its actions a footer', () => {
  const card = render(
    h(Card, { render: h('article'), title: 'An article', actions: h(Button, null, 'Open') }),
  );
  assert.equal(card.tag, 'article');
  assert.equal(card.attributes['data-actions'], '');
  const footer = card.children.find((child) => child.tag === 'footer');
  assert.ok(hasClass(footer, 'env-card-footer'));
  assert.equal(textOf(elementsOf(footer).find((element) => element.tag === 'button')), 'Open');
});

test('a link card is named by its text, with no label of its own', () => {
  const link = render(
    h(
      Card,
      { href: '#named' },
      h(Text, { render: h('span'), variant: 'title' }, 'Northwind launch'),
      ' ',
      h(Text, { render: h('span'), emphasis: 'muted' }, '12 open tasks'),
    ),
  );
  assert.equal(link.tag, 'a');
  assert.equal(link.attributes.href, '#named');
  assert.equal(link.attributes['aria-label'], undefined);
  assert.equal(link.attributes['aria-labelledby'], undefined);
  assert.equal(textOf(link), 'Northwind launch 12 open tasks');
});

test('a card with onClick is a button that never submits; a disabled link card has no href', () => {
  const button = render(h(Card, { onClick() {} }, 'Action'));
  assert.equal(button.tag, 'button');
  assert.equal(button.attributes.type, 'button');
  assert.equal(button.attributes['data-interactive'], '');
  const disabled = render(h(Card, { onClick() {}, disabled: true }, 'Action'));
  assert.equal(disabled.attributes.disabled, '');
  const link = render(h(Card, { href: '#destination', disabled: true }, 'Link'));
  assert.equal(link.attributes.href, undefined);
  assert.equal(link.attributes['aria-disabled'], 'true');
  assert.equal(link.attributes.tabindex, '-1');
});
