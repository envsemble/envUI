/*
 * The decisions of a device figure's fit (a phone or a window around an example; useDeviceFit.ts,
 * DeviceFrame.tsx): the scale the device is drawn at, and which part of the device the stage
 * shows (the view), down and across the screen, so that what the figure needs shows whole and the
 * cut edges fall between words. Boxes are in the device's own px, from its top left corner.
 * DeviceMeasure.ts reads what they are decided from; nothing here reads the page, so
 * tests/site/Fit.test.mjs tests it directly.
 */
import type { DeviceKind } from '../../documentation/DocumentationTypes';
import type { Box } from '../FitGeometry';
import { pixelTolerance } from '../../shared/Remeasure';

/**
 * The least scale for each kind of device, and the least size, in px, small text (body-sm) may be
 * drawn at. The device's least scale is the larger of the two limits. A device that would need a
 * smaller scale to fit is drawn at the least scale and cut off at the stage's edges. At the compact
 * scale, small text needs a scale of 0.84; at the comfortable scale (a touch screen), the kind's
 * least is the larger limit.
 */
const leastScale: Record<DeviceKind, number> = { phone: 0.8, window: 0.75 };
const leastText = 10;

/** Space kept around a point the pointer heads to, in the device's px: the cursor and a margin. */
export const pointRoom = 40;

/**
 * Space kept, in the device's px, past the fade of a cut bottom edge: below a window's lowest
 * words (`words`) when the window is cut off below them, and below the lowest point the pointer
 * heads to (`point`), whose box already includes space for the cursor.
 */
const footRoom = { words: 96, point: 16 };

/**
 * Where a view of length `size` starts along one axis of a device of length `whole`:
 * - when `span` fits, as near the start as still shows it;
 * - else, when there is a `focus`, it shows the focus, moving as little as it can from `from`;
 * - else at the span's start, or at 0.
 * A start within `snap` of either end moves to that end if what it shows still fits, so no sliver
 * of the device is left in the fade of a cut edge.
 */
function viewStart(
  whole: number,
  size: number,
  span: [number, number] | undefined,
  focus: [number, number] | undefined,
  from: number,
  snap: number,
) {
  const most = Math.max(0, whole - size);
  const clamp = (value: number) => Math.min(most, Math.max(0, value));
  const fits = span && span[1] - span[0] <= size;
  const start = fits
    ? clamp(Math.min(span[0], span[1] - size))
    : focus
      ? clamp(Math.min(Math.max(from, focus[1] - size), focus[0]))
      : clamp(span ? span[0] : 0);
  const shows = fits ? span : focus;
  if (start < snap && (!shows || shows[1] <= size)) return 0;
  if (start > most - snap && (!shows || shows[0] >= most)) return most;
  return start;
}

/** The extent of boxes along one axis, using `pick` to read each box; undefined for no boxes. */
function spanOf(boxes: Box[], pick: (box: Box) => [number, number]) {
  return boxes.length
    ? boxes
        .map(pick)
        .reduce<[number, number]>(
          (a, b) => [Math.min(a[0], b[0]), Math.max(a[1], b[1])],
          [Infinity, -Infinity],
        )
    : undefined;
}

/**
 * A cost for how badly a view across from `start` to `end` cuts the screen's words. Only words in
 * the rows the view shows, from `top` to `bottom`, count. For each cut edge: 3 for cutting the
 * device at all (it reads less like a window than one showing its frame), plus 10 for each word
 * cut through (it reads as broken) and 2 for each word inside the edge's fade (it fades out).
 */
function cutCost(
  words: Box[],
  start: number,
  end: number,
  whole: number,
  fade: number,
  [top, bottom]: [number, number],
) {
  let cost = 0;
  const edge = (at: number, inward: number) => {
    cost += 3;
    const band = inward > 0 ? [at, at + fade] : [at - fade, at];
    for (const word of words) {
      if (word.bottom <= top || word.top >= bottom) continue;
      if (word.left < at - 1 && word.right > at + 1) cost += 10;
      else if (word.right > band[0] && word.left < band[1]) cost += 2;
    }
  };
  if (start > pixelTolerance) edge(start, 1);
  if (end < whole - pixelTolerance) edge(end, -1);
  return cost;
}

/**
 * The start, from `least` to `most`, of a view of length `size` across a device of length `whole`
 * whose cut edges fall in gaps between words, such as between the navigation and the page. It
 * tries every 2 px and picks the lowest cutCost; distance from `near` breaks ties.
 */
function gapStart(
  words: Box[],
  whole: number,
  size: number,
  least: number,
  most: number,
  near: number,
  fade: number,
  rows: [number, number],
) {
  if (most - least < 1) return least;
  const candidates = [least, most, Math.min(most, Math.max(least, near))];
  for (let at = least; at < most; at += 2) candidates.push(at);
  let best = least;
  let lowest = Infinity;
  for (const at of candidates) {
    const cost = cutCost(words, at, at + size, whole, fade, rows) + Math.abs(at - near) * 0.02;
    if (cost < lowest - 1e-6) {
      lowest = cost;
      best = at;
    }
  }
  return best;
}

