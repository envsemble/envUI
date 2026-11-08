// readPanesWidth reads the width Panes keeps under its persist key from a Cookie header.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from './support/importSource.mjs';

const { readPanesWidth } = await importSource('PanesSize', 'packages/ui/src/layout/panesSize.ts');

test('readPanesWidth reads the width kept under its key', () => {
  assert.equal(readPanesWidth('theme=dark; inbox=24.5; other=3', 'inbox'), 24.5);
  assert.equal(readPanesWidth('my%20panes=18', 'my panes'), 18);
});

test('readPanesWidth gives undefined where no width is kept', () => {
  assert.equal(readPanesWidth(undefined, 'inbox'), undefined);
  assert.equal(readPanesWidth(null, 'inbox'), undefined);
  assert.equal(readPanesWidth('theme=dark', 'inbox'), undefined);
  assert.equal(readPanesWidth('inbox=', 'inbox'), undefined);
  assert.equal(readPanesWidth('inbox=wide', 'inbox'), undefined);
});

test('readPanesWidth treats a value that is no valid encoding as absent, without throwing', () => {
  assert.equal(readPanesWidth('inbox=24%', 'inbox'), undefined);
  assert.equal(readPanesWidth('inbox=%E0%A4%A', 'inbox'), undefined);
});
