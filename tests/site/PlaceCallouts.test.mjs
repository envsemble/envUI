// An anatomy figure's callout placement (apps/site/src/figures/anatomy/PlaceCallouts.ts): badges spread
// along a side, lines that meet a rounded part on its curve, the parts the legend names alone, the
// side each part's callout takes, and the reading order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.mjs';

const placement = await importSource(
  'PlaceCallouts',
  'apps/site/src/figures/anatomy/PlaceCallouts.ts',
);

const box = (left, top, right, bottom) => ({ left, top, right, bottom });
const square = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
/** A part of a geometry: its legend number, element and box, with no edge or text of its own. */
const part = (number, element, partBox, more = {}) => ({
  number,
  element,
  text: false,
  box: partBox,
  corners: square,
  inline: false,
  edge: true,
  ownEdge: true,
  region: false,
  repeated: false,
  ...more,
});
/** Whether each element holds each other, by the boxes they nest in, from a list of who holds whom. */
const containment = (count, holds) =>
  Array.from({ length: count }, (_, outer) =>
    Array.from(
      { length: count },
      (_, inner) => outer === inner || holds.some(([a, b]) => a === outer && b === inner),
    ),
  );

test('badges along a side keep their spacing, inside the side, in their own order', () => {
  // Two at one place part to the badges' spacing, 36.
  assert.deepEqual(placement.spread([100, 100], 0, 400), [100, 136]);
  // Pressed against the end, they move back from it.
  assert.deepEqual(placement.spread([390, 380], 0, 400), [400, 364]);
  // Far apart, they stay.
  assert.deepEqual(placement.spread([300, 50], 0, 400), [300, 50]);
});

test("a line meets a rounded part on its curve, and a square one at its box's side", () => {
  assert.equal(placement.cornerInset(50, 100, 0, 0), 0);
  // At the corner of an 8px radius, 8px in; past the curve, none.
  assert.equal(placement.cornerInset(0, 100, 8, 8), 8);
  assert.equal(placement.cornerInset(20, 100, 8, 8), 0);
  assert.equal(placement.cornerInset(100, 100, 0, 8), 8);
});

test('an outline gives way across a label its edge runs through, not one inside it', () => {
  const outline = box(0, 10, 200, 50);
  assert.equal(placement.gapsIn(outline, [box(20, 20, 60, 30)]), undefined);
  assert.deepEqual(placement.gapsIn(outline, [box(20, 4, 60, 16)]), [
    { x: 20, y: 4, width: 40, height: 12 },
  ]);
});

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

test('a frame around several parts, with no edge of its own, and what fills it are named alone', () => {
  // A field (0) around its label (1) and its control (2), which holds an input (3) as wide.
  const parts = [
    part(1, 0, box(0, 0, 200, 60), { ownEdge: false, edge: false }),
    part(2, 1, box(0, 0, 60, 16)),
    part(3, 2, box(0, 20, 200, 60)),
    part(4, 3, box(10, 30, 120, 50)),
    part(5, 4, box(150, 30, 190, 50)),
  ];
  const contains = containment(5, [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [2, 3],
    [2, 4],
  ]);
  const whole = placement.wholeParts(parts, contains);
  assert.deepEqual(
    whole.map(({ number }) => number),
    [1, 3],
  );
});

test("each part's callout takes the side it is nearest, the root's its start", () => {
  // A card (0) with a title at its top (1) and actions at its foot (2), in a 400 by 300 stage.
  const geometry = {
    width: 400,
    height: 300,
    rtl: false,
    parts: [
      part(1, 0, box(100, 50, 300, 250)),
      part(2, 1, box(120, 60, 280, 80)),
      part(3, 2, box(120, 220, 280, 240)),
    ],
    contains: containment(3, [
      [0, 1],
      [0, 2],
    ]),
    labels: [],
  };
  const { callouts, whole } = placement.placeCallouts(geometry);
  assert.deepEqual(whole, []);
  const byIndex = Object.fromEntries(callouts.map((callout) => [callout.index, callout]));
  // The root at the start, the title above, the actions below, each 28px out from the card.
  assert.equal(byIndex[0].badge.x, 100 - 28);
  assert.equal(byIndex[1].badge.y, 50 - 28);
  assert.equal(byIndex[2].badge.y, 250 + 28);
  // Each line meets its part: the title's at its top, the actions' at their foot.
  assert.equal(byIndex[1].anchor.y, 60);
  assert.equal(byIndex[2].anchor.y, 240);
  // Numbered as read: the title's row first, then the root's, then the foot's.
  assert.deepEqual(
    callouts.map(({ index }) => index),
    [1, 0, 2],
  );
  // In a right-to-left stage, the root's callout sits at its right.
  const rtl = placement.placeCallouts({ ...geometry, rtl: true });
  assert.equal(rtl.callouts.find(({ index }) => index === 0).badge.x, 300 + 28);
});

test('a callout keeps clear of what opens a popup shown open', () => {
  // A list (0) open under its field, with an option (1) whose nearest side is up, past the field.
  const geometry = {
    width: 400,
    height: 400,
    rtl: false,
    parts: [part(1, 0, box(100, 100, 300, 300)), part(2, 1, box(110, 110, 290, 130))],
    contains: containment(2, [[0, 1]]),
    labels: [],
    opener: box(100, 40, 300, 90),
  };
  const option = placement.placeCallouts(geometry).callouts.find(({ index }) => index === 1);
  assert.notEqual(option.badge.y, 40 - 28);
  assert.ok(option.badge.x > 300 || option.badge.x < 100 || option.badge.y > 300);
});
