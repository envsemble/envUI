/*
 * Fits a device figure (a phone or a window around an example) in its stage (useDeviceFit.ts,
 * DeviceFrame.tsx). It decides the scale the device is drawn at, and which part of the device the
 * stage shows (the view), down and across the screen, so that what the figure needs shows whole
 * and the cut edges fall between words. Boxes are in the device's own px, from its top left
 * corner.
 */
import type { DeviceKind } from '@docs-model/DocumentationTypes';
import { remPixels } from '@envui-internal/internal/lengths';
import type { Box } from '../FitGeometry';
import type { Aim, ScriptReader } from '../FitKind';
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
const pointRoom = 40;

/**
 * Space kept, in the device's px, past the fade of a cut bottom edge: below a window's lowest
 * words (`words`) when the window is cut off below them, and below the lowest point the pointer
 * heads to (`point`), whose box already includes space for the cursor.
 */
const footRoom = { words: 96, point: 16 };

/**
 * The box, in the device's own px, around a point the pointer heads to, with pointRoom around it;
 * undefined when no matching element is visible.
 */
function pointBox(row: Element, scale: number, { selector, x, y }: Aim): Box | undefined {
  // The first visible match: a closed pane may keep its parts in the page, hidden.
  const element = [...row.querySelectorAll(selector)].find(
    (candidate) =>
      candidate.getClientRects().length > 0 &&
      candidate.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
  );
  if (!element) return undefined;
  const own = row.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  const left = (box.left - own.left + x * box.width) / scale;
  const top = (box.top - own.top + y * box.height) / scale;
  return {
    left: left - pointRoom / 2,
    top: top - pointRoom / 2,
    right: left + pointRoom,
    bottom: top + pointRoom,
  };
}

/**
 * The boxes, in the device's own px, of the elements a figure names to keep in view (useMustShow).
 * Each box is around the element's content, such as a value's text rather than its whole row,
 * grown by pointRoom so it clears the fade of a cut edge.
 */
function namedBoxes(row: Element, scale: number, selectors: readonly string[]): Box[] {
  const own = row.getBoundingClientRect();
  const range = document.createRange();
  return selectors.flatMap((selector) =>
    [...row.querySelectorAll(selector)]
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => {
        range.selectNodeContents(element);
        const box = range.getBoundingClientRect();
        return {
          left: (box.left - own.left) / scale - pointRoom,
          top: (box.top - own.top) / scale - pointRoom,
          right: (box.right - own.left) / scale + pointRoom,
          bottom: (box.bottom - own.top) / scale + pointRoom,
        };
      }),
  );
}

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
 * The box of each visible word on the screen, in the device's own px, from its top left corner.
 * Stops after 800 words.
 */
function wordBoxes(row: Element, scale: number): Box[] {
  const own = row.getBoundingClientRect();
  const range = document.createRange();
  const words: Box[] = [];
  const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node && words.length < 800; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent?.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    for (const word of (node.textContent ?? '').matchAll(/\S+/g)) {
      range.setStart(node, word.index);
      range.setEnd(node, word.index + word[0].length);
      for (const box of range.getClientRects())
        if (box.width >= 1 && box.height >= 1)
          words.push({
            left: (box.left - own.left) / scale,
            top: (box.top - own.top) / scale,
            right: (box.right - own.left) / scale,
            bottom: (box.bottom - own.top) / scale,
          });
    }
  }
  return words;
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
const grown = (a: [number, number] | undefined, b: [number, number] | undefined) =>
  a && b ? ([Math.min(a[0], b[0]), Math.max(a[1], b[1])] as [number, number]) : (a ?? b);

/**
 * What the device fit keeps between runs, reset when the drawn size (`size`) changes:
 * - `y`: the vertical span the view has needed so far, so the view holds while the figure plays;
 * - `words`: the screen's word boxes (wordBoxes), measured again only when needed;
 * - `state` and `across`: the screen's current state (which points show, how many named
 *   elements), and the view across it held for that state.
 */
