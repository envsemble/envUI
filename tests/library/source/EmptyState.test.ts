import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, hasClass } from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { EmptyState } = await importSource('EmptyState', [
  "export { EmptyState } from './packages/ui/src/feedback/EmptyState.tsx';",
]);

test('an illustration sits in its own slot above the title, hidden and not sized as an icon', () => {
  const empty = firstElement(
    renderToStaticMarkup(
      h(EmptyState, {
        title: 'No projects yet',
        illustration: h('svg', { 'data-drawing': '', width: 160, height: 120 }),
      }),
    ),
  );
  const [illustration, heading] = empty.children as (typeof empty)[];
  assert.ok(hasClass(illustration, 'env-empty-state-illustration'));
  assert.equal(illustration.attributes['aria-hidden'], 'true');
  assert.ok(hasClass(heading, 'env-empty-state-heading'));
  assert.equal(
    elementsOf(empty).some((element) => hasClass(element, 'env-icon')),
    false,
  );
  assert.equal(
    elementsOf(illustration).filter((element) => element.attributes['data-drawing'] === '').length,
    1,
  );
});

test('an illustration shows in place of the icon where both are given', () => {
  const empty = firstElement(
    renderToStaticMarkup(
      h(EmptyState, {
        title: 'No projects yet',
        icon: h('svg', { 'data-icon': '' }),
        illustration: h('svg', { 'data-drawing': '' }),
      }),
    ),
  );
  const all = elementsOf(empty);
  assert.equal(all.filter((element) => element.attributes['data-drawing'] === '').length, 1);
  assert.equal(all.filter((element) => element.attributes['data-icon'] === '').length, 0);
  assert.equal(all.filter((element) => hasClass(element, 'env-empty-state-icon')).length, 0);
});
