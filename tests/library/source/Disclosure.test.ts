import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { importSource } from '../../support/ImportSource.ts';
import { firstElement, hasClass, type MarkupElement } from '../../support/Markup.ts';

const { Disclosure } = await importSource('Disclosure', [
  "export { Disclosure } from './packages/ui/src/content/Disclosure.tsx';",
]);

const childElements = (element: MarkupElement) =>
  element.children.filter((child): child is MarkupElement => typeof child !== 'string');

test('the chevron can follow the summary, and a flow panel places the details as given', () => {
  const details = firstElement(
    renderToStaticMarkup(
      h(
        Disclosure,
        { title: 'Show more', indicatorPlacement: 'end', panelLayout: 'flow' },
        'Two more ',
        h('a', { href: '/files' }, 'files'),
      ),
    ),
  );
  assert.equal(details.attributes['data-indicator'], 'end');
  const [summary, panel] = childElements(details);
  assert.deepEqual(
    childElements(summary).map((part) => part.attributes.class),
    ['env-disclosure-title', 'env-icon env-disclosure-indicator'],
  );
  assert.ok(hasClass(panel, 'env-disclosure-panel'));
  assert.equal(panel.attributes['data-layout'], 'flow');
  assert.equal(panel.children[0], 'Two more ');
  const stacked = firstElement(renderToStaticMarkup(h(Disclosure, { title: 'Details' }, 'Body')));
  assert.equal(stacked.attributes['data-indicator'], undefined);
  assert.equal(childElements(stacked)[1].attributes['data-layout'], undefined);
});
