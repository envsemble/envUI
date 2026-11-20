import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const { Panes } = await importSource('Panes', [
  "export * as Panes from './packages/ui/src/layout/Panes.tsx';",
]);

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
