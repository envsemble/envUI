// The dotted underline of text with more on hover: which HoverCard triggers take it, and the
// development warning for a text trigger that keyboard focus can't reach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from './support/importSource.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { HoverCard, Text, IconInfo } = await importSource('HoverDetail', [
  "export { HoverCard } from './packages/ui/src/feedback/HoverCard.tsx';",
  "export { Text } from './packages/ui/src/foundations/Text.tsx';",
  "export { IconInfo } from './packages/ui/src/icons/Info.tsx';",
]);

/** Renders a HoverCard with a trigger, and returns its markup and the warnings it gave. */
function render(trigger) {
  const warnings = [];
  const original = console.warn;
  console.warn = (...values) => warnings.push(values.join(' '));
  try {
    return { markup: renderToStaticMarkup(h(HoverCard, { trigger }, 'Details')), warnings };
  } finally {
    console.warn = original;
  }
}

const underlined = (markup) => /class="[^"]*\benv-hover-detail\b/.test(markup);

test('Text that holds text takes the dotted underline', () => {
  assert.ok(underlined(render(h(Text, { tabIndex: 0 }, '28 h this week')).markup));
});

test('Text that holds only an icon takes no underline', () => {
  const { markup } = render(h(Text, { render: h('span'), tabIndex: 0 }, h(IconInfo)));
  assert.ok(markup.includes('<svg'), markup);
  assert.ok(!underlined(markup), markup);
});

test('Text a server component rendered, a p with env-text, takes the underline too', () => {
  // A server component's Text reaches a client HoverCard as the p it rendered.
  const { markup } = render(h('p', { className: 'env-text', tabIndex: 0 }, '28 h this week'));
  assert.ok(underlined(markup), markup);
  assert.ok(!underlined(render(h('p', { tabIndex: 0 }, 'A paragraph')).markup));
});

test('a text trigger without tabIndex gives a development warning, once', () => {
  const first = render(h('span', null, '28 h'));
  assert.equal(first.warnings.length, 1);
  assert.match(first.warnings[0], /^envUI: A HoverCard whose trigger is text needs tabIndex=\{0\}/);
  assert.deepEqual(render(h('span', null, '12 h')).warnings, []);
});

test('a focusable text trigger, or a link, gives no warning', () => {
  assert.deepEqual(render(h('span', { tabIndex: 0 }, '28 h')).warnings, []);
  assert.deepEqual(render(h('a', { href: '/roadmap' }, 'Roadmap')).warnings, []);
});

test('a count or other part with a role of its own takes no underline', () => {
  // An avatar group's overflow count, "+2", is an image named by the people it hides.
  const count = h(
    'span',
    { className: 'env-avatar-group-overflow', tabIndex: 0, role: 'img', 'aria-label': 'Sam Lee' },
    h('span', { dir: 'ltr' }, '+2'),
  );
  assert.ok(!underlined(render(count).markup));
  assert.ok(!underlined(render(h('span', { role: 'button', tabIndex: 0 }, 'Details')).markup));
  // Another component's part, even without a role, isn't text either.
  assert.ok(!underlined(render(h('span', { className: 'env-badge', tabIndex: 0 }, '3')).markup));
  // Text keeps it, with a role text may take or a class of the application's own.
  assert.ok(underlined(render(h('span', { role: 'text', tabIndex: 0 }, '28 h')).markup));
  assert.ok(underlined(render(h('span', { className: 'total', tabIndex: 0 }, '28 h')).markup));
});
