import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import {
  elementsOf,
  firstElement,
  hasClass,
  textOf,
  type MarkupElement,
} from '../../support/Markup.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Breadcrumbs, LinkProvider } = await importSource('Breadcrumbs', [
  "export { Breadcrumbs } from './packages/ui/src/navigation/Breadcrumbs.tsx';",
  "export { LinkProvider } from './packages/ui/src/foundations/LinkProvider.tsx';",
]);

const RecordingLink = (props: Record<string, unknown>) => h('a', { ...props, 'data-recorded': '' });

test('breadcrumbs link earlier levels and mark the current page', () => {
  const navigation = firstElement(
    renderToStaticMarkup(
      h(
        LinkProvider,
        { component: RecordingLink },
        h(Breadcrumbs, {
          items: [
            { label: 'Workspace', href: '/workspace' },
            { label: 'Plans', onClick: () => {} },
            { label: 'Search' },
            { label: 'Roadmap.md' },
          ],
        }),
      ),
    ),
  );
  assert.equal(navigation.tag, 'nav');
  assert.equal(navigation.attributes['aria-label'], 'Breadcrumb');
  const all = elementsOf(navigation);
  const items = all.filter((element) => element.tag === 'li');
  assert.deepEqual(items.map(textOf), ['Workspace', 'Plans', 'Search', 'Roadmap.md']);
  const current = all.filter((element) => element.attributes['aria-current'] === 'page');
  assert.deepEqual(current.map(textOf), ['Roadmap.md']);
  const links = all.filter((element) => element.tag === 'a');
  assert.deepEqual(links.map(textOf), ['Workspace']);
  assert.equal(links[0].attributes.href, '/workspace');
  assert.equal(links[0].attributes['data-recorded'], '');
  const buttons = all.filter((element) => element.tag === 'button');
  assert.deepEqual(buttons.map(textOf), ['Plans']);
  const searchText = all.find((element) => textOf(element) === 'Search' && element.tag === 'span');
  assert.ok(searchText && hasClass(searchText, 'env-breadcrumbs-text'));
  const separators = all.filter((element) => hasClass(element, 'env-breadcrumbs-separator'));
  assert.equal(separators.length, 3);
  for (const separator of separators) assert.equal(separator.attributes['aria-hidden'], 'true');
});

const nameOf = (element: MarkupElement): string =>
  element.children
    .map((child) =>
      typeof child === 'string'
        ? child
        : child.attributes['aria-hidden'] === 'true'
          ? ''
          : nameOf(child),
    )
    .join('');

test('a crumb draws its start graphic before the label, inside the crumb and hidden, so the label names it', () => {
  const graphic = (letter: string) => h('span', { 'data-graphic': '' }, letter);
  const navigation = firstElement(
    renderToStaticMarkup(
      h(Breadcrumbs, {
        items: [
          { label: 'Projects', href: '/projects', start: graphic('P') },
          { label: 'Northwind', onClick: () => {}, start: graphic('N') },
          { label: 'Archive', start: graphic('A') },
          { label: 'Website refresh', start: graphic('W') },
        ],
      }),
    ),
  );
  const crumbs = elementsOf(navigation).filter(
    (element) =>
      hasClass(element, 'env-breadcrumbs-link') ||
      hasClass(element, 'env-breadcrumbs-text') ||
      hasClass(element, 'env-breadcrumbs-current'),
  );
  assert.deepEqual(
    crumbs.map((crumb) => crumb.tag),
    ['a', 'button', 'span', 'span'],
  );
  for (const [crumb, label] of crumbs.map(
    (crumb, index) =>
      [crumb, ['Projects', 'Northwind', 'Archive', 'Website refresh'][index]] as const,
  )) {
    const [start, text] = crumb.children as MarkupElement[];
    assert.ok(hasClass(start, 'env-breadcrumbs-start'));
    assert.equal(start.attributes['aria-hidden'], 'true');
    assert.equal(start.attributes['data-env-slot-shrink'], 'never');
    assert.equal((start.children[0] as MarkupElement).attributes['data-graphic'], '');
    assert.ok(hasClass(text, 'env-breadcrumbs-label'));
    assert.equal(textOf(text), label);
    assert.equal(crumb.attributes['aria-label'], undefined);
    assert.equal(nameOf(crumb), label);
  }
});
