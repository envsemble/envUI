// Skeletons without a page: placeholder items, the attributes a skeleton's root takes, and the
// markup of components as skeletons over placeholder items, which the style sheet reads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource, repository } from '../support/importSource.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const library = await importSource('Skeleton', [
  "export { placeholders, isPlaceholder } from './packages/ui/src/foundations/placeholders.ts';",
  "export { skeletonAttributes, skeletonListAttributes, given } from './packages/ui/src/internal/skeleton.tsx';",
  "export { useSkeleton } from './packages/ui/src/foundations/SkeletonScope.tsx';",
  "export { Surface } from './packages/ui/src/layout/Surface.tsx';",
  "export { Text } from './packages/ui/src/foundations/Text.tsx';",
  "export { Card } from './packages/ui/src/layout/Card.tsx';",
  "export * as List from './packages/ui/src/data-display/List.tsx';",
  "export { Alert } from './packages/ui/src/feedback/Alert.tsx';",
]);
const { placeholders, isPlaceholder, skeletonAttributes, skeletonListAttributes, given } = library;
const { useSkeleton } = library;
const { Surface, Text, Card, List, Alert } = library;

const markup = (element) => renderToStaticMarkup(element);

test('placeholders() returns stand-in items with ids for keys, and nothing else', () => {
  const items = placeholders(3);
  assert.deepEqual(
    items.map((item) => item.id),
    ['envui-placeholder-0', 'envui-placeholder-1', 'envui-placeholder-2'],
  );
  assert.deepEqual(Object.keys(items[0]), ['id']);
  assert.equal(items[0].title, undefined);
  assert.ok(items.every(isPlaceholder));
  // By the id, so a stand-in stays one when it is serialized, as to a client component.
  assert.ok(isPlaceholder(JSON.parse(JSON.stringify(items[1]))));
  assert.equal(isPlaceholder({ id: 'project-1' }), false);
  assert.equal(isPlaceholder({ id: 7 }), false);
  assert.equal(isPlaceholder(null), false);
  assert.deepEqual(placeholders(0), []);
  assert.deepEqual(placeholders(-2), []);
  assert.equal(placeholders(2.7).length, 2);
});

test('a skeleton root is marked and busy, and a list, which holds no wrapper, inert', () => {
  assert.deepEqual(skeletonAttributes(false), {});
  assert.deepEqual(skeletonAttributes(undefined), {});
  assert.deepEqual(skeletonAttributes(true), { 'data-env-skeleton': '', 'aria-busy': true });
  assert.deepEqual(skeletonListAttributes(true), { 'data-env-skeleton': '', inert: true });
  assert.deepEqual(skeletonListAttributes(false), {});
  assert.equal(given({ title: undefined }, 'title'), true);
  assert.equal(given({}, 'title'), false);
});

