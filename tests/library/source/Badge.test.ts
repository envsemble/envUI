import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { Badge } = await importSource('Badge', [
  "export { Badge } from './packages/ui/src/data-display/Badge.tsx';",
]);

test('a badge shows its label in its tone and variant', () => {
  const markup = renderToStaticMarkup(h(Badge, { tone: 'success' }, 'Done'));
  assert.equal(
    markup,
    '<span class="env-badge" data-tone="success" data-variant="soft"><span class="env-badge-label">Done</span></span>',
  );
});

test('a badge with count is a compact count, the number alone its name', () => {
  const markup = renderToStaticMarkup(h(Badge, { count: 12 }));
  assert.match(
    markup,
    /^<span class="env-badge" data-tone="neutral" data-variant="soft" data-count="">/,
  );
  assert.match(markup, /<span class="env-badge-label">12<\/span><\/span>$/);
  assert.match(renderToStaticMarkup(h(Badge, { count: 0 })), /data-count="">.*>0<\/span>/);
});

test("a count's aria-label is read in place of the number, which is hidden", () => {
  const markup = renderToStaticMarkup(
    h(Badge, { count: '99+', 'aria-label': '120 unread', tone: 'primary', variant: 'solid' }),
  );
  assert.doesNotMatch(markup, /aria-label/);
  assert.match(markup, /data-tone="primary" data-variant="solid" data-count=""/);
  assert.match(markup, /<span class="env-badge-label" aria-hidden="true">99\+<\/span>/);
  assert.match(markup, /<span class="env-badge-count-label">120 unread<\/span>/);
});

test('a label takes any inline content, and start is placed as given in place of the check mark', () => {
  const label = renderToStaticMarkup(h(Badge, null, h('strong', null, '12'), ' seats'));
  assert.match(label, /<span class="env-badge-label"><strong>12<\/strong> seats<\/span>/);
  const started = renderToStaticMarkup(
    h(Badge, { tone: 'done', start: h('span', { 'data-swatch': '' }, 'N') }, 'Northwind'),
  );
  assert.doesNotMatch(started, /env-icon|aria-hidden/);
  assert.match(
    started,
    /<span class="env-badge-start" data-env-slot="row" data-env-slot-shrink="never"><span data-swatch="">N<\/span><\/span><span class="env-badge-label">Northwind<\/span>/,
  );
});

test('a done badge leads with a check mark in its start slot, and start={null} shows none', () => {
  const done = renderToStaticMarkup(h(Badge, { tone: 'done' }, 'Shipped'));
  assert.match(
    done,
    /^<span class="env-badge" data-tone="done" data-variant="soft"><span class="env-badge-start" data-env-slot="row" data-env-slot-shrink="never"><svg [^>]*class="env-icon-symbol"/,
  );
  const plain = renderToStaticMarkup(h(Badge, { tone: 'done', start: null }, 'Shipped'));
  assert.doesNotMatch(plain, /env-badge-start|svg/);
  assert.doesNotMatch(
    renderToStaticMarkup(h(Badge, { tone: 'success' }, 'Live')),
    /env-badge-start/,
  );
});
