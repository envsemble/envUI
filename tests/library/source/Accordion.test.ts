import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { importSource } from '../../support/ImportSource.ts';
import {
  elementsOf,
  firstElement,
  hasClass,
  textOf,
  type MarkupElement,
} from '../../support/Markup.ts';
import { styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

const { Accordion } = await importSource('Accordion', [
  "export * as Accordion from './packages/ui/src/content/Accordion.tsx';",
]);

test('a skeleton is one busy region: titles become bars and indicators shapes', () => {
  const root = firstElement(
    renderToStaticMarkup(
      h(
        Accordion.Root,
        { skeleton: true },
        h(Accordion.Item, { title: undefined }),
        h(Accordion.Item, { title: 'Loaded title' }),
      ),
    ),
  );
  assert.equal(root.attributes['data-env-skeleton'], '');
  assert.equal(root.attributes['aria-busy'], 'true');
  const elements = elementsOf(root);
  assert.equal(elements.filter((element) => 'aria-busy' in element.attributes).length, 1);
  const items = elements.filter((element) => hasClass(element, 'env-accordion-item'));
  assert.equal(items.length, 2);
  const labels = elements.filter((element) => hasClass(element, 'env-accordion-label'));
  assert.deepEqual(labels.map(textOf), ['', 'Loaded title']);
  const css = readFileSync(join(styleSheetsDirectory, 'Accordion.css'), 'utf8');
  assert.match(
    css,
    /\[data-env-skeleton\] \.env-accordion-label \{[^}]*--_skeleton-placeholder: inline-block;/,
  );
});

test("an item's end sits beside its heading, outside it, and its indicator can be its own or at the end", () => {
  const root = firstElement(
    renderToStaticMarkup(
      h(
        Accordion.Root,
        null,
        h(Accordion.Item, {
          title: 'Slack',
          end: h('button', { type: 'button', role: 'switch', 'aria-label': 'Slack on' }),
          indicator: h('svg', { 'data-chevron': '' }),
          indicatorPlacement: 'end',
        }),
        h(Accordion.Item, { title: 'Email', indicator: null }),
      ),
    ),
  );
  const [slack, email] = elementsOf(root).filter((element) =>
    hasClass(element, 'env-accordion-item'),
  );
  const heading = elementsOf(slack).find((element) => hasClass(element, 'env-accordion-header'));
  const end = slack.children.find(
    (child) => typeof child !== 'string' && hasClass(child, 'env-accordion-end'),
  );
  assert.ok(heading && end && typeof end !== 'string');
  assert.ok(!elementsOf(heading).some((element) => element.attributes.role === 'switch'));
  assert.equal(elementsOf(end).filter((element) => element.attributes.role === 'switch').length, 1);
  const trigger = elementsOf(heading).find((element) => element.tag === 'button');
  assert.ok(trigger);
  const parts = trigger.children.filter((child) => typeof child !== 'string');
  assert.deepEqual(
    parts.map((part) => part.attributes.class),
    ['env-accordion-label', 'env-accordion-indicator'],
  );
  assert.ok(elementsOf(parts[1]).some((element) => 'data-chevron' in element.attributes));
  assert.equal(slack.attributes['data-indicator'], 'end');
  assert.equal(email.attributes['data-indicator'], 'none');
  assert.ok(!elementsOf(email).some((element) => hasClass(element, 'env-accordion-indicator')));
});

test("the Root's indicator and indicatorPlacement reach every item, and an item's own replace them", () => {
  const root = firstElement(
    renderToStaticMarkup(
      h(
        Accordion.Root,
        { indicator: h('svg', { 'data-chevron': '' }), indicatorPlacement: 'end' },
        h(Accordion.Item, { title: 'Slack' }),
        h(Accordion.Item, { title: 'Email', indicatorPlacement: 'start' }),
        h(Accordion.Item, { title: 'SMS', indicator: null }),
      ),
    ),
  );
  const [slack, email, sms] = elementsOf(root).filter((element) =>
    hasClass(element, 'env-accordion-item'),
  );
  const partsOf = (item: MarkupElement) =>
    (elementsOf(item).find((element) => element.tag === 'button')?.children ?? [])
      .filter((child) => typeof child !== 'string')
      .map((part) => part.attributes.class);
  assert.deepEqual(partsOf(slack), ['env-accordion-label', 'env-accordion-indicator']);
  assert.ok(elementsOf(slack).some((element) => 'data-chevron' in element.attributes));
  assert.equal(slack.attributes['data-indicator'], 'end');
  assert.deepEqual(partsOf(email), ['env-accordion-indicator', 'env-accordion-label']);
  assert.ok(elementsOf(email).some((element) => 'data-chevron' in element.attributes));
  assert.equal(email.attributes['data-indicator'], undefined);
  assert.deepEqual(partsOf(sms), ['env-accordion-label']);
  assert.equal(sms.attributes['data-indicator'], 'none');
});