/** The smallest span that contains both spans, or whichever one is defined. */
const grown = (
  a: [number, number] | undefined,
  b: [number, number] | undefined,
): [number, number] | undefined =>
  a && b ? [Math.min(a[0], b[0]), Math.max(a[1], b[1])] : (a ?? b);

/**
 * What the device fit keeps between runs, reset when the drawn size (`size`) changes:
 * - `y`: the vertical span the view has needed so far, so the view holds while the figure plays;
 * - `words`: the screen's word boxes (wordBoxes), measured again only when needed;
 * - `state` and `across`: the screen's current state (which points show, how many named
 *   elements), and the view across it held for that state.
 */
export interface Held {
  size: string;
  y?: [number, number];
  words?: Box[];
  state?: string;
  across?: { x: number; width: number; outset: { start: number; end: number } };
}

/**
 * A device's fit: the scale it is drawn at; the view's size (`width`, `height`, in stage px) and
 * start (`x`, `y`, in the device's px); the sides it is cut off at (`data-cut`); and its outset.
 */
export interface DeviceFit {
  scale: number;
  width: number;
  height: number;
  x: number;
  y: number;
  cut: string;
  /** How far the view extends over the stage's padding at its start and its end, in px. */
  outset: { start: number; end: number };
}

export const sameFit = (a: DeviceFit, b: DeviceFit) =>
  a.scale === b.scale &&
  a.cut === b.cut &&
  Math.abs(a.outset.start - b.outset.start) < pixelTolerance &&
  Math.abs(a.outset.end - b.outset.end) < pixelTolerance &&
  Math.abs(a.width - b.width) < pixelTolerance &&
  Math.abs(a.height - b.height) < pixelTolerance &&
  Math.abs(a.x - b.x) < pixelTolerance &&
  Math.abs(a.y - b.y) < pixelTolerance;

/**
 * What the device fit reads of its stage and its device, in px: the row's own size, before its
 * scale transform (`width`, `height`); the stage's width inside its borders (`room`); the most
 * height the device is drawn at (`most`, `--site-device-most`, Infinity where unset); the length
 * of a cut edge's fade (`fade`, DeviceFrame.css); the size small text (body-sm) is set at
 * (`smallText`, 0 where unset); and the example's padding at the stage's start and end (`pad`).
 */
export interface DeviceRead {
  kind: DeviceKind;
  width: number;
  height: number;
  room: number;
  most: number;
  fade: number;
  smallText: number;
  pad: { start: number; end: number };
}

/**
 * The scale a device is drawn at (DeviceStage), and how much of it shows before the view is
 * decided. Null before the row and the stage have a size.
 *
 * The scale fits the device to the stage's width and to `most` in height, capped at 1 and no
 * smaller than the least scale (leastScale, leastText).
 */
export function deviceScale({ kind, width, height, room, most, fade, smallText, pad }: DeviceRead) {
  if (!width || !height || !room) return null;
  const fits = Math.min(1, room / width, most / height);
  const least = Math.max(leastScale[kind], smallText ? leastText / smallText : 0);
  const scale = Math.min(1, Math.max(fits, least));
  // A device cut off at its start or end extends over the stage's padding to the stage's edge,
  // so it fades out at that edge rather than in a strip inside the stage.
  const across = width * scale > room + pixelTolerance;
  return {
    fade,
    width,
    height,
    room,
    scale,
    pad,
    across,
    shown: {
      width: across ? Math.min(width * scale, room + pad.start + pad.end) : width * scale,
      height: Math.min(height * scale, most),
    },
  };
}

type DeviceScale = NonNullable<ReturnType<typeof deviceScale>>;

/**
 * What the figure needs in view, from the boxes of the pointer's course points (undefined where a
 * point is not visible now), of the elements it names (useMustShow) and of its current heading
 * (`focus`). The screen's state is which points show and how many named elements.
 *
 * Down the screen, the needed span only grows at one drawn size (`held.y`), so the view holds
 * while the figure plays. Across, each state of the screen gets one view (viewAcross).
 */
export function deviceNeeds(
  held: Held,
  points: readonly (Box | undefined)[],
  named: Box[],
  focus: Box | undefined,
) {
  const course = points.filter((box): box is Box => box !== undefined);
  const boxes = [...course, ...named];
  held.y = grown(
    held.y,
    spanOf(boxes, (box) => [box.top, box.bottom]),
  );
  const state = `${points.map((box) => (box ? 1 : 0)).join('')}/${named.length}`;
  return { boxes, named, focus, state };
}

/** What the figure needs in view (deviceNeeds), with the screen's word boxes (`words`). */
type DeviceNeeds = ReturnType<typeof deviceNeeds> & { words: Box[] };

