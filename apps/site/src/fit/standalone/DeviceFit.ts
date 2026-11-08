/*
 * A device's fit in its stage (useDeviceFit.ts, DeviceFrame.tsx): the scale it is drawn at, and
 * the view of it the stage shows, down its screen and across it, so what the figure needs shows
 * whole and its cut edges fall between words. Boxes are in the device's own px, from its top left
 * corner.
 */
import type { DeviceKind } from '@docs-model/DocumentationTypes';
import { remPixels } from '@envui-internal/internal/lengths';
import type { Box } from '../FitGeometry';
import type { Aim, ScriptReader } from '../FitKind';
import { pixelTolerance } from '../../shared/Remeasure';

/**
 * The least each kind is drawn at, and the least its small text (body-sm) is drawn at, about
 * 10 px, whichever is larger: a device that would need to be drawn smaller is drawn at it instead
 * and cut off at the stage's edges. The compact scale's small text needs 0.84, the comfortable
 * scale's, a touch screen's, the kind's least.
 */
const leastScale: Record<DeviceKind, number> = { phone: 0.8, window: 0.75 };
const leastText = 10;

/** Room kept around a point the pointer heads to, in the device's px: its cursor and a margin. */
const pointRoom = 40;

/**
 * Room kept below a window's lowest words where it is cut off below them, in the device's px, and
 * below the lowest point its pointer heads to, whose box already keeps room for the cursor, past
 * the fade of the cut edge.
 */
const footRoom = { words: 96, point: 16 };

