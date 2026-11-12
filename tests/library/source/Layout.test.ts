// The layout primitives Box, Row, Column and Grid: the markup they render on the server, which
// their style sheet reads, and the style sheet's zero specificity, so any class overrides them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const { Box, Column, Grid, Row } = await importSource(
  'Layout',
  'packages/ui/src/layout/Layout.tsx',
);

const markup = (element) => renderToStaticMarkup(element);

test('a primitive adds no class of its own, so a part class names it', () => {
  for (const primitive of [Box, Row, Column, Grid])
    assert.doesNotMatch(markup(h(primitive, { gap: 2 })), /class=/);
});

test('Grid writes its columns as a template', () => {
  const columns = (value) =>
    /--env-grid-columns:([^;"]+)/.exec(markup(h(Grid, { columns: value })))?.[1];
  assert.equal(columns(3), 'repeat(3, minmax(0, 1fr))');
  assert.equal(columns('minmax(0, 2fr) 20rem'), 'minmax(0, 2fr) 20rem');
  assert.equal(columns({ min: '12rem' }), 'repeat(auto-fill, minmax(min(100%, 12rem), 1fr))');
  assert.match(markup(h(Grid, { columns: 2 })), /data-columns=""/);
  assert.doesNotMatch(markup(h(Grid)), /data-columns|style=/);
});

test('container names a size container, and the style keeps the application’s own', () => {
  assert.equal(
    markup(h(Box, { container: 'summary', style: { color: 'red' } })),
    '<div data-env-layout="box" data-env-container="" style="--env-layout-container:summary;color:red"></div>',
  );
  assert.equal(
    markup(h(Row, { style: { margin: 0 } })),
    '<div data-env-layout="row" style="margin:0"></div>',
  );
});

test('render renders another element, with its own props winning', () => {
  assert.equal(
    markup(h(Column, { gap: 4, render: h('section', { 'aria-label': 'Details' }) }, 'Text')),
    '<section aria-label="Details" data-env-layout="column" data-gap="4">Text</section>',
  );
  assert.equal(
    markup(h(Row, { className: 'app-row', render: h('footer', { className: 'app-footer' }) })),
    '<footer class="app-row app-footer" data-env-layout="row"></footer>',
  );
});

test('every rule of the primitives has zero specificity', () => {
  const css = readFileSync(
    join(repositoryRoot, 'packages/ui/src/styles/Layout.css'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap(([, list]) =>
    list.split(/,(?![^(]*\))/).map((selector) => selector.trim()),
  );
  assert.ok(selectors.length > 20);
  // A skeleton's content wrapper, which has no box, passes a primitive's rules on to its children.
  for (const selector of selectors)
    assert.match(
      selector,
      /^:where\([^()]*\)(?: > :where\(\.env-skeleton-content\))?(?: > \*)?$/,
      selector,
    );
  assert.doesNotMatch(css, /env-stack/);
});

test('render runs both event handlers, the element’s first, and gives both refs the node', () => {
  const calls: string[] = [];
  const element = Row({
    onClick: () => calls.push('row'),
    ref: (node) => calls.push(`row ref ${node}`),
    render: h('footer', {
      onClick: () => calls.push('footer'),
      ref: (node) => calls.push(`footer ref ${node}`),
    }),
  });
  element.props.onClick();
  assert.deepEqual(calls, ['footer', 'row']);
  const objectRef = { current: null };
  const both = Column({
    ref: objectRef,
    render: h('section', { ref: (node) => calls.push(node) }),
  });
  const cleanup = both.props.ref('node');
  assert.equal(objectRef.current, 'node');
  assert.equal(calls.at(-1), 'node');
  cleanup();
  assert.equal(objectRef.current, null);
  assert.equal(calls.at(-1), null);
  // A single ref is passed on as it is.
  assert.equal(Row({ ref: objectRef, render: h('div') }).props.ref, objectRef);
});

test('rows and columns lay out with flex and grids with grid, and no primitive paints', () => {
  const css = readFileSync(
    join(repositoryRoot, 'packages/ui/src/styles/Layout.css'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(
    css,
    /:where\(\[data-env-layout='row'\], \[data-env-layout='column'\]\) \{\s*display: flex;/,
  );
  assert.match(css, /:where\(\[data-env-layout='grid'\]\) \{\s*display: grid;/);
  // Spacing and sizing only: a primitive draws nothing of its own.
  const properties = [...css.matchAll(/^\s*([\w-]+):/gm)].map(([, property]) => property);
  assert.ok(properties.length > 20);
  for (const property of properties)
    assert.doesNotMatch(property, /^(background|border|outline|box-shadow|color|fill|filter)/);
});