/**
 * The view across a device: where it starts (`x`), how wide it is, and how far it extends over
 * the stage's padding (`outset`).
 *
 * What it keeps whole, the first of these that fits:
 * 1. everything the figure needs;
 * 2. the named elements and the heading, with the space around the named elements;
 * 3. the same without that space, such as a pane that opens beside the page that opened it;
 * 4. the heading alone, so what the pointer presses is in view;
 * 5. the named elements, with and then without their space.
 *
 * The view is held for as long as the screen's state lasts, so what moves inside it, such as a
 * dragged divider, moves in a still view. A new state whose subject lies past the view's end, such
 * as a pane opening there, gets its own view instead of one sliding after it.
 */
function viewAcross(
  held: Held,
  { width, scale, room, pad, across, fade }: DeviceScale,
  { boxes, named, focus, state, words }: DeviceNeeds,
  shownWidth: number,
  rows: [number, number],
) {
  const sideways = (box: Box): [number, number] => [box.left, box.right];
  const aim = focus && sideways(focus);
  const namedSpan = spanOf(named, sideways);
  const bareSpan = spanOf(named, (box) => [box.left + pointRoom, box.right - pointRoom]);
  const needs = [
    spanOf(boxes, sideways),
    grown(namedSpan, aim),
    grown(bareSpan, aim),
    aim,
    namedSpan,
    bareSpan,
  ];
  const needed = (size: number) =>
    needs.find((span) => span !== undefined && span[1] - span[0] <= size);
  /**
   * Where a view `viewWidth` wide starts: at the screen's start when what it needs fits there, so
   * the bar and navigation show whole; else between as near the start as keeps it whole and the
   * start of what it needs, with the cut edges in gaps between words (gapStart).
   */
  const along = (viewWidth: number) => {
    const size = viewWidth / scale;
    const last = Math.max(0, width - size);
    const clamp = (value: number) => Math.min(last, Math.max(0, value));
    const span = needed(size);
    if (!span || span[1] <= size) return 0;
    const least = clamp(span[1] - size);
    const latest = clamp(span[0]);
    return gapStart(words, width, size, least, latest, least, fade / scale, rows);
  };
  const kept = held.state === state ? held.across : undefined;
  const keeps = (place: NonNullable<Held['across']>) => {
    const span = needed(place.width / scale);
    return (
      !span ||
      (span[0] >= place.x - pixelTolerance &&
        span[1] <= place.x + place.width / scale + pixelTolerance)
    );
  };
  if (kept && keeps(kept)) return { x: kept.x, width: kept.width, outset: { ...kept.outset } };
  let x = along(shownWidth);
  let viewWidth = shownWidth;
  const outset = { start: 0, end: 0 };
  if (across && width * scale <= room + pad.start + pad.end) {
    // The device fits across when it extends over the padding: centre it in the stage.
    outset.start = outset.end = (width * scale - room) / 2;
    x = 0;
  } else if (across) {
    // Only a cut side extends over the stage's padding; an uncut side keeps it.
    const startCut = x > pixelTolerance;
    const endCut = x + viewWidth / scale < width - pixelTolerance;
    outset.start = startCut ? pad.start : 0;
    outset.end = endCut ? pad.end : 0;
    viewWidth = room + outset.start + outset.end;
    if (!startCut) x = 0;
    else if (!endCut) x = width - viewWidth / scale;
    else x = along(viewWidth);
  }
  held.state = state;
  held.across = { x, width: viewWidth, outset: { ...outset } };
  return { x, width: viewWidth, outset };
}

/**
 * Places a device in its stage (DeviceFit) from its scale and what it needs, and moves `view`,
 * where the view starts in the device's own px, there.
 */
export function placeDevice(
  kind: DeviceKind,
  scaled: DeviceScale,
  needs: DeviceNeeds,
  held: Held,
  view: { x: number; y: number },
): DeviceFit {
  const { width, height, scale, fade } = scaled;
  const shown = { ...scaled.shown };
  // A window whose page shows little, such as a heading and a line, is cut off below its content
  // (with footRoom under it) rather than shown mostly empty. It stays at least two fifths as tall
  // as it is wide, and is cut only when that saves more than 15% of its height.
  if (kind === 'window') {
    const content = Math.max(
      ...needs.words.map((word) => word.bottom + footRoom.words),
      held.y ? held.y[1] + footRoom.point : 0,
    );
    const low = Math.max(content, (0.4 * shown.width) / scale);
    if (low < 0.85 * height) shown.height = Math.min(shown.height, low * scale);
  }
  view.y = viewStart(
    height,
    shown.height / scale,
    held.y,
    needs.focus && [needs.focus.top, needs.focus.bottom],
    view.y,
    fade / scale,
  );
  const rows: [number, number] = [view.y, view.y + shown.height / scale];
  const placed = viewAcross(held, scaled, needs, shown.width, rows);
  shown.width = placed.width;
  view.x = placed.x;
  const cut = [
    view.y > pixelTolerance && 'top',
    view.y + shown.height / scale < height - pixelTolerance && 'bottom',
    view.x > pixelTolerance && 'start',
    view.x + shown.width / scale < width - pixelTolerance && 'end',
  ]
    .filter(Boolean)
    .join(' ');
  return { scale, ...shown, x: view.x, y: view.y, cut, outset: placed.outset };
}