interface Held {
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

/** A device stage's elements, read by its fit, and what the fit keeps between runs. */
export interface DeviceFitting {
  kind: DeviceKind;
  stage: HTMLElement;
  /** The box the view is drawn in, and the row inside it that holds the device at its own size. */
  box: HTMLElement;
  row: HTMLElement;
  /** The animated figure's root, whose pointer's points the view keeps in view; null if none. */
  root: Element | null;
  /** Reads the script of the figure's picture (StageScript). */
  readScript: ScriptReader['read'];
  /** Where the view starts, in the device's own px. */
  view: { x: number; y: number };
  /** What the fit keeps between runs (Held). */
  held: Held;
}

/**
 * The scale a device is drawn at (DeviceStage), and how much of it shows before the view is
 * decided. Null before the row and the stage have a size.
 *
 * The scale fits the device to the stage's width and to `--site-device-most` in height, capped at
 * 1 and no smaller than the least scale (leastScale, leastText).
 */
function deviceScale({ kind, stage, box, row }: DeviceFitting) {
  const rem = remPixels();
  const most =
    parseFloat(getComputedStyle(stage).getPropertyValue('--site-device-most')) * rem || Infinity;
  // The length of a cut edge's fade, in the stage's px (DeviceFrame.css).
  const fade =
    (parseFloat(getComputedStyle(box).getPropertyValue('--site-device-fade')) || 0) * rem;
  // offsetWidth and offsetHeight are the row's own size, before its scale transform.
  const width = row.offsetWidth;
  const height = row.offsetHeight;
  const room = stage.clientWidth;
  if (!width || !height || !room) return null;
  const fits = Math.min(1, room / width, most / height);
  const small = parseFloat(getComputedStyle(row).getPropertyValue('--env-font-size-body-sm'));
  const least = Math.max(leastScale[kind], small ? leastText / (small * rem) : 0);
  const scale = Math.min(1, Math.max(fits, least));
  // A device cut off at its start or end extends over the stage's padding to the stage's edge,
  // so it fades out at that edge rather than in a strip inside the stage.
  const host = stage.closest('.site-live-example');
  const hostStyle = host && getComputedStyle(host);
  const pad = {
    start: hostStyle ? parseFloat(hostStyle.paddingLeft) || 0 : 0,
    end: hostStyle ? parseFloat(hostStyle.paddingRight) || 0 : 0,
  };
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
 * What the figure needs in view: the boxes of the pointer's course points that are visible now,
 * and of the elements it names (useMustShow), plus a box around the current heading (`focus`).
 *
 * Down the screen, the needed span only grows at one drawn size (`held.y`), so the view holds
 * while the figure plays. Across, each state of the screen (which points show and how many named
 * elements) gets one view (viewAcross). Words are measured again on a resize, or when a mutation
 * changes the state, not on every mutation the figure's play causes (`fromMutation`).
 */
function deviceNeeds(
  f: DeviceFitting,
  { width, height, scale, room }: DeviceScale,
  fromMutation: boolean,
) {
  const { row, root } = f;
  // The scale the row is drawn at now; its points are measured at this scale.
  const drawn = row.getBoundingClientRect().width / width || scale;
  const size = `${width}x${height}@${scale}@${room}`;
  if (f.held.size !== size) f.held = { size };
  const { held } = f;
  const script = root && f.readScript(root);
  const points = script ? script.course.map((point) => pointBox(row, drawn, point)) : [];
  const named = script ? namedBoxes(row, drawn, script.anywhere) : [];
  const course = points.filter((box): box is Box => box !== undefined);
  const boxes = [...course, ...named];
  held.y = grown(
    held.y,
    spanOf(boxes, (box) => [box.top, box.bottom]),
  );
  const heading = script?.heading;
  const focus = heading ? pointBox(row, drawn, heading) : undefined;
  const state = `${points.map((box) => (box ? 1 : 0)).join('')}/${named.length}`;
  if (!held.words || !fromMutation || held.state !== state) held.words = wordBoxes(row, drawn);
  return { boxes, named, focus, state, words: held.words };
}

type DeviceNeeds = ReturnType<typeof deviceNeeds>;

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
  { held }: DeviceFitting,
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
 * Decides a device's fit in its stage (DeviceFit), or null before it has a size. `fromMutation`
 * is true when only mutations or events (not a resize) caused this run.
 */
export function deviceFit(f: DeviceFitting, fromMutation: boolean): DeviceFit | null {
  const scaled = deviceScale(f);
  if (!scaled) return null;
  const { width, height, scale, fade } = scaled;
  const shown = { ...scaled.shown };
  const needs = deviceNeeds(f, scaled, fromMutation);
  const { held, view } = f;
  // A window whose page shows little, such as a heading and a line, is cut off below its content
  // (with footRoom under it) rather than shown mostly empty. It stays at least two fifths as tall
  // as it is wide, and is cut only when that saves more than 15% of its height.
  if (f.kind === 'window') {
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
  const placed = viewAcross(f, scaled, needs, shown.width, rows);
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
