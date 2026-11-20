import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Scaffold, resolveNavigationForms } = await importSource('Scaffold', [
  "export * from './packages/ui/src/layout/Scaffold.tsx';",
  "export { resolveNavigationForms } from './packages/ui/src/layout/internal/scaffold/navigationForms.ts';",
]);

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
