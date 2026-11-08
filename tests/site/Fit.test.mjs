// The fit's pure calculations (apps/site/src/fit/): boxes, the scales a tile's picture is drawn
// at, where a playing tile's view goes, a held view's scale and place, whether a resting picture
// holds its frame, and the view's glide.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/importSource.mjs';

const math = await importSource('FitMath', 'apps/site/src/fit/FitMath.ts');
const held = await importSource('HeldView', 'apps/site/src/fit/HeldView.ts');
const easing = await importSource('ViewEasing', 'apps/site/src/fit/ViewEasing.ts');

const box = (left, top, right, bottom) => ({ left, top, right, bottom });

test('boxes join into the least box around them, and cover one another to a couple of px', () => {
  assert.equal(math.join(null, null), null);
  assert.deepEqual(math.join(box(0, 5, 10, 20), null, box(-4, 8, 6, 30)), box(-4, 5, 10, 30));
  assert.ok(math.covers(box(0, 0, 100, 100), box(-2, -2, 102, 102)));
  assert.ok(!math.covers(box(0, 0, 100, 100), box(-3, 0, 100, 100)));
});

test('a playing view stays while what it shows is in the stage, else moves just far enough', () => {
  // The stage is 200 across: 100 either side of its middle.
  assert.equal(math.contain(0, -50, 50, 100), 0);
  // What reaches 30 past the edge brings the view 30 and a margin along.
  assert.equal(math.contain(0, -50, 130, 100), 30 + math.margin);
  assert.equal(math.contain(0, -130, 50, 100), -30 - math.margin);
  // What can't fit is centred.
  assert.equal(math.contain(0, 0, 400, 100), 200);
});

test('a picture is cut off at the sides it reaches past the stage at', () => {
  // A 100 by 100 stage, the view at its middle: what shows from -60 to 40 across reaches past the
  // start, and down from -40 to 70 past the foot.
  assert.equal(math.cutSides(box(-60, -40, 40, 70), 100, 100, 0, 0, 1), 'bottom start');
  assert.equal(math.cutSides(box(-50, -50, 50, 50), 100, 100, 0, 0, 1), '');
  // Drawn at half the scale, it fits.
  assert.equal(math.cutSides(box(-60, -40, 40, 70), 100, 100, 0, 0, 0.5), '');
});

test('the anchored scale is the largest at which every box keeps its room from the edges', () => {
  const parts = [
    { box: box(0, 0, 100, 40), pad: math.inset },
    { box: box(0, 40, 160, 200), pad: math.popupRoom },
  ];
  assert.equal(math.anchoredScale(parts, 1000, 1000), math.most);
  const scale = math.anchoredScale(parts, 200, 180);
  const extent = (each) => {
    const across = parts.map(({ box: part, pad }) => [
      part.left * each - pad,
      part.right * each + pad,
    ]);
    const down = parts.map(({ box: part, pad }) => [
      part.top * each - pad,
      part.bottom * each + pad,
    ]);
    const reach = (pairs) =>
      Math.max(...pairs.map(([, high]) => high)) - Math.min(...pairs.map(([low]) => low));
    return [reach(across), reach(down)];
  };
  const [across, down] = extent(scale);
  assert.ok(across <= 200.5 && down <= 180.5, 'it fits');
  const [acrossLarger, downLarger] = extent(scale + 0.001);
  assert.ok(acrossLarger > 200.5 || downLarger > 180.5, 'a little larger does not');
});

test("a phone's scales come largest first, and a picture takes the largest it fits at", () => {
  assert.deepEqual(math.phoneSteps(0.85, 0.85), [1, 0.85]);
  assert.deepEqual(math.phoneSteps(0.85, 0.7), [1, 0.85, 0.7]);
  const steps = math.phoneSteps(0.85, 0.7);
  assert.equal(math.stepDown(steps, 0.9, 0.7), 0.85);
  assert.equal(math.stepDown(steps, 1, 0.7), 1);
  // None between: the least.
  assert.equal(math.stepDown(steps, 0.6, 0.5), 0.5);
});