test('a surface as a skeleton marks its root and tells what is inside', () => {
  function Reader() {
    return h('i', null, useSkeleton() ? 'inside' : 'outside');
  }
  const html = markup(h(Surface, { skeleton: true }, h(Reader)));
  // The root is the busy region people hear; its content, without a box of its own, is inert.
  assert.match(
    html,
    /^<div data-env-skeleton="" aria-busy="true" class="env-surface"[^>]*><div class="env-skeleton-content" inert=""><i>inside<\/i><\/div><\/div>$/,
  );
  const loaded = markup(h(Surface, null, h(Reader)));
  assert.doesNotMatch(loaded, /aria-busy|inert|data-env-skeleton/);
  assert.match(loaded, /<i>outside<\/i>/);
  // A component inside a skeleton follows it without a prop of its own.
  assert.match(markup(h(Surface, { skeleton: true }, h(Card, null, h(Reader)))), /<i>inside<\/i>/);
  // A list can't hold a wrapper: it is inert, with a hidden status beside it, which is empty as
  // it is rendered, so the text that goes in after it mounts is announced.
  const list = markup(h(List.Root, { skeleton: true }, h(List.Item, { label: 'Launch brief' })));
  assert.match(
    list,
    /^<ul data-env-skeleton="" inert=""[^>]*>.*<\/ul><span class="env-skeleton-status" role="status"><\/span>$/,
  );
  // A row on its own wraps its start slot too.
  const row = markup(
    h(List.Item, {
      skeleton: true,
      start: h('input', { type: 'checkbox' }),
      label: 'Launch brief',
    }),
  );
  assert.match(row, /<div class="env-skeleton-content" inert=""><div class="env-list-item-start"/);
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
  assert.match(card, /<h3 class="env-text env-card-title" data-variant="title"><\/h3>/);
  assert.match(card, /class="env-text env-card-meta" data-variant="body-sm"><\/span>/);
  assert.match(card, /class="env-text env-card-description"[^>]*><\/p>/);
  // A slot not given at all renders nothing.
  assert.doesNotMatch(markup(h(Card, null, 'Body')), /env-card-title|env-card-description/);

  const row = markup(h(List.Item, { label: item.name, description: item.owner }));
  assert.match(
    row,
    /<div class="env-list-item-content"><span class="env-text" data-variant="body-sm"><\/span><small><\/small><\/div>/,
  );
  assert.match(markup(h(List.Item, { label: 'Launch brief' })), /content">Launch brief<\/div>/);

  assert.match(markup(h(Alert, { title: undefined }, undefined)), /env-alert-title/);
  assert.match(markup(h(Text, null, undefined)), /^<p class="env-text" data-variant="body"><\/p>$/);
});

test('the style sheet draws text as bars, shapes and missing text, and pulses gentler on request', () => {
  const css = readFileSync(join(repository, 'packages/ui/src/styles/Skeleton.css'), 'utf8');
  assert.match(css, /\[data-env-skeleton\]:not\(env-none\) \{[^}]*text-decoration: line-through/);
  assert.match(css, /-webkit-text-fill-color: transparent/);
  // Missing text is a bar only in the parts that turn it on.
  assert.match(
    css,
    /\[data-env-skeleton\]:not\(env-none\) :empty::before \{[^}]*display: var\(--env-skeleton-placeholder\);/,
  );
  // The pulse: a breath of 7.5 slow durations, 1.8 s, from the motion tokens, so tokens of 0s stop
  // it; slower and half as deep with a reduced-motion preference, and none in forced colors.
  assert.match(
    css,
    /\[data-env-skeleton\]:not\(env-none\) \{[^}]*animation: env-skeleton-pulse calc\(var\(--env-motion-duration-slow\) \* 7\.5\) var\(--env-motion-ease\)\s+infinite;/,
  );
  const block = (start) =>
    css.slice(css.indexOf(start), css.indexOf('\n  }\n', css.indexOf(start)));
  assert.match(
    block('@media (prefers-reduced-motion: reduce)'),
    /animation: env-skeleton-pulse-reduced calc\(var\(--env-motion-duration-slow\) \* 13\.5\)\s+var\(--env-motion-ease\) infinite;/,
  );
  assert.match(block('@keyframes env-skeleton-pulse-reduced'), /--env-skeleton-pulse: 0\.5;/);
  assert.match(block('@media (forced-colors: active)'), /animation: none;/);
  // Its keyframes are plain values: Firefox doesn't interpolate a registered custom property
  // between keyframes that use var().
  const keyframes = [...css.matchAll(/@keyframes [\w-]+ \{(?:[^{}]*\{[^}]*\})*\s*\}/g)];
  assert.equal(keyframes.length, 2);
  for (const [rule] of keyframes) assert.doesNotMatch(rule, /var\(/);
  const index = readFileSync(join(repository, 'packages/ui/src/styles/index.css'), 'utf8');
  // Last among the components in styles.css, so its rules follow theirs; where a bundler puts it
  // first, a type selector more wins the same ties.
  assert.match(index, /@import '\.\/Skeleton\.css';\n$/);
});
