// The fit's pure calculations and decisions (apps/site/src/fit/): what a picture is fitted as and
// how its view is placed, boxes, the scales a tile's picture is drawn at, a still framed on its
// pointer's course, where a playing tile's view goes and where it is cut off, a held view's scale
// and place, a modal's screen, a popup's and a resting picture's scale, whether a resting picture
// holds its frame, the view's glide, the crop's trimmed rows, a device figure's scale and view, and
// an open example's room for its overlays.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/importSource.mjs';

const math = await importSource('FitGeometry', 'apps/site/src/fit/FitGeometry.ts');
const held = await importSource('HeldView', 'apps/site/src/fit/HeldView.ts');
const easing = await importSource('ViewEasing', 'apps/site/src/fit/ViewEasing.ts');
const kinds = await importSource('FitKind', 'apps/site/src/fit/FitKind.ts');
const screen = await importSource('FitScreen', 'apps/site/src/fit/FitScreen.ts');
const playing = await importSource('FitPlaying', 'apps/site/src/fit/FitPlaying.ts');
const popups = await importSource('FitResting', 'apps/site/src/fit/FitResting.ts');
const device = await importSource('DeviceFit', 'apps/site/src/fit/standalone/DeviceFit.ts');
const draw = await importSource('FitDraw', 'apps/site/src/fit/FitDraw.ts');
const room = await importSource('OverlayRoom', 'apps/site/src/fit/standalone/OverlayRoom.ts');

const box = (left, top, right, bottom) => ({ left, top, right, bottom });

test('a tile is fitted as one of four kinds, by how its page frames it and what it is', () => {
  const tile = { tile: true };
  const drawing = { tile: true, window: { width: 10 } };
  assert.deepEqual(kinds.fitKindOf(tile, 'own'), { scale: 'own', tile: true });
  assert.deepEqual(kinds.fitKindOf({}, 'own'), { scale: 'own', tile: false });
  // A drawing, whose window is narrower than the tiles', is drawn at its window's scale.
  assert.deepEqual(kinds.fitKindOf(drawing, 'own'), { scale: 'window', tile: true });
  assert.deepEqual(kinds.fitKindOf(drawing, 'legible'), { scale: 'legible', tile: true });
  assert.deepEqual(kinds.fitKindOf({}, 'legible'), { scale: 'legible', tile: false });
  assert.deepEqual(kinds.fitKindOf(tile, undefined), { scale: 'window', tile: true });
  assert.deepEqual(kinds.fitKindOf(undefined, undefined), { scale: 'content', tile: false });
  // The same kind is the same object, so the fit restarts only when the kind changes (useFit).
  assert.equal(kinds.fitKindOf(tile, 'own'), kinds.fitKindOf({ tile: true }, 'own'));
  assert.ok(kinds.cropped({ scale: 'own', tile: false }));
  assert.ok(kinds.cropped({ scale: 'legible', tile: true }));
  assert.ok(!kinds.cropped({ scale: 'window', tile: true }));
  assert.ok(!kinds.cropped({ scale: 'content', tile: false }));
});

test('a fit is placed on its screen, drawn out as a cropped tile plays once shown, else at rest', () => {
  const mode = (kind, moment, screen = false) => kinds.fitModeOf(kind, screen, moment);
  const component = { scale: 'own', tile: true };
  const playing = { playing: true, shown: true };
  assert.equal(mode(component, playing, true), 'screen');
  assert.equal(mode(component, { playing: false, shown: true }, true), 'screen');
  assert.equal(mode(component, playing), 'playing');
  assert.equal(mode({ scale: 'legible', tile: true }, playing), 'playing');
  // First fitted as it plays, it is framed as at rest.
  assert.equal(mode(component, { playing: true, shown: false }), 'resting');
  // A tile at its window's scale, and an example, are placed at rest as they play too.
  assert.equal(mode({ scale: 'window', tile: true }, playing), 'resting');
  assert.equal(mode({ scale: 'own', tile: false }, playing), 'resting');
});

