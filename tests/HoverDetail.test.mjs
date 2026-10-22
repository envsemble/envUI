// The dotted underline of text with more on hover: which HoverCard triggers take it, and the
// development warning for a text trigger that keyboard focus can't reach.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/HoverDetail.mjs');
await build({
  absWorkingDir: repository,
  stdin: {
    contents: [
      "export { HoverCard } from './packages/ui/src/feedback/HoverCard.tsx';",
      "export { Text } from './packages/ui/src/foundations/Text.tsx';",
      "export { Info } from './packages/ui/src/icons/Info.tsx';",
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
const { HoverCard, Text, Info } = await import(pathToFileURL(output).href);

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
  const { markup } = render(h(Text, { render: h('span'), tabIndex: 0 }, h(Info)));
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
