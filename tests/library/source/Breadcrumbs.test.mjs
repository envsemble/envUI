// Breadcrumbs' markup: earlier levels as links through the application's link component or as
// buttons, the current page marked and no link, and decorative separators between levels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.mjs';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Breadcrumbs, LinkProvider } = await importSource('Breadcrumbs', [
  "export { Breadcrumbs } from './packages/ui/src/navigation/Breadcrumbs.tsx';",
  "export { LinkProvider } from './packages/ui/src/foundations/LinkProvider.tsx';",
]);

/** The application's link, which marks the anchors it renders. */
const RecordingLink = (props) => h('a', { ...props, 'data-recorded': '' });

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
  // A level with href is a link through the application's component; one with onClick a button;
  // one with neither, and the current page, plain text.
  const links = all.filter((element) => element.tag === 'a');
  assert.deepEqual(links.map(textOf), ['Workspace']);
  assert.equal(links[0].attributes.href, '/workspace');
  assert.equal(links[0].attributes['data-recorded'], '');
  const buttons = all.filter((element) => element.tag === 'button');
  assert.deepEqual(buttons.map(textOf), ['Plans']);
  assert.ok(
    hasClass(
      all.find((element) => textOf(element) === 'Search' && element.tag === 'span'),
      'env-breadcrumbs-text',
    ),
  );
  // Separators are decorative.
  const separators = all.filter((element) => hasClass(element, 'env-breadcrumbs-separator'));
  assert.equal(separators.length, 3);
  for (const separator of separators) assert.equal(separator.attributes['aria-hidden'], 'true');
});