test('each kind is drawn at rest at its own scale', () => {
  const extent = { ...box(0, 0, 200, 100), width: 300, height: 120 };
  const resting = {
    extent,
    window: 0.9,
    own: 0.85,
    popup: false,
    scales: { phone: false, popupLeast: 0.8, overlay: 0 },
    popupScale: (atMost) => Math.min(atMost, 0.75),
    overlayWhole: Infinity,
  };
  const scale = (kind, change = {}) => math.restingScale(kind, { ...resting, ...change });
  assert.equal(scale({ scale: 'own', tile: true }), 0.85);
  // A component's popup is drawn as decidePopups says, at most its own size.
  assert.equal(scale({ scale: 'own', tile: true }, { popup: true }), 0.75);
  // An overlay at the overlays' scale, or smaller where it shows whole across only so, down to
  // the popups' least.
  const overlay = {
    popup: true,
    scales: { ...resting.scales, popupLeast: 0.5, overlay: 0.7 },
    popupScale: (at) => at,
  };
  assert.equal(scale({ scale: 'own', tile: true }, overlay), 0.7);
  assert.equal(scale({ scale: 'own', tile: true }, { ...overlay, overlayWhole: 0.6 }), 0.6);
  assert.equal(scale({ scale: 'own', tile: true }, { ...overlay, overlayWhole: 0.2 }), 0.5);
  // A scene no smaller than legible, nor larger than its own size.
  assert.equal(scale({ scale: 'legible', tile: true }), 0.9);
  assert.equal(scale({ scale: 'legible', tile: true }, { window: 0.5 }), math.legibleScale);
  assert.equal(scale({ scale: 'legible', tile: true }, { window: 1.5 }), 1);
  assert.equal(scale({ scale: 'window', tile: true }, { window: 1.5 }), 1.5);
  // An example as large as what it paints fits, no larger than its window.
  assert.equal(scale({ scale: 'content', tile: false }), 0.9);
  assert.equal(scale({ scale: 'content', tile: false }, { window: 2 }), 1.2);
});

test("a component's own size follows its least box, and on a phone takes one of its steps", () => {
  const extent = { ...box(0, 0, 400, 100), width: 300, height: 120 };
  const scales = { least: 240, leastBlock: 0, floor: 0, phone: false, steps: [1] };
  assert.equal(math.ownScale(extent, scales), 1);
  assert.equal(math.ownScale(extent, { ...scales, least: 600 }), 0.5);
  assert.equal(math.ownScale(extent, { ...scales, leastBlock: 240 }), 0.5);
  const phone = { ...scales, floor: 0.85, phone: true, steps: math.phoneSteps(0.85, 0.7) };
  // 300 of room for 400 across: the floor.
  assert.equal(math.ownScale(extent, phone), 0.85);
  assert.equal(math.ownScale({ ...extent, width: 500 }, phone), 1);
  // A tile's window is drawn up to `most`, any other's no larger than its own size.
  const canvas = { offsetWidth: 100, offsetHeight: 50 };
  assert.equal(math.windowScale({ scale: 'window', tile: true }, extent, canvas), math.most);
  assert.equal(math.windowScale({ scale: 'content', tile: false }, extent, canvas), 1);
});

