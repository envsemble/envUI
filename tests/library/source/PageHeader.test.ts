// PageHeader's markup: its title at its heading level, the trail before it and the description
// after, and no landmark of its own. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { elementsOf, firstElement, textOf } from '../../support/Markup.ts';
import { createElement as h, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

const { PageHeader, Breadcrumbs } = await importSource('PageHeader', [
  "export * from './packages/ui/src/layout/PageHeader.tsx';",
  "export * from './packages/ui/src/navigation/Breadcrumbs.tsx';",
]);

const render = (element: ReactElement) => elementsOf(firstElement(renderToString(element)));

test('renders its title at its heading level, with the trail above it', () => {
  const elements = render(
    h(PageHeader, {
      title: 'Northwind launch',
      description: 'Everything the launch needs.',
      breadcrumbs: h(Breadcrumbs, {
        items: [{ label: 'Projects', href: '#projects' }, { label: 'Northwind launch' }],
      }),
    }),
  );
  const heading = elements.findIndex((element) => element.tag === 'h1');
  assert.equal(textOf(elements[heading]), 'Northwind launch');
  // The trail comes first in the markup, the description after the title.
  const trail = elements.findIndex(
    (element) => element.tag === 'nav' && element.attributes['aria-label'] === 'Breadcrumb',
  );
  assert.ok(trail >= 0 && trail < heading);
  const description = elements.findIndex((element) =>
    textOf(element).startsWith('Everything the launch needs'),
  );
  assert.ok(description > heading);
  // It is no landmark, so a page never gets a second banner.
  assert.ok(
    !elements.some(
      (element) =>
        ['header', 'banner'].includes(element.tag) || element.attributes.role === 'banner',
    ),
  );
  const level = render(h(PageHeader, { title: 'Members', headingLevel: 2 }));
  const levelTwo = level.find((element) => element.tag === 'h2');
  assert.ok(levelTwo);
  assert.equal(textOf(levelTwo), 'Members');
});