/** The point of a heading, in the device's own px, as a box with room around it. */
function pointBox(row: Element, scale: number, { selector, x, y }: Aim): Box | undefined {
  // The first that shows: a pane that is closed may keep its parts, hidden.
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
 * The boxes, in the device's own px, of what a figure names to keep in view (useMustShow): each
 * around its content, such as a value's text rather than the width of its row, with room for the
 * fade of a cut edge.
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
 * Where a view of `size` starts along one side of a device of `whole`: so it shows `span` where
 * it fits, as near the start as it can; where it doesn't, so it shows `focus`, moving no more
 * than it must from `from`; else at the span's start, or the device's. A view that would stop
 * within `snap` of the device's start or end goes on to it, where what it shows still fits, so a
 * sliver of the device isn't left in the fade of a cut edge.
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

/** The span of boxes along one side, or nothing where there are none. */
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

/** The box of each word the screen shows, in the device's own px, from its top left corner. */
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
 * How badly a view across from `start` to `end` cuts the screen's words, in the device's px: a
 * word cut through at an edge reads as broken, one in the fade at an edge as fading out, and an
 * edge of the device cut at all as less of a window than one that shows its frame. The words are
 * those of the rows the view shows, from `top` to `bottom`.
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
 * Where, from `least` to `most`, a view of `size` across a device of `whole` starts so that its cut
 * edges fall in gaps between words, such as between the navigation and the page, rather than
 * through them: the start that cuts the fewest, the nearest to `near` of those that cut as few.
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

/** A span grown to take in another, or either where there is one. */
const grown = (a: [number, number] | undefined, b: [number, number] | undefined) =>
  a && b ? ([Math.min(a[0], b[0]), Math.max(a[1], b[1])] as [number, number]) : (a ?? b);

/**
 * What a view has needed so far down the screen at the size it is drawn (`size`), the screen's
 * words, and the view across it the screen's state holds (`state`, which of its points show).
 */
interface Held {
  size: string;
  y?: [number, number];
  words?: Box[];
  state?: string;
  across?: { x: number; width: number; outset: { start: number; end: number } };
}

export interface DeviceFit {
  scale: number;
  width: number;
  height: number;
  x: number;
  y: number;
  cut: string;
  /** How far the view runs out over the stage's padding at its start and its end. */
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

/** A device stage's elements, as its fit reads them, and what it keeps from one fit to the next. */
export interface DeviceFitting {
  kind: DeviceKind;
  stage: HTMLElement;
  /** The box the view is drawn in, and the row in it at the device's own size. */
  box: HTMLElement;
  row: HTMLElement;
  /** The animated figure's picture, whose pointer's points the view keeps. */
  root: Element | null;
  /** Reads the script of the figure's picture (StageScript). */
  readScript: ScriptReader['read'];
  /** Where the view is, in the device's own px. */
  view: { x: number; y: number };
  /** What the view has needed so far at the size it is drawn, and the view each state holds. */
  held: Held;
}

/**
 * The scale a device is drawn at in its stage, as DeviceStage says, and how much of it shows at
 * first; none before it has a size.
 */
function deviceScale({ kind, stage, box, row }: DeviceFitting) {
  const rem = remPixels();
  const most =
    parseFloat(getComputedStyle(stage).getPropertyValue('--site-device-most')) * rem || Infinity;
  // How long a cut edge's fade is, in the stage's px (DeviceFrame.css).
  const fade =
    (parseFloat(getComputedStyle(box).getPropertyValue('--site-device-fade')) || 0) * rem;
  // offsetWidth and offsetHeight are the row's own, before its scale.
  const width = row.offsetWidth;
  const height = row.offsetHeight;
  const room = stage.clientWidth;
  if (!width || !height || !room) return null;
  const fits = Math.min(1, room / width, most / height);
  const small = parseFloat(getComputedStyle(row).getPropertyValue('--env-font-size-body-sm'));
  const least = Math.max(leastScale[kind], small ? leastText / (small * rem) : 0);
  const scale = Math.min(1, Math.max(fits, least));
  // A device cut off at its start or end runs out to the stage's edge there, over its padding, so
  // it fades out at the edge of the stage rather than in a strip inside it.
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
 * What the figure needs in view: the points its pointer heads to that show on the screen now, and
 * what it names (useMustShow). Down the screen, as much as it has needed so far at this size, so
 * the view holds as the figure plays. Each state of the screen, which of the pointer's points show
 * and what the figure names, has one view across it (viewAcross). The words are measured once a
 * layout and once a state, such as a panel that fills the screen with its text, not on every step
 * the figure plays (`fromMutation`).
 */
function deviceNeeds(
  f: DeviceFitting,
  { width, height, scale, room }: DeviceScale,
  fromMutation: boolean,
) {
  const { row, root } = f;
  // The scale the row is drawn at now, which its points are measured in.
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
 * Where the view across a device starts, how wide it shows and how far it runs out over the
 * stage's padding. What it keeps whole: all it needs where that fits; else what the figure names
 * with where the pointer heads, with the room around what it names or, where that is too wide,
 * without it, such as a pane that opens with the page that opened it; else where the pointer
 * heads, so what it presses is in view; else what the figure names. Each state's view across is
 * held while the state lasts: what moves in it, such as a divider dragged, moves in a still view,
 * and a state whose subject lies past the view's end, such as a pane that opens there, has a view
 * of its own rather than one sliding after it.
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
   * Where a view as wide as `viewWidth` starts: at the screen's start, so its bar and its
   * navigation show whole, where what it needs fits there; else as near the start as keeps it
   * whole, with its cut edges in gaps between words, or at the screen's end, which shows its
   * frame.
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
    // Whole over the padding: it sits in the middle of the stage.
    outset.start = outset.end = (width * scale - room) / 2;
    x = 0;
  } else if (across) {
    // A side that isn't cut keeps the stage's padding.
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

/** A device's fit in its stage, as DeviceStage says; none before it has a size. */
export function deviceFit(f: DeviceFitting, fromMutation: boolean): DeviceFit | null {
  const scaled = deviceScale(f);
  if (!scaled) return null;
  const { width, height, scale, fade } = scaled;
  const shown = { ...scaled.shown };
  const needs = deviceNeeds(f, scaled, fromMutation);
  const { held, view } = f;
  // A window whose page shows little, such as a heading and a line, is cut off below it, with room
  // under it, rather than shown mostly empty; never lower than two fifths of its width.
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
