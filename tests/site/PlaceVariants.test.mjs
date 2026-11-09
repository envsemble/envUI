// A variants figure's names and uses (apps/site/src/figures/anatomy/PlaceVariants.ts): under items
// side by side, apart, and beside or under items stacked one under another.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';

const placement = await importSource(
  'PlaceVariants',
  'apps/site/src/figures/anatomy/PlaceVariants.ts',
);

const box = (left, top, right, bottom) => ({ left, top, right, bottom });

test("a variants figure's names go under items side by side, apart, and beside items stacked", () => {
  const item = (number, itemBox, added = 0) => ({
    number,
    label: `v${number}`,
    box: itemBox,
    added,
  });
  const row = [item(1, box(0, 0, 40, 20)), item(2, box(44, 0, 84, 20))];
  assert.equal(placement.stackedItems(row), null);
  const { callouts, room } = placement.variantsInRow(row, [60, 60]);
  // Names 60 wide part by their width and 12 between.
  assert.equal(callouts[1].badge.x - callouts[0].badge.x, 72);
  assert.deepEqual(room, { start: 0, bottom: 28 });
  const stack = [item(2, box(0, 40, 100, 60)), item(1, box(0, 0, 100, 20))];
  const sorted = placement.stackedItems(stack);
  assert.deepEqual(
    sorted.map(({ number }) => number),
    [1, 2],
  );
  assert.equal(placement.nameRoom([50, 80.2]), 97);
  // What each is for fits beside its item where the rows stay clear of each other.
  assert.ok(placement.fitsBeside(sorted, stack, [{ height: 20 }, { height: 20 }]));
  assert.ok(!placement.fitsBeside(sorted, stack, [{ height: 40 }, { height: 40 }]));
  // Under its item, each item stands further from the one before by the one before's use.
  assert.deepEqual(placement.spreadAbove(sorted, stack, [{ height: 30 }, { height: 10 }]), [0, 22]);
  const geometry = { width: 600, inner: 560, paddingStart: 20, rem: 16, rtl: false, items: stack };
  const rooms = placement.roomsForUses(geometry, 97);
  assert.deepEqual(rooms, { beside: 347, column: true, under: 448 });
  const placed = placement.stackedVariants(geometry, sorted, 97, [['a'], ['b']], {
    beside: [
      { width: 100, height: 20 },
      { width: 120, height: 20 },
    ],
    column: true,
  });
  assert.equal(placed.beside, true);
  assert.deepEqual(placed.room, { start: 97, bottom: 0, end: 136 });
  assert.equal(placed.callouts[0].use.x, 116);
});