test('a playing tile is drawn out about the trigger of what it opened, no smaller than its least', () => {
  const view = { at: { x: 0, y: 0, scale: 1 }, across: 300, down: 200, least: 0.5 };
  const stepped = (scale) => scale;
  // A menu that fits the stage at its scale keeps the scale.
  const fits = math.drawOut({
    ...view,
    must: box(-60, 0, 60, 80),
    anchor: box(-30, -20, 30, 0),
    scale: 1,
    stepped,
  });
  assert.equal(fits.scale, 1);
  // A list taller than the stage is drawn smaller, with its trigger where it was on the stage.
  const tall = math.drawOut({
    ...view,
    least: 0.2,
    must: box(-60, 0, 60, 300),
    anchor: box(-30, -20, 30, 0),
    scale: 1,
    stepped,
  });
  assert.ok(tall.scale < 1 && tall.scale > 0.2);
  const onStage = (point, to, size, scale) => size / 2 - to + point * scale;
  assert.ok(Math.abs(onStage(-10, tall.toY, 200, tall.scale) - onStage(-10, 0, 200, 1)) < 1e-6);
  // Never smaller than its least, however much it needs.
  const huge = math.drawOut({
    ...view,
    must: box(0, 0, 60, 4000),
    anchor: null,
    scale: 1,
    stepped,
  });
  assert.equal(huge.scale, view.least);
  // A little past the margin keeps the scale.
  const near = math.drawOut({
    ...view,
    must: box(-60, -80, 60, 100),
    anchor: null,
    scale: 1,
    stepped,
  });
  assert.equal(near.scale, 1);
});

test('a held view shows its chosen row and the rows after it, as many as its scale allows', () => {
  const rows = held.heldRows(
    [box(0, 100, 200, 120)],
    [box(0, 120, 200, 140)],
    [box(0, 140, 200, 160)],
  );
  assert.deepEqual(rows.keep, box(0, 100, 200, 140));
  assert.deepEqual(rows.keepFurther, box(0, 100, 200, 160));
  assert.equal(held.heldRows([], [], []), null);
  const ways = held.heldWays(rows);
  assert.equal(ways.length, 6);
  assert.deepEqual(ways[0].reach, rows.keepFurther);
  // The last two show the chosen row alone.
  assert.deepEqual(ways.at(-1).whole, rows.chosen);
  const room = { size: 150, top: 0, pointerFoot: null, cursor: 20 };
  // At its own size, its chosen row and the next show whole above a 150 stage's foot, the row
  // after them past it, moved up nearer the top than the inset, the fade starting under them.
  assert.deepEqual(held.heldPlace(1, ways, room), { at: 12, fadeAt: 140 });
  // Larger, the rows run past the stage: only less than the inset from the top, else not at all.
  assert.equal(held.heldPlace(2, ways, room), null);
  // The largest scale a way shows at is where its top is just placed.
  const way = ways.at(-1);
  const most = held.heldAtMost(0.5, 2, way, room);
  assert.ok(held.heldTop(most, way, room));
  assert.equal(held.heldTop(most + 0.01, way, room), null);
});

test('a held view taller than its stage is drawn at the largest scale that shows it', () => {
  const rows = held.heldRows([box(0, 300, 200, 320)], [], []);
  const ways = held.heldWays(rows);
  const room = { size: 200, top: 0, pointerFoot: null, cursor: 20 };
  const scales = { phone: false, steps: [1], popupLeast: 0.84, overlayScale: 0.75 };
  // Short enough, it keeps its scale.
  assert.equal(held.heldScale(1, ways, room, { tall: 100, height: 168 }, scales), 1);
  // Its chosen row, from 300 to 320, shows above a 200 stage's foot only below the overlays' scale.
  const scale = held.heldScale(1, ways, room, { tall: 320, height: 168 }, scales);
  assert.ok(scale < 0.75);
  assert.ok(held.heldPlace(scale, ways, room) || scale === 0.6);
  // With nothing chosen, it keeps its scale.
  assert.equal(held.heldScale(1, [], room, { tall: 320, height: 168 }, scales), 1);
});

