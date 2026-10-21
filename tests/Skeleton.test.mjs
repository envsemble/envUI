// Skeletons without a page: placeholder items, the attributes a skeleton's root takes, and the
// markup of components as skeletons over placeholder items, which the style sheet reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/Skeleton.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: [
      "export { placeholders, isPlaceholder } from './packages/ui/src/foundations/placeholders.ts';",
      "export { skeletonAttributes, given } from './packages/ui/src/internal/skeleton.ts';",
      "export { useSkeleton } from './packages/ui/src/foundations/SkeletonScope.tsx';",
      "export { Surface } from './packages/ui/src/foundations/Surface.tsx';",
      "export { Text } from './packages/ui/src/foundations/Text.tsx';",
      "export { Card } from './packages/ui/src/content/Card.tsx';",
      "export * as List from './packages/ui/src/content/List.tsx';",
      "export * as Stat from './packages/ui/src/content/Stat.tsx';",
      "export { Alert } from './packages/ui/src/feedback/Alert.tsx';",
    ].join('\n'),
    resolveDir: repository,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  outfile: output,
  logLevel: 'error',
});
const library = await import(pathToFileURL(output).href);
const { placeholders, isPlaceholder, skeletonAttributes, given, useSkeleton } = library;
const { Surface, Text, Card, List, Stat, Alert } = library;

const markup = (element) => renderToStaticMarkup(element);

test('placeholders() returns stand-in items with ids for keys, and nothing else', () => {
  const items = placeholders(3);
  assert.deepEqual(
    items.map((item) => item.id),
    ['placeholder-0', 'placeholder-1', 'placeholder-2'],
  );
  assert.deepEqual(Object.keys(items[0]), ['id']);
  assert.equal(items[0].title, undefined);
  assert.ok(items.every(isPlaceholder));
  assert.equal(isPlaceholder({ id: 'placeholder-0' }), false);
  assert.equal(isPlaceholder(null), false);
  assert.deepEqual(placeholders(0), []);
  assert.deepEqual(placeholders(-2), []);
  assert.equal(placeholders(2.7).length, 2);
});

test('a skeleton root is marked, busy and inert; a popup keeps focus and only says busy', () => {
  assert.deepEqual(skeletonAttributes(false), {});
  assert.deepEqual(skeletonAttributes(undefined), {});
  assert.deepEqual(skeletonAttributes(true), {
    'data-env-skeleton': '',
    'aria-busy': true,
    inert: true,
  });
  assert.deepEqual(skeletonAttributes(true, { inert: false }), {
    'data-env-skeleton': '',
    'aria-busy': true,
  });
  assert.equal(given({ title: undefined }, 'title'), true);
  assert.equal(given({}, 'title'), false);
});

test('a surface as a skeleton marks its root and tells what is inside', () => {
  function Reader() {
    return h('i', null, useSkeleton() ? 'inside' : 'outside');
  }
  const html = markup(h(Surface, { skeleton: true }, h(Reader)));
  assert.match(html, /^<div data-env-skeleton="" aria-busy="true" inert="" class="env-surface"/);
  assert.match(html, /<i>inside<\/i>/);
  const loaded = markup(h(Surface, null, h(Reader)));
  assert.doesNotMatch(loaded, /aria-busy|inert|data-env-skeleton/);
  assert.match(loaded, /<i>outside<\/i>/);
  // A component inside a skeleton follows it without a prop of its own.
  assert.match(markup(h(Surface, { skeleton: true }, h(Card, null, h(Reader)))), /<i>inside<\/i>/);
});

test('missing text renders empty where a skeleton shows a bar, and given slots render', () => {
  const [item] = placeholders(1);
  const card = markup(
    h(Card, {
      skeleton: true,
      title: item.title,
      meta: item.updated,
      description: item.summary,
    }),
  );
  assert.match(card, /data-env-skeleton=""/);
  assert.match(card, /<h3 class="env-text env-card-heading" data-variant="title"><\/h3>/);
  assert.match(card, /class="env-text env-card-meta" data-variant="body-sm"><\/span>/);
  assert.match(card, /class="env-text env-card-description"[^>]*><\/p>/);
  // A slot not given at all renders nothing.
  assert.doesNotMatch(markup(h(Card, null, 'Body')), /env-card-heading|env-card-description/);

  const row = markup(h(List.Item, { label: item.name, description: item.owner }));
  assert.match(
    row,
    /<div class="env-list-item-content"><span class="env-text" data-variant="body-sm"><\/span><small><\/small><\/div>/,
  );
  assert.match(markup(h(List.Item, { label: 'Atlas' })), /content">Atlas<\/div>/);

  const stat = markup(h(Stat.Root, { label: 'Projects', value: undefined, skeleton: true }));
  assert.match(stat, /<div class="env-stat-value"><\/div>/);
  assert.match(markup(h(Alert, { title: undefined }, undefined)), /env-alert-title/);
  assert.match(markup(h(Text, null, undefined)), /^<p class="env-text" data-variant="body"><\/p>$/);
});

test('the style sheet draws text as bars, shapes and missing text, and keeps still on request', () => {
  const css = readFileSync(join(repository, 'packages/ui/src/styles/Skeleton.css'), 'utf8');
  assert.match(css, /\[data-env-skeleton\] \{[^}]*text-decoration: line-through/);
  assert.match(css, /-webkit-text-fill-color: transparent/);
  // Missing text is a bar only in the parts that turn it on.
  assert.match(
    css,
    /\[data-env-skeleton\] :empty::before \{[^}]*display: var\(--env-skeleton-placeholder\);/,
  );
  // The shimmer runs only without a reduced-motion preference.
  const motion = css.indexOf('@media (prefers-reduced-motion: no-preference)');
  assert.ok(motion > 0);
  assert.equal(css.indexOf('animation:'), css.indexOf('animation:', motion));
  const index = readFileSync(join(repository, 'packages/ui/src/styles/index.css'), 'utf8');
  // Last among the components, so its rules follow theirs.
  assert.match(index, /@import '\.\/Skeleton\.css' layer\(env\.components\);\n\/\*/);
});
