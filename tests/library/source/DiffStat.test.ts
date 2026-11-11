// DiffStat's markup: the signed counts shown, hidden from assistive technology, and its full name
// read in their place. Server markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { DiffStat } = await importSource('DiffStat', [
  "export { DiffStat } from './packages/ui/src/data-display/DiffStat.tsx';",
]);

test('a diff stat is one pill with its additions and deletions, named in full', () => {
  assert.equal(
    renderToStaticMarkup(h(DiffStat, { additions: 12, deletions: 3 })),
    '<span class="env-diff-stat"><span class="env-diff-stat-additions" aria-hidden="true">+12</span>' +
      '<span class="env-diff-stat-deletions" aria-hidden="true">−3</span>' +
      '<span class="env-diff-stat-label">12 added lines and 3 removed lines</span></span>',
  );
});