test('a held subject takes the largest of the scales tiles are drawn at that shows it whole', () => {
  const scales = { phone: true, steps: [1, 0.85, 0.7], popupLeast: 0.7, overlayScale: Number.NaN };
  assert.equal(held.subjectScale(1, 1.2, scales), 1);
  assert.equal(held.subjectScale(1, 0.9, scales), 0.85);
  assert.equal(held.subjectScale(1, 0.72, scales), 0.7);
  // Below every step, as small as it needs, down to a held view's least.
  assert.equal(held.subjectScale(1, 0.6512, scales), 0.651);
  assert.equal(held.subjectScale(1, 0.3, scales), 0.6);
});

test('a resting picture holds its frame, and follows its popups placed again only so often', () => {
  const shape = (view, popupLeft = 0, whole = true) => ({
    room: [200, 150, 300, 200],
    whole,
    view,
    boxes: [
      { box: box(0, 0, 100, 40), popup: null },
      { box: box(popupLeft, 40, popupLeft + 100, 140), popup: {} },
    ],
    popups: 1,
  });
  const follow = { count: 0, following: false };
  // Nothing moved: held, and framed anew on a popup placed elsewhere.
  assert.ok(held.holdsFrame(shape([0, 0]), shape([0, 0]), follow));
  assert.ok(!held.holdsFrame(shape([0, 0]), shape([0, 0], 3), follow));
  // A change outside the popups, or of the stage, frames it anew.
  assert.ok(
    !held.holdsFrame(shape([0, 0]), { ...shape([0, 0]), room: [210, 150, 300, 200] }, follow),
  );
  // Scrolled to the window's edge, it holds.
  assert.ok(held.holdsFrame(shape([0, 0]), shape([0, 0], 30, false), follow));
  // The view moved: a popup placed a few px away holds; further, it is followed, so often.
  assert.ok(held.holdsFrame(shape([0, 0]), shape([5, 0], 3), follow));
  for (let count = 0; count < 30; count++)
    assert.ok(!held.holdsFrame(shape([0, 0]), shape([5, 0], 10), follow));
  assert.ok(follow.following);
  assert.ok(held.holdsFrame(shape([0, 0]), shape([5, 0], 10), follow));
});

test('the view glides to where it goes, bent to a target that moves on the way', () => {
  const linear = (time) => Math.min(1, Math.max(0, time));
  const first = easing.steer(null, [0, 0, 1], [100, 0, 1], 0, 100, linear);
  assert.deepEqual(first, { from: [0, 0, 1], to: [100, 0, 1], start: 0, length: 100 });
  assert.equal(easing.steer(first, [40, 0, 1], [100, 0, 1], 40, 100, linear), first);
  const halfway = easing.glideAt(first, 50, linear);
  assert.deepEqual(halfway, { at: [50, 0, 1], settled: false });
  // A new target halfway: the glide keeps its time and passes through where the view is.
  const bent = easing.steer(first, [50, 0, 1], [200, 0, 1], 50, 100, linear);
  assert.equal(bent.start, 0);
  assert.deepEqual(easing.glideAt(bent, 50, linear).at, [50, 0, 1]);
  assert.deepEqual(easing.glideAt(bent, 100, linear), { at: [200, 0, 1], settled: true });
  // Late in a glide, a new one starts from where the view is.
  const late = easing.steer(first, [90, 0, 1], [200, 0, 1], 90, 100, linear);
  assert.deepEqual(late, { from: [90, 0, 1], to: [200, 0, 1], start: 90, length: 100 });
});
