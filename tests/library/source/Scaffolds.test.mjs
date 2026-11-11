// The scaffolds Scaffold, Panes and Page: the markup they render on the server, which their style
// sheets read to decide arrangement, so nothing is measured; and how Scaffold resolves the
// navigation form of each window class.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.mjs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const { Scaffold, Panes, Page, resolveNavigationForms } = await importSource('Scaffolds', [
  "export * from './packages/ui/src/layout/Scaffold.tsx';",
  "export * as Panes from './packages/ui/src/layout/Panes.tsx';",
  "export * from './packages/ui/src/layout/Page.tsx';",
  "export { resolveNavigationForms } from './packages/ui/src/layout/internal/navigationForms.ts';",
]);

const styles = join(repositoryRoot, 'packages/ui/src/styles');
const sheet = (name) => readFileSync(join(styles, name), 'utf8');

test('each window class shows the form it asks for, else the nearest one given', () => {
  const all = { bar: 'B', rail: 'R', drawer: 'D' };
  assert.deepEqual(resolveNavigationForms(all), {
    compact: 'bar',
    medium: 'rail',
    expanded: 'drawer',
    large: 'drawer',
  });
  // Only a drawer: it stands in everywhere.
  assert.deepEqual(resolveNavigationForms({ drawer: 'D' }), {
    compact: 'drawer',
    medium: 'drawer',
    expanded: 'drawer',
    large: 'drawer',
  });
  // A bar and a drawer: medium asks for a rail and gets the drawer, its nearest.
  assert.equal(resolveNavigationForms({ bar: 'B', drawer: 'D' }).medium, 'drawer');
  // The application changes the form of a window class, or shows none.
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

test('Scaffold renders its regions and forms, which CSS shows by its width', () => {
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
  // Skip links first, then the banner, the navigation and the main landmark.
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
  // A slot for each form that some window class shows, and none for the rail, which none does.
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

test('Panes renders its behavior, its split and its size for CSS, and the parts their roles', () => {
  const markup = renderToString(
    h(
      Panes.Root,
      { behavior: 'supporting', name: 'doc', defaultWidth: 20 },
      h(Panes.Main, { label: 'Document' }, 'Main'),
      h(Panes.Divider),
      h(Panes.Supporting, { label: 'Details' }, 'Side'),
    ),
  );
  assert.match(
    markup,
    /^<div class="env-panes" style="--env-panes-size:20rem" data-env-layout="panes" data-env-name="doc" data-behavior="supporting" data-split-at="expanded">/,
  );
  assert.match(markup, /class="env-panes-main" role="region" aria-label="Document"/);
  assert.match(markup, /role="region" aria-label="Details" class="env-panes-supporting"/);
  // The divider names the pane it resizes, and its width in rem.
  const controls = /aria-controls="([^"]+)"/.exec(markup)?.[1];
  assert.ok(controls && markup.includes(`id="${controls}"`), markup);
  assert.match(markup, /role="separator"[^>]*aria-valuetext="20 rem"/);
  assert.match(markup, /class="env-panes-backdrop" aria-hidden="true"/);
  const open = renderToString(
    h(
      Panes.Root,
      { behavior: 'list-detail', open: true, splitAt: 'large' },
      h(Panes.Detail, null, 'D'),
    ),
  );
  assert.match(open, /data-split-at="large" data-open=""/);
  // The back button is always in the markup; CSS shows it while one pane shows at a time.
  assert.match(open, /class="env-panes-back"/);
  assert.doesNotMatch(open, /env-panes-backdrop/);
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
  // Its gutter follows the window class of the region it sits in, compact first.
  const css = sheet('Page.css');
  assert.match(css, /container: env-page \/ inline-size;/);
  assert.match(css, /--env-page-gutter: var\(--env-space-4\);/);
  assert.match(
    css,
    /@container \(width >= 37\.5rem\) \{\s*\.env-page \{\s*--env-page-gutter: var\(--env-space-5\);/,
  );
});
