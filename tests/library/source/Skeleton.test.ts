import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

const library = await importSource('Skeleton', [
  "export { placeholders, isPlaceholder } from './packages/ui/src/foundations/placeholders.ts';",
  "export { skeletonAttributes, skeletonListAttributes, given } from './packages/ui/src/internal/skeleton.tsx';",
  "export { useSkeleton } from './packages/ui/src/foundations/SkeletonScope.tsx';",
  "export { Surface } from './packages/ui/src/layout/Surface.tsx';",
  "export { Card } from './packages/ui/src/layout/Card.tsx';",
  "export * as List from './packages/ui/src/data-display/List.tsx';",
]);
const { placeholders, isPlaceholder, skeletonAttributes, skeletonListAttributes, given } = library;
const { useSkeleton } = library;
const { Surface, Card, List } = library;

const markup = (element: ReactElement) => renderToStaticMarkup(element);

test('placeholders() returns stand-in items with ids for keys, and nothing else', () => {
  const items = placeholders(3);
  assert.deepEqual(
    items.map((item: { id: string }) => item.id),
    ['envui-placeholder-0', 'envui-placeholder-1', 'envui-placeholder-2'],
  );
  assert.deepEqual(Object.keys(items[0]), ['id']);
  assert.equal(items[0].title, undefined);
  assert.ok(items.every(isPlaceholder));
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
  assert.match(
    html,
    /^<div data-env-skeleton="" aria-busy="true" class="env-surface"[^>]*><div class="env-skeleton-content" inert=""><i>inside<\/i><\/div><\/div>$/,
  );
  const loaded = markup(h(Surface, null, h(Reader)));
  assert.doesNotMatch(loaded, /aria-busy|inert|data-env-skeleton/);
  assert.match(loaded, /<i>outside<\/i>/);
  assert.match(markup(h(Surface, { skeleton: true }, h(Card, null, h(Reader)))), /<i>inside<\/i>/);
  const list = markup(h(List.Root, { skeleton: true }, h(List.Item, { label: 'Launch brief' })));
  assert.match(
    list,
    /^<ul data-env-skeleton="" inert=""[^>]*>.*<\/ul><span class="env-skeleton-status" role="status"><\/span>$/,
  );
  const row = markup(
    h(List.Item, {
      skeleton: true,
      start: h('input', { type: 'checkbox' }),
      label: 'Launch brief',
    }),
  );
  assert.match(row, /<div class="env-skeleton-content" inert=""><div class="env-list-item-start"/);
});

test('the style sheet draws text as bars, shapes and missing text, pulses gentler on request with plain-value keyframes, and is imported last', () => {
  const css = readFileSync(join(styleSheetsDirectory, 'Skeleton.css'), 'utf8');
  assert.match(css, /\[data-env-skeleton\]:not\(env-none\) \{[^}]*text-decoration: line-through/);
  assert.match(css, /-webkit-text-fill-color: transparent/);
  assert.match(
    css,
    /\[data-env-skeleton\]:not\(env-none\) :empty::before \{[^}]*display: var\(--_skeleton-placeholder\);/,
  );
  assert.match(
    css,
    /\[data-env-skeleton\]:not\(env-none\) \{[^}]*animation: env-skeleton-pulse calc\(var\(--env-motion-duration-slow\) \* 7\.5\) var\(--env-motion-ease\)\s+infinite;/,
  );
  const block = (start: string) =>
    css.slice(css.indexOf(start), css.indexOf('\n  }\n', css.indexOf(start)));
  assert.match(
    block('@media (prefers-reduced-motion: reduce)'),
    /animation: env-skeleton-pulse-reduced calc\(var\(--env-motion-duration-slow\) \* 13\.5\)\s+var\(--env-motion-ease\) infinite;/,
  );
  assert.match(block('@keyframes env-skeleton-pulse-reduced'), /--_skeleton-pulse: 0\.5;/);
  assert.match(block('@media (forced-colors: active)'), /animation: none;/);
  const keyframes = [...css.matchAll(/@keyframes [\w-]+ \{(?:[^{}]*\{[^}]*\})*\s*\}/g)];
  assert.equal(keyframes.length, 2);
  for (const [rule] of keyframes) assert.doesNotMatch(rule, /var\(/);
  const index = readFileSync(join(styleSheetsDirectory, 'index.css'), 'utf8');
  assert.match(index, /@import '\.\/Skeleton\.css';\n$/);
});
