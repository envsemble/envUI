// An anatomy figure's callouts (apps/site/src/figures/anatomy/PlaceCallouts.ts): their reading
// order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';

const placement = await importSource(
  'PlaceCallouts',
  'apps/site/src/figures/anatomy/PlaceCallouts.ts',
);

test('callouts are numbered by rows from the top, each from the start', () => {
  const callout = (x, y) => ({ number: 0, index: 0, badge: { x, y }, anchor: { x, y } });
  const ordered = placement.inReadingOrder(
    [callout(300, 0), callout(10, 200), callout(100, 5)],
    false,
  );
  assert.deepEqual(
    ordered.map(({ badge, number }) => [badge.x, number]),
    [
      [100, 1],
      [300, 2],
      [10, 3],
    ],
  );
  const rtl = placement.inReadingOrder([callout(100, 0), callout(300, 5)], true);
  assert.deepEqual(
    rtl.map(({ badge }) => badge.x),
    [300, 100],
  );
});
