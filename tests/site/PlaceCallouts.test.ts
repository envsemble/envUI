import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.ts';

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

test('a callout to a part thinner than its dot, such as a separator, points at its middle', () => {
  const part = (number, box, corner) => ({
    number,
    element: number - 1,
    text: false,
    box,
    corners: { topLeft: corner, topRight: corner, bottomLeft: corner, bottomRight: corner },
    inline: false,
    edge: true,
    ownEdge: true,
    region: false,
    repeated: false,
  });
  const { callouts } = placement.placeCallouts({
    width: 200,
    height: 64,
    rtl: false,
    parts: [
      part(1, { left: 0, top: 0, right: 80, bottom: 40 }, 6),
      part(2, { left: 100, top: 4, right: 101, bottom: 36 }, 0.5),
    ],
    contains: [
      [true, false],
      [false, true],
    ],
    labels: [],
  });
  const { anchor } = callouts.find(({ index }) => index === 1);
  assert.ok(Number.isFinite(anchor.x) && Number.isFinite(anchor.y), JSON.stringify(anchor));
  assert.ok(anchor.x >= 100 && anchor.x <= 101, `${anchor.x} is on the separator`);
});

test('a badge stays whole inside the stage when its part reaches the stage edge', () => {
  const part = (number, box) => ({
    number,
    element: number - 1,
    text: false,
    box,
    corners: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
    inline: false,
    edge: true,
    ownEdge: true,
    region: false,
    repeated: false,
  });
  const width = 240;
  const height = 120;
  const { callouts } = placement.placeCallouts({
    width,
    height,
    rtl: false,
    parts: [
      part(1, { left: 20, top: 40, right: 120, bottom: 80 }),
      part(2, { left: 140, top: 10, right: 230, bottom: 110 }),
    ],
    contains: [
      [true, false],
      [false, true],
    ],
    labels: [],
  });
  for (const { badge } of callouts) {
    assert.ok(badge.x - 12 >= 0 && badge.x + 12 <= width, `badge at x ${badge.x}`);
    assert.ok(badge.y - 12 >= 0 && badge.y + 12 <= height, `badge at y ${badge.y}`);
  }
});
