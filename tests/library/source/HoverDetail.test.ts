import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { HoverCard } = await importSource('HoverDetail', 'packages/ui/src/overlays/HoverCard.tsx');

function render(trigger: ReactElement) {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...values) => warnings.push(values.join(' '));
  try {
    return { markup: renderToStaticMarkup(h(HoverCard, { trigger }, 'Details')), warnings };
  } finally {
    console.warn = original;
  }
}

const underlined = (markup: string) => /class="[^"]*\benv-hover-detail\b/.test(markup);

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
  const count = h(
    'span',
    { className: 'env-avatar-group-overflow', tabIndex: 0, role: 'img', 'aria-label': 'Sam Lee' },
    h('span', { dir: 'ltr' }, '+2'),
  );
  assert.ok(!underlined(render(count).markup));
  assert.ok(!underlined(render(h('span', { role: 'button', tabIndex: 0 }, 'Details')).markup));
  assert.ok(!underlined(render(h('span', { className: 'env-badge', tabIndex: 0 }, '3')).markup));
  assert.ok(underlined(render(h('span', { role: 'text', tabIndex: 0 }, '28 h')).markup));
  assert.ok(underlined(render(h('span', { className: 'total', tabIndex: 0 }, '28 h')).markup));
});

test('underline false leaves a text trigger’s class alone, on a HoverCard and on a Tooltip', async () => {
  const { Tooltip } = await importSource(
    'HoverDetailTooltip',
    'packages/ui/src/overlays/Tooltip.tsx',
  );
  const mention = () => h('span', { className: 'mention', tabIndex: 0 }, '@sam');
  const card = renderToStaticMarkup(h(HoverCard, { trigger: mention(), underline: false }, 'Sam'));
  assert.ok(!underlined(card));
  assert.match(card, /class="mention"/);
  const tip = (props: Record<string, unknown>) =>
    renderToStaticMarkup(h(Tooltip, { content: 'Sam Lee', ...props }, mention()));
  assert.ok(underlined(tip({})));
  assert.ok(!underlined(tip({ underline: false })));
  assert.match(tip({ underline: false }), /class="mention"/);
});
