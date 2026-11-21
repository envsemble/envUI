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

test('a crumb label of any content sits in the label element of each kind of crumb and names it', () => {
  const label = (name: string) => [
    h('span', { key: 'mark', 'aria-hidden': 'true' }, name[0]),
    name,
  ];
  const names = ['Projects', 'Northwind', 'Archive', 'Website refresh'];
  const navigation = firstElement(
    renderToStaticMarkup(
      h(Breadcrumbs, {
        items: [
          { label: label('Projects'), href: '/projects' },
          { label: label('Northwind'), onClick: () => {} },
          { label: label('Archive') },
          { label: label('Website refresh') },
        ],
      }),
    ),
  );
  const crumbs = elementsOf(navigation).filter((element) =>
    ['env-breadcrumbs-link', 'env-breadcrumbs-text', 'env-breadcrumbs-current'].some((name) =>
      hasClass(element, name),
    ),
  );
  assert.deepEqual(
    crumbs.map((crumb) => crumb.tag),
    ['a', 'button', 'span', 'span'],
  );
  crumbs.forEach((crumb, index) => {
    const [only, ...rest] = crumb.children as MarkupElement[];
    assert.deepEqual(rest, []);
    assert.ok(hasClass(only, 'env-breadcrumbs-label'));
    assert.equal(textOf(only), `${names[index][0]}${names[index]}`);
    assert.equal(crumb.attributes['aria-label'], undefined);
    assert.equal(nameOf(crumb), names[index]);
  });
});

test('a crumb’s itemProps reach its link, button or text, with its class joined', () => {
  const tagged = (id: string) => ({ className: 'own', 'data-testid': id });
  const all = elementsOf(
    firstElement(
      renderToStaticMarkup(
        h(Breadcrumbs, {
          items: [
            {
              label: 'Workspace',
              href: '/workspace',
              itemProps: { ...tagged('link'), target: '_blank', rel: 'noopener' },
            },
            { label: 'Plans', onClick: () => {}, itemProps: tagged('button') },
            { label: 'Search', itemProps: tagged('text') },
            { label: 'Roadmap.md', itemProps: tagged('current') },
          ],
        }),
      ),
    ),
  );
  const byId = (id: string) => all.find((element) => element.attributes['data-testid'] === id)!;
  assert.equal(byId('link').tag, 'a');
  assert.equal(byId('link').attributes.target, '_blank');
  assert.equal(byId('link').attributes.rel, 'noopener');
  assert.ok(hasClass(byId('link'), 'env-breadcrumbs-link') && hasClass(byId('link'), 'own'));
  assert.equal(byId('button').tag, 'button');
  assert.ok(hasClass(byId('button'), 'env-breadcrumbs-link') && hasClass(byId('button'), 'own'));
  assert.ok(hasClass(byId('text'), 'env-breadcrumbs-text') && hasClass(byId('text'), 'own'));
  assert.equal(byId('current').attributes['aria-current'], 'page');
  assert.ok(
    hasClass(byId('current'), 'env-breadcrumbs-current') && hasClass(byId('current'), 'own'),
  );
});
