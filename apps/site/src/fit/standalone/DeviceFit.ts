import type { DeviceKind } from '../../documentation/DocumentationTypes';
import type { Box } from '../FitGeometry';
import { pixelTolerance } from '../../shared/Remeasure';

const leastScale: Record<DeviceKind, number> = { phone: 0.8, window: 0.75 };
const leastSmallTextPx = 10;

export const pointRoomPx = 40;

const footRoomPx = { words: 96, point: 16 };

const cutEdgeCost = 3;
const wordCutThroughCost = 10;
const wordInFadeCost = 2;
const gapStepPx = 2;
const distanceCostPerPx = 0.02;
const leastWindowHeightPerWidth = 0.4;
const cutWindowBelowHeightShare = 0.85;

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
    cost += cutEdgeCost;
    const band = inward > 0 ? [at, at + fade] : [at - fade, at];
    for (const word of words) {
      if (word.bottom <= top || word.top >= bottom) continue;
      if (word.left < at - 1 && word.right > at + 1) cost += wordCutThroughCost;
      else if (word.right > band[0] && word.left < band[1]) cost += wordInFadeCost;
    }
  };
  if (start > pixelTolerance) edge(start, 1);
  if (end < whole - pixelTolerance) edge(end, -1);
  return cost;
}

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
  for (let at = least; at < most; at += gapStepPx) candidates.push(at);
  let best = least;
  let lowest = Infinity;
  for (const at of candidates) {
    const cost =
      cutCost(words, at, at + size, whole, fade, rows) + Math.abs(at - near) * distanceCostPerPx;
    if (cost < lowest - 1e-6) {
      lowest = cost;
      best = at;
    }
  }
  return best;
}

const grown = (
  a: [number, number] | undefined,
  b: [number, number] | undefined,
): [number, number] | undefined =>
  a && b ? [Math.min(a[0], b[0]), Math.max(a[1], b[1])] : (a ?? b);

export interface Held {
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

export function deviceScale({ kind, width, height, room, most, fade, smallText, pad }: DeviceRead) {
  if (!width || !height || !room) return null;
  const fits = Math.min(1, room / width, most / height);
  const least = Math.max(leastScale[kind], smallText ? leastSmallTextPx / smallText : 0);
  const scale = Math.min(1, Math.max(fits, least));
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

type DeviceNeeds = ReturnType<typeof deviceNeeds> & { words: Box[] };

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
  const bareSpan = spanOf(named, (box) => [box.left + pointRoomPx, box.right - pointRoomPx]);
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
    outset.start = outset.end = (width * scale - room) / 2;
    x = 0;
  } else if (across) {
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

export function placeDevice(
  kind: DeviceKind,
  scaled: DeviceScale,
  needs: DeviceNeeds,
  held: Held,
  view: { x: number; y: number },
): DeviceFit {
  const { width, height, scale, fade } = scaled;
  const shown = { ...scaled.shown };
  if (kind === 'window') {
    const content = Math.max(
      ...needs.words.map((word) => word.bottom + footRoomPx.words),
      held.y ? held.y[1] + footRoomPx.point : 0,
    );
    const low = Math.max(content, (leastWindowHeightPerWidth * shown.width) / scale);
    if (low < cutWindowBelowHeightShare * height)
      shown.height = Math.min(shown.height, low * scale);
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
