import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

const { Scaffold, Panes, Page, resolveNavigationForms } = await importSource('Scaffolds', [
  "export * from './packages/ui/src/layout/Scaffold.tsx';",
  "export * as Panes from './packages/ui/src/layout/Panes.tsx';",
  "export * from './packages/ui/src/layout/Page.tsx';",
  "export { resolveNavigationForms } from './packages/ui/src/layout/internal/navigationForms.ts';",
]);

const styles = styleSheetsDirectory;
const sheet = (name: string) => readFileSync(join(styles, name), 'utf8');

test('each window class shows the form it asks for, else the nearest one given', () => {
  const all = { bar: 'B', rail: 'R', drawer: 'D' };
  assert.deepEqual(resolveNavigationForms(all), {
    compact: 'bar',
    medium: 'rail',
    expanded: 'drawer',
    large: 'drawer',
  });
  assert.deepEqual(resolveNavigationForms({ drawer: 'D' }), {
    compact: 'drawer',
    medium: 'drawer',
    expanded: 'drawer',
    large: 'drawer',
  });
  assert.equal(resolveNavigationForms({ bar: 'B', drawer: 'D' }).medium, 'drawer');
  assert.deepEqual(resolveNavigationForms(all, { compact: 'none', large: 'rail' }), {
    compact: 'none',
    medium: 'rail',
    expanded: 'drawer',
    large: 'rail',
  });
  assert.deepEqual(Object.values(resolveNavigationForms(undefined)), [
    'none',
    'none',
    'none',
    'none',
  ]);
});

test('Scaffold renders skip links, banner, navigation and main in order, and a slot for each form shown, which CSS shows by its width', () => {
  const markup = renderToString(
    h(
      Scaffold,
      {
        name: 'app',
        topBar: h('div', null, 'Top'),
        navigation: { bar: h('nav', null, 'Bar'), drawer: h('nav', null, 'Drawer') },
      },
      'Body',
    ),
  );
  assert.match(markup, /^<div class="env-scaffold" data-env-layout="scaffold" data-env-name="app"/);
  assert.match(
    markup,
    /data-navigation-compact="bar" data-navigation-medium="drawer" data-navigation-expanded="drawer" data-navigation-large="drawer"/,
  );
  const order = [
    'env-scaffold-skip-links',
    '<header class="env-scaffold-top-bar"',
    'env-scaffold-navigation',
    '<main',
  ];
  const positions = order.map((part) => markup.indexOf(part));
  assert.ok(
    positions.every((position) => position >= 0),
    positions.join(),
  );
  assert.deepEqual(
    [...positions].sort((a, b) => a - b),
    positions,
  );
  assert.match(markup, /<main id="main" tabindex="-1" class="env-scaffold-body">Body<\/main>/);
  assert.match(markup, /href="#main"/);
  assert.match(markup, /class="env-scaffold-drawer" data-navigation-form="drawer"/);
  assert.match(markup, /class="env-scaffold-bar" data-navigation-form="bar"/);
  assert.doesNotMatch(markup, /env-scaffold-rail/);
});

test('Scaffold without landmarks renders divs, no skip links and a body id of its own', () => {
  const markup = renderToString(h(Scaffold, { landmarks: false, topBar: 'Top' }, 'Body'));
  assert.doesNotMatch(markup, /<header|<main/);
  assert.doesNotMatch(markup, /env-scaffold-skip-link/);
  assert.doesNotMatch(markup, /id="main"/);
  assert.match(markup, /<div id="[^"]+-body" tabindex="-1" class="env-scaffold-body">Body<\/div>/);
  assert.doesNotMatch(markup, /env-scaffold-navigation/);
});

test('Scaffold without navigation renders no skip link to it, and scrolls the document', () => {
  const markup = renderToString(h(Scaffold, { topBar: 'Top' }, 'Body'));
  assert.equal(markup.match(/env-scaffold-skip-link"/g)?.length, 1);
  assert.match(markup, /data-scroll="document"/);
  assert.match(renderToString(h(Scaffold, { scroll: 'body' }, 'Body')), /data-scroll="body"/);
});

test('Panes renders its sized pane, its stacking and its size for CSS, and names the pane the handle resizes', () => {
  const markup = renderToString(
    h(
      Panes.Root,
      { sized: 'end', stackBelow: 'medium', name: 'doc', defaultWidth: 20 },
      h(Panes.Pane, { label: 'Document' }, 'Main'),
      h(Panes.ResizeHandle),
      h(Panes.Pane, { label: 'Details' }, 'Side'),
    ),
  );
  assert.match(
    markup,
    /^<div class="env-panes" style="--env-panes-size:20rem" data-env-layout="panes" data-env-name="doc" data-sized="end" data-stack-below="medium">/,
  );
  assert.match(markup, /class="env-panes-pane" role="region" aria-label="Document"/);
  const controls = /aria-controls="([^"]+)"/.exec(markup)?.[1];
  assert.ok(controls, markup);
  assert.match(
    markup,
    new RegExp(`id="${controls}" class="env-panes-pane" role="region" aria-label="Details"`),
  );
  assert.match(markup, /role="separator"[^>]*aria-valuetext="20 rem"/);
  assert.match(markup, /class="env-resize-handle env-panes-resize-handle"/);
  assert.doesNotMatch(markup, /data-behavior|data-split-at|data-open|env-panes-backdrop/);
  const plain = renderToString(
    h(
      Panes.Root,
      null,
      h(Panes.Pane, { id: 'list' }, 'L'),
      h(Panes.ResizeHandle),
      h(Panes.Pane, null, 'D'),
    ),
  );
  assert.match(plain, /data-sized="start"/);
  assert.match(plain, /aria-controls="list"/);
  assert.doesNotMatch(plain, /data-stack-below/);
});

test('Page renders invisible structure with its width, and its header above its content', () => {
  assert.equal(
    renderToString(h(Page, { name: 'settings', width: 'sm' }, 'Content')),
    '<div class="env-page" data-env-layout="page" data-env-name="settings" data-width="sm">Content</div>',
  );
  assert.match(
    renderToString(
      h(Page, { header: h('h1', null, 'Title'), gutter: false, render: h('article') }, 'C'),
    ),
    /^<article class="env-page" data-env-layout="page" data-width="lg" data-gutter="none"><h1>Title<\/h1><div class="env-page-content">C<\/div><\/article>$/,
  );
  const css = sheet('Page.css');
  assert.match(css, /container: env-page \/ inline-size;/);
  assert.match(css, /--env-page-gutter: var\(--_theme-page-gutter\);/);
  assert.match(
    css,
    /@container \(width >= 37\.5rem\) \{\s*\.env-page \{\s*--env-page-gutter: var\(--env-space-5\);/,
  );
});
