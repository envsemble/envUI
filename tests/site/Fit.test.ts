// The fit's decisions that keep a picture steady as it is measured again (apps/site/src/fit/):
// which decider places a picture, whether a resting picture holds its frame, the scales a popup, a
// resting picture and a modal's screen keep, a device figure's scale and view and when its fit is
// the same, and an open example's room for its overlays. The visual baseline shows where a still
// lands; these keep it there from one measure to the next.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from '../support/ImportSource.ts';

const kinds = await importSource('FitKind', 'apps/site/src/fit/FitKind.ts');
const held = await importSource('HeldView', 'apps/site/src/fit/HeldView.ts');
const popups = await importSource('FitResting', 'apps/site/src/fit/FitResting.ts');
const screen = await importSource('FitScreen', 'apps/site/src/fit/FitScreen.ts');
const device = await importSource('DeviceFit', 'apps/site/src/fit/standalone/DeviceFit.ts');
const room = await importSource('OverlayRoom', 'apps/site/src/fit/standalone/OverlayRoom.ts');

const box = (left, top, right, bottom) => ({ left, top, right, bottom });

test('a picture is fitted by its kind, and only a cropped tile that has shown plays drawn out', () => {
  // A component at its own size, except a drawing, written for a window narrower than the tiles'.
  assert.deepEqual(kinds.fitKindOf({ tile: true }, 'own'), { scale: 'own', tile: true });
  const drawing = kinds.fitKindOf({ tile: true, window: { width: 8 } }, 'own');
  assert.deepEqual(drawing, { scale: 'window', tile: true });
  assert.deepEqual(kinds.fitKindOf(undefined, undefined), { scale: 'content', tile: false });
  // The same kind is the same object, so the fit restarts only when the kind changes.
  assert.equal(
    kinds.fitKindOf({ tile: true }, 'legible'),
    kinds.fitKindOf({ tile: true }, 'legible'),
  );
  const tile = kinds.fitKindOf({ tile: true }, 'own');
  const playing = { playing: true, shown: true };
  assert.equal(kinds.fitModeOf(tile, false, playing), 'playing');
  assert.equal(kinds.fitModeOf(tile, false, { playing: true, shown: false }), 'resting');
  assert.equal(kinds.fitModeOf(drawing, false, playing), 'resting');
  assert.equal(kinds.fitModeOf(tile, true, playing), 'screen');
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
  // At full size it takes even whole pixels, so what it centres moves by whole pixels; scaled, it
  // keeps the measure.
  const measured = { top: 0, right: 99.6, bottom: 120.3, left: 1.4 };
  assert.deepEqual(room.steadyPadding(measured, 1), { top: 0, right: 98, bottom: 120, left: 0 });
  assert.deepEqual(room.steadyPadding(measured, 0.9997), room.steadyPadding(measured, 1));
  assert.deepEqual(room.steadyPadding(measured, 2), measured);
});

test("a modal's screen fits what it needs, no smaller than the popups' least, and keeps it playing", () => {
  const stage = { across: 300, down: 200 };
  const scales = { overlay: 0.8, phone: false, steps: [], popupLeast: 0.55 };
  const resting = { played: null, rest: 0 };
  const scaleOf = (needs, measured = { scales, own: 1 }) =>
    screen.decideScreenScale(stage, measured, needs, resting).scale;
  // A dialog is drawn smaller than the overlays' scale so its surface fits, less a margin above and
  // below, and its screen is as tall as it needs.
  const dialog = { needHeight: 300, needWidth: 0, surfaceHeight: 250 };
  const fitted = screen.decideScreenScale(stage, { scales, own: 1 }, dialog, resting);
  assert.equal(fitted.scale, (200 - 2 * 6) / 250);
  assert.equal(fitted.tall, 300);
  assert.ok(fitted.centred && !fitted.plays);
  // A taller one stops at the popups' least scale, and shows from its top.
  assert.equal(scaleOf({ needHeight: 1100, needWidth: 0, surfaceHeight: 1000 }), 0.55);
  // Any other modal is drawn at its own scale, or smaller to fit its width.
  const own = { scales: { ...scales, overlay: 0 }, own: 0.9 };
  const sheet = { needHeight: 150, needWidth: 0, surfaceHeight: 150 };
  assert.equal(scaleOf(sheet, own), 0.9);
  assert.equal(scaleOf({ ...sheet, needWidth: 400 }, own), 0.75);
  // While the tile plays, the screen keeps its resting scale and height as the modal closes.
  const kept = { played: 320, rest: 0.7 };
  const played = screen.decideScreenScale(stage, { scales, own: 1 }, dialog, kept);
  assert.deepEqual([played.scale, played.tall, played.plays], [0.7, 320, true]);
});