test('boxes join into the least box around them, and cover one another to a couple of px', () => {
  assert.equal(math.join(null, null), null);
  assert.deepEqual(math.union([box(0, 5, 10, 20), box(-4, 8, 6, 30)]), box(-4, 5, 10, 30));
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

test('a point of the canvas is in its stage by the view and the scale it is drawn at', () => {
  // A stage 200 px long, the view at 50, drawn at twice its size: the point at 10 is 70 in.
  assert.equal(math.stagePoint(10, 50, 200, 2), 70);
  assert.equal(math.stagePoint(0, 0, 200, 1), 100);
});

test("a still is framed on its pointer's course, as many of its points as fit together", () => {
  const frame = (parts, toX = 0, toY = 0, scale = 1) =>
    math.frameOnCourse(parts, 200, 100, toX, toY, scale);
  // With nothing on its course, or nothing that shows, the view stays.
  assert.deepEqual(frame([]), { toX: 0, toY: 0 });
  assert.deepEqual(frame([null, box(10, 10, 10, 20)]), { toX: 0, toY: 0 });
  // What is in the stage moves nothing; what is past its edge brings the view just far enough,
  // and a margin, to keep it in.
  assert.deepEqual(frame([box(-20, -10, 20, 10)]), { toX: 0, toY: 0 });
  assert.deepEqual(frame([box(150, -10, 180, 10)]), { toX: 90, toY: 0 });
  // A point that doesn't fit the stage with the ones before it is left out.
  assert.deepEqual(frame([box(150, -10, 180, 10), box(-300, -10, -280, 10)]), {
    toX: 90,
    toY: 0,
  });
  // The first, larger than the stage, shows from its start, a margin from the stage's edge.
  assert.deepEqual(frame([box(0, -10, 500, 10)]), { toX: 90, toY: 0 });
  // Drawn smaller, it fits again.
  assert.deepEqual(frame([box(0, -10, 500, 10)], 0, 0, 0.25), { toX: 35, toY: 0 });
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
  const room = { stage: 150, top: 0, pointerFoot: null, cursor: 20 };
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
  const room = { stage: 200, top: 0, pointerFoot: null, cursor: 20 };
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
    sizes: [200, 150, 300, 200],
    whole,
    view,
    boxes: [
      { box: box(0, 0, 100, 40), popup: null },
      { box: box(popupLeft, 40, popupLeft + 100, 140), popup: {} },
    ],
    popups: 1,
  });
  let follow = { count: 0, following: false };
  const holds = (was, now) => {
    const decided = held.holdsFrame(was, now, follow);
    follow = decided.follow;
    return decided.holds;
  };
  // Nothing moved: held, and framed anew on a popup placed elsewhere.
  assert.ok(holds(shape([0, 0]), shape([0, 0])));
  assert.ok(!holds(shape([0, 0]), shape([0, 0], 3)));
  // A change outside the popups, or of the stage, frames it anew.
  assert.ok(!holds(shape([0, 0]), { ...shape([0, 0]), sizes: [210, 150, 300, 200] }));
  // Scrolled to the window's edge, it holds.
  assert.ok(holds(shape([0, 0]), shape([0, 0], 30, false)));
  // The view moved: a popup placed a few px away holds; further, it is followed, so often, each
  // time counted anew rather than in what it was given.
  assert.ok(holds(shape([0, 0]), shape([5, 0], 3)));
  const before = follow;
  for (let count = 0; count < 30; count++) assert.ok(!holds(shape([0, 0]), shape([5, 0], 10)));
  assert.deepEqual(before, { count: 0, following: false });
  assert.deepEqual(follow, { count: 30, following: true });
  assert.ok(holds(shape([0, 0]), shape([5, 0], 10)));
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

test("a modal's screen is drawn at the overlays' scale, or as small as it needs, and kept as it plays", () => {
  const room = { across: 300, down: 200 };
  const scales = { overlay: 0.75, phone: false, steps: [1], popupLeast: 0.6 };
  const atRest = { played: null, rest: 1 };
  const dialog = screen.decideScreenScale(
    room,
    { scales, own: 1 },
    { needHeight: 300, needWidth: 0, surfaceHeight: 150 },
    atRest,
  );
  // Its surface fits the stage a margin from its edges at the overlays' scale; the screen is as tall
  // as the stage shows at it, or the modal needs.
  assert.deepEqual(dialog, {
    scale: 0.75,
    tall: 300,
    plays: false,
    surfaceHeight: 150,
    centred: true,
  });
  // A taller surface is drawn as much smaller as it needs, down to the popups' least.
  const tall = { needHeight: 500, needWidth: 0, surfaceHeight: 400 };
  assert.equal(screen.decideScreenScale(room, { scales, own: 1 }, tall, atRest).scale, 0.6);
  // As it plays, it keeps the scale it rested at and the screen it has.
  assert.deepEqual(
    screen.decideScreenScale(room, { scales, own: 1 }, tall, { played: 420, rest: 0.7 }),
    { scale: 0.7, tall: 420, plays: true, surfaceHeight: 400, centred: true },
  );
  // Any other modal on a phone, such as a sheet wider than the screen, takes one of its steps.
  const phone = { overlay: 0, phone: true, steps: [1, 0.85, 0.7], popupLeast: 0.7 };
  const wide = { needHeight: 0, needWidth: 400, surfaceHeight: 0 };
  assert.equal(screen.decideScreenScale(room, { scales: phone, own: 1 }, wide, atRest).scale, 0.7);
});

test('a playing tile is cut off where its view shows, and where its still was until it moves', () => {
  const room = { across: 300, down: 200 };
  const boxes = [{ box: box(-100, -50, 100, 50) }];
  const view = { toX: 0, toY: 0, toScale: 1, zoomed: false };
  const run = {
    rested: new Map(),
    scale: 1,
    pending: null,
    at: { x: 0, y: 0, scale: 1 },
    cut: ['bottom'],
    moved: false,
  };
  // Where it rested, it keeps the side its still was cut off at, though it shows whole.
  assert.deepEqual(playing.decidePlayCut(room, boxes, run, view, false), { cut: 'bottom', run });
  // Moved, it is cut off only where it reaches past the stage, and stays marked as moved.
  const moved = playing.decidePlayCut(room, boxes, run, { ...view, toX: 80 }, false);
  assert.equal(moved.cut, 'start');
  assert.equal(moved.run.moved, true);
  assert.equal(run.moved, false);
  // A held view is cut off where its still was, wherever it shows.
  assert.equal(playing.decidePlayCut(room, boxes, run, { ...view, toX: 80 }, true).cut, 'bottom');
});

test("a popup's whole scale is decided once for its stage's size, and kept while it stays", () => {
  const measured = {
    extent: { ...box(0, 0, 100, 100), width: 268, height: 168 },
    painted: [
      { box: box(0, 0, 100, 20), popup: false },
      { box: box(0, 24, 100, 100), popup: true },
    ],
    popup: true,
    dialog: false,
    scales: { phone: false, popupLeast: 0.8 },
  };
  const kind = { scale: 'own', tile: true };
  const script = { holdsView: false, narrow: false };
  const room = { across: 300, down: 200 };
  const kept = { stage: '300 200', narrower: 0.7, whole: 0.7 };
  const shown = popups.decidePopups(room, kind, measured, script, { shown: true, wholeFor: kept });
  assert.equal(shown.wholeFor, kept);
  // A component's popup keeps its room from the stage's edges, what opens it the inset.
  assert.deepEqual(
    shown.anchored.map(({ pad }) => pad),
    [16, 5],
  );
  // Another stage's size, or before it shows, decides it again.
  const other = { across: 320, down: 200 };
  assert.deepEqual(
    popups.decidePopups(other, kind, measured, script, { shown: true, wholeFor: kept }).wholeFor,
    { stage: '320 200', narrower: null, whole: 0 },
  );
  assert.notEqual(
    popups.decidePopups(room, kind, measured, script, { shown: false, wholeFor: kept }).wholeFor,
    kept,
  );
  // What shows whole at a scale is drawn at it; else at the popups' least.
  assert.equal(shown.scale(1), 1);
  const large = {
    ...measured,
    extent: { ...box(0, 0, 400, 300), width: 268, height: 168 },
    painted: [
      { box: box(0, 0, 400, 20), popup: false },
      { box: box(0, 24, 400, 300), popup: true },
    ],
  };
  const drawn = popups.decidePopups(room, kind, large, script, { shown: false, wholeFor: null });
  assert.equal(drawn.scale(1), 0.8);
});

test('a resting component keeps the scale it rested at, and a held subject is drawn smaller to show', () => {
  const scales = {
    phone: false,
    steps: [1],
    popupLeast: 0.8,
    overlay: 0,
    overlayScale: 0.75,
    least: 0,
    leastBlock: 0,
    floor: 0,
  };
  const measured = {
    extent: { ...box(0, 0, 300, 100), width: 168, height: 118 },
    popup: false,
    scales,
    window: 1,
    own: 0.85,
  };
  const kind = { scale: 'own', tile: true };
  const popupsAt = { anchored: null, narrower: null, whole: 0, scale: (atMost) => atMost };
  const held = { rows: null, lowest: null, ways: [], heights: {} };
  const room = { across: 200, down: 150 };
  const decide = (script, at) =>
    popups.decideRestingScale(room, kind, measured, popupsAt, held, script, {
      playing: false,
      rest: 1,
      laidOut: false,
      ...at,
    });
  const plain = { holdsView: false, anywhere: [] };
  assert.equal(decide(plain).scale, 0.85);
  // Measured again a hair off, it is the scale it rested at.
  assert.equal(decide(plain, { rest: 0.8502 }).scale, 0.8502);
  // A held view that names what it shows is drawn as much smaller as shows it whole, a margin
  // from the stage's edges.
  const subject = decide({ holdsView: true, anywhere: ['.env-panel'] });
  assert.equal(subject.scale, 0.626);
  assert.equal(subject.heldSmaller, true);
  // On a phone, a popup laid out in its window lays out at the scale it is drawn at, at rest.
  const phone = { ...measured, scales: { ...scales, phone: true, steps: [1, 0.85] } };
  const smaller = { ...popupsAt, scale: (atMost) => Math.min(atMost, 0.85) };
  const phoneScale = (at) =>
    popups.decideRestingScale(room, kind, { ...phone, popup: true }, smaller, held, plain, {
      playing: false,
      rest: 1,
      laidOut: true,
      ...at,
    }).layoutScale;
  assert.equal(phoneScale(), '0.85');
  assert.equal(phoneScale({ playing: true }), null);
});

test('a device is drawn to fit its stage, no smaller than its least scale, and cut where not', () => {
  const read = { fade: 0, smallText: 0, pad: { start: 0, end: 0 }, most: Infinity };
  const scaleOf = (at) => device.deviceScale({ ...read, ...at });
  assert.equal(scaleOf({ kind: 'phone', width: 0, height: 600, room: 400 }), null);
  // It fits whole, never drawn larger than it is.
  const whole = scaleOf({ kind: 'window', width: 600, height: 400, room: 800 });
  assert.equal(whole.scale, 1);
  assert.deepEqual(whole.shown, { width: 600, height: 400 });
  assert.equal(whole.across, false);
  // Small text set at 12 px may be drawn no smaller than 10 px, more than the phone's least, 0.8;
  // the phone is then cut across, over the example's padding.
  const phone = scaleOf({
    kind: 'phone',
    width: 400,
    height: 800,
    room: 300,
    smallText: 12,
    pad: { start: 16, end: 16 },
  });
  assert.equal(phone.scale, 10 / 12);
  assert.equal(phone.across, true);
  assert.equal(phone.shown.width, 332);
  // Its height fits `most`, down to the window's least scale, 0.75, and is cut below that.
  const tall = scaleOf({ kind: 'window', width: 400, height: 1000, room: 800, most: 500 });
  assert.equal(tall.scale, 0.75);
  assert.deepEqual(tall.shown, { width: 300, height: 500 });
});

test('a device figure needs its course and named elements in view, the span down only growing', () => {
  const held = { size: '' };
  const point = box(10, 100, 50, 140);
  const named = box(20, 300, 80, 320);
  const needs = device.deviceNeeds(held, [point, undefined], [named], undefined);
  assert.deepEqual(needs.boxes, [point, named]);
  // The screen's state: which points show, and how many named elements.
  assert.equal(needs.state, '10/1');
  assert.deepEqual(held.y, [100, 320]);
  // As the figure plays, what it needs higher up adds to the span; it never shrinks.
  device.deviceNeeds(held, [box(10, 40, 50, 80)], [], undefined);
  assert.deepEqual(held.y, [40, 320]);
});

test("a device's view shows what its figure needs, cutting its edges between words", () => {
  const read = { fade: 0, smallText: 0, pad: { start: 0, end: 0 }, most: Infinity };
  const place = (at, { named = [], focus, words = [] } = {}, held = { size: '' }) => {
    const scaled = device.deviceScale({ ...read, ...at });
    const needs = device.deviceNeeds(held, [], named, focus);
    return device.placeDevice(at.kind, scaled, { ...needs, words }, held, { x: 0, y: 0 });
  };
  // A phone that fits shows whole, uncut.
  assert.deepEqual(place({ kind: 'phone', width: 300, height: 600, room: 400 }), {
    scale: 1,
    width: 300,
    height: 600,
    x: 0,
    y: 0,
    cut: '',
    outset: { start: 0, end: 0 },
  });
  // A phone too tall for `most` shows down to its heading, cut above and below.
  const tall = place(
    { kind: 'phone', width: 300, height: 1000, room: 400, most: 500 },
    { focus: box(100, 800, 140, 840) },
  );
  assert.deepEqual([tall.scale, tall.height, tall.y, tall.cut], [0.8, 500, 215, 'top bottom']);
  // A window whose page shows little is cut off below it, at least two fifths as tall as wide.
  const little = place(
    { kind: 'window', width: 800, height: 1000, room: 800 },
    { words: [box(10, 10, 100, 30)] },
  );
  assert.deepEqual([little.height, little.cut], [320, 'bottom']);
  // A window too wide for its stage shows what it names at its end, the cut edge clear of a word,
  // and extends over the example's padding on its cut side only.
  const held = { size: '' };
  const wide = { kind: 'window', width: 1000, height: 400, room: 600, pad: { start: 20, end: 20 } };
  const needs = { named: [box(900, 10, 960, 30)], words: [box(100, 0, 130, 20)] };
  const across = place(wide, needs, held);
  assert.deepEqual(
    [across.width, across.cut, across.outset],
    [620, 'start', { start: 20, end: 0 }],
  );
  assert.ok(Math.abs(across.x - (1000 - 620 / 0.75)) < 1e-9);
  // While the screen's state lasts, its view across holds.
  assert.equal(place(wide, needs, held).x, across.x);
});

test('a device fit is the same within the pixel tolerance, and differs by its cut', () => {
  const fit = {
    scale: 1,
    width: 300,
    height: 600,
    x: 0,
    y: 0,
    cut: '',
    outset: { start: 0, end: 0 },
  };
  assert.ok(device.sameFit(fit, { ...fit, width: 300.2, y: 0.3 }));
  assert.ok(!device.sameFit(fit, { ...fit, cut: 'end' }));
  assert.ok(!device.sameFit(fit, { ...fit, x: 1 }));
});

test("a crop's bottom hides a row whole that would show only a sliver in its fade", () => {
  const trim = (fadeFrom = null, edge = false, played = false) =>
    draw.cropTrim(200, 32, fadeFrom, edge, played, 16);
  const { length, hides } = trim();
  assert.equal(length, 32);
  assert.equal(hides(150, 180), false);
  // Past the bottom with its top in the fade's faint half, it is hidden; higher, it fades out.
  assert.equal(hides(190, 210), true);
  assert.equal(hides(170, 210), false);
  // While the tile plays, such a row keeps its state as the view moves.
  assert.equal(trim(null, false, true).hides(190, 210), undefined);
  // At a modal screen's edge there is no fade, and every row past it is hidden.
  const edge = trim(null, true, true);
  assert.equal(edge.length, 0);
  assert.equal(edge.hides(170, 210), true);
  // A fade shortened to start below a held view's chosen row hides the rows below it, also while
  // the tile plays, and leaves the rows above it whole.
  const held = trim(190, false, true);
  assert.equal(held.length, 10);
  assert.equal(held.hides(189, 210), true);
  assert.equal(held.hides(100, 210), false);
});

test("an open example's room is padded so its popup centres with what opens it", () => {
  const none = { top: 0, right: 0, bottom: 0, left: 0 };
  const trigger = box(100, 100, 200, 130);
  const popup = box(100, 130, 300, 250);
  // As far as the popup reaches past the trigger, in the room's own px.
  assert.deepEqual(room.popupPadding(trigger, [popup], 1, 600, none), {
    top: 0,
    right: 100,
    bottom: 120,
    left: 0,
  });
  assert.deepEqual(room.popupPadding(trigger, [popup], 2, 600, none).bottom, 60);
  // On a narrow stage, the trigger keeps its width and 2 px, and the side padding fits the rest.
  assert.equal(room.popupPadding(trigger, [popup], 1, 150, none).right, 48);
});

test('a stage grows for an overlay placed on it by its full height and the space around it', () => {
  const overlay = { above: 0, below: 0, area: 400, space: 16, gaps: { top: 0, bottom: 0 } };
  const short = (at) => room.stageShortfall({ ...overlay, content: 0, ...at });
  // A centred dialog takes the space on both sides; the stage has room to spare.
  assert.equal(short({ side: 'center', height: 300 }), -68);
  assert.equal(short({ side: 'center', height: 400 }), 32);
  // One placed at an edge keeps its own gap there, and the space on its far side, or its
  // positioner's gap there where that is larger, such as above a bottom sheet.
  assert.equal(short({ side: 'start', height: 200, above: 40 }), -144);
  assert.equal(short({ side: 'end', height: 300, gaps: { top: 48, bottom: 0 } }), -52);
  assert.equal(short({ side: 'stretch', height: 400 }), 0);
  // A toast also leaves the room's content clear of it, centred.
  assert.equal(short({ side: 'end', height: 60, above: 300, below: 20, content: 100 }), -108);
});
