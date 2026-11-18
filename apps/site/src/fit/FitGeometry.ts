import type { FitKind } from './FitKind';
import { pixelTolerance } from '../shared/Remeasure';

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const scaleTolerance = 0.0005;

export const scalePrecision = 1000;

export const insetPx = 16;

/** @internal */
export const largestTileScale = 2;

export const legibleScale = 0.8;

export const marginPx = 6;

const playMarginPx = 10;

const zoomSlack = 0.97;

export const insetSlackPx = 4;

export const popupRoomPx = 5;

export const wholeRoomPx = 8;

export const cursorLengthRem = 1.25;

export const cursorRoomPx = 0;

const settledSlackPx = 2;
const containSlackPx = 1;
const cutSlackPx = 1;
const anchoredBisectionSteps = 24;

export const union = (boxes: readonly Box[]): Box => ({
  left: Math.min(...boxes.map((box) => box.left)),
  top: Math.min(...boxes.map((box) => box.top)),
  right: Math.max(...boxes.map((box) => box.right)),
  bottom: Math.max(...boxes.map((box) => box.bottom)),
});

export function join(...boxes: (Box | null)[]): Box | null {
  const some = boxes.filter((box): box is Box => box !== null);
  return some.length ? union(some) : null;
}

export const stagePoint = (point: number, to: number, size: number, scale: number) =>
  size / 2 - to + point * scale;

export const inside = (outer: Box, inner: Box) =>
  inner.left >= outer.left - pixelTolerance &&
  inner.top >= outer.top - pixelTolerance &&
  inner.right <= outer.right + pixelTolerance &&
  inner.bottom <= outer.bottom + pixelTolerance;

export const covers = (outer: Box, inner: Box) =>
  inner.left >= outer.left - settledSlackPx &&
  inner.top >= outer.top - settledSlackPx &&
  inner.right <= outer.right + settledSlackPx &&
  inner.bottom <= outer.bottom + settledSlackPx;

export function contain(at: number, low: number, high: number, half: number) {
  if (high - low > 2 * (half - marginPx)) return (low + high) / 2;
  if (low - at >= -half - containSlackPx && high - at <= half + containSlackPx) return at;
  return Math.min(Math.max(at, high - half + marginPx), low + half - marginPx);
}

export function cutSides(
  shows: Box,
  across: number,
  down: number,
  toX: number,
  toY: number,
  scale: number,
) {
  const past = (at: number, size: number, low: number, high: number) => [
    size / 2 - at + low * scale < -cutSlackPx,
    size / 2 - at + high * scale > size + cutSlackPx,
  ];
  const [top, bottom] = past(toY, down, shows.top, shows.bottom);
  const [start, end] = past(toX, across, shows.left, shows.right);
  return [top && 'top', bottom && 'bottom', start && 'start', end && 'end']
    .filter(Boolean)
    .join(' ');
}

export function frameOnCourse(
  parts: readonly (Box | null)[],
  across: number,
  down: number,
  toX: number,
  toY: number,
  scale: number,
) {
  const halfAcross = across / 2 - 4;
  const halfDown = down / 2 - 4;
  let held: Box | null = null;
  let fromStart = { x: false, y: false };
  for (const found of parts) {
    if (!found || found.right <= found.left || found.bottom <= found.top) continue;
    let box = found;
    if (!held) {
      const right = found.left + (2 * (halfAcross - marginPx) - pixelTolerance) / scale;
      const bottom = found.top + (2 * (halfDown - marginPx) - pixelTolerance) / scale;
      fromStart = { x: found.right > right, y: found.bottom > bottom };
      box = {
        ...found,
        right: Math.min(found.right, right),
        bottom: Math.min(found.bottom, bottom),
      };
    }
    const next: Box = join(held, box)!;
    if (
      (next.right - next.left) * scale > 2 * (halfAcross - marginPx) ||
      (next.bottom - next.top) * scale > 2 * (halfDown - marginPx)
    )
      continue;
    held = next;
  }
  if (!held) return { toX, toY };
  return {
    toX: fromStart.x
      ? held.left * scale + halfAcross - marginPx
      : contain(toX, held.left * scale, held.right * scale, halfAcross),
    toY: fromStart.y
      ? held.top * scale + halfDown - marginPx
      : contain(toY, held.top * scale, held.bottom * scale, halfDown),
  };
}

export interface Padded {
  box: Box;
  pad: number;
}

function paddedExtent(parts: readonly Padded[], scale: number, axis: 'x' | 'y') {
  let low = Infinity;
  let high = -Infinity;
  for (const { box, pad } of parts) {
    low = Math.min(low, (axis === 'x' ? box.left : box.top) * scale - pad);
    high = Math.max(high, (axis === 'x' ? box.right : box.bottom) * scale + pad);
  }
  return { low, high };
}

export function anchoredScale(parts: readonly Padded[], across: number, down: number) {
  const fits = (scale: number) => {
    const x = paddedExtent(parts, scale, 'x');
    const y = paddedExtent(parts, scale, 'y');
    return x.high - x.low <= across + pixelTolerance && y.high - y.low <= down + pixelTolerance;
  };
  if (fits(largestTileScale)) return largestTileScale;
  let low = 0;
  let high = largestTileScale;
  for (let count = 0; count < anchoredBisectionSteps; count++) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  return low;
}

export const phoneSteps = (floor: number, popupLeast: number) =>
  [...new Set([1, floor, popupLeast])].filter((step) => step > 0).sort((a, b) => b - a);

export const stepDown = (steps: readonly number[], scale: number, low: number) =>
  steps.find((each) => each >= low - scaleTolerance && each <= scale + scaleTolerance) ?? low;

export interface Extent extends Box {
  width: number;
  height: number;
}

export const windowScale = (
  kind: FitKind,
  { width, height }: Extent,
  canvas: { offsetWidth: number; offsetHeight: number },
) =>
  Math.min(
    kind.tile ? largestTileScale : 1,
    width / canvas.offsetWidth,
    height / canvas.offsetHeight,
  );

export interface OwnScales {
  least: number;
  leastBlock: number;
  floor: number;
  phone: boolean;
  steps: readonly number[];
}

export function ownScale({ left, right, width, height }: Extent, scales: OwnScales) {
  const downScale = scales.leastBlock > 0 ? height / scales.leastBlock : 1;
  return scales.phone
    ? stepDown(scales.steps, Math.min(1, width / (right - left), downScale), scales.floor)
    : Math.min(1, width / scales.least, downScale);
}

export interface Resting {
  extent: Extent;
  window: number;
  own: number;
  popup: boolean;
  scales: { phone: boolean; popupLeast: number; overlay: number };
  popupScale: (atMost: number) => number;
  overlayWhole: number;
}

export function restingScale(kind: FitKind, resting: Resting) {
  switch (kind.scale) {
    case 'own':
      return componentScale(resting);
    case 'window':
      return resting.window;
    case 'content':
      return contentScale(resting);
  }
}

function componentScale({ own, popup, scales, popupScale, overlayWhole }: Resting) {
  if (!popup) return own;
  const drawn = popupScale(scales.phone ? 1 : own);
  return scales.overlay
    ? Math.min(scales.overlay, drawn, Math.max(scales.popupLeast, overlayWhole))
    : drawn;
}

function contentScale({ extent, window }: Resting) {
  const { left, top, right, bottom, width, height } = extent;
  return Math.min(window, width / (right - left), height / (bottom - top));
}

export interface DrawOut {
  must: Box;
  anchor: Box | null;
  at: { x: number; y: number; scale: number };
  across: number;
  down: number;
  scale: number;
  least: number;
  stepped: (scale: number) => number;
}

export function drawOut({ must, anchor, at, across, down, scale: drawn, least, stepped }: DrawOut) {
  const screen = (point: number, to: number, size: number) => stagePoint(point, to, size, at.scale);
  const inView =
    anchor &&
    screen(anchor.left, at.x, across) >= 0 &&
    screen(anchor.right, at.x, across) <= across &&
    screen(anchor.top, at.y, down) >= 0 &&
    screen(anchor.bottom, at.y, down) <= down;
  const needed = join(must, anchor)!;
  const middle =
    anchor && inView
      ? { x: (anchor.left + anchor.right) / 2, y: (anchor.top + anchor.bottom) / 2 }
      : null;
  const holding = (size: number, to: number, point: number, low: number, high: number) => {
    const place = screen(point, to, size);
    return Math.min(
      low < point ? (place - playMarginPx) / (point - low) : Infinity,
      high > point ? (size - playMarginPx - place) / (high - point) : Infinity,
    );
  };
  const fitsAsIs =
    (needed.right - needed.left) * drawn <= across - 2 * playMarginPx &&
    (needed.bottom - needed.top) * drawn <= down - 2 * playMarginPx;
  const wanted = fitsAsIs
    ? drawn
    : middle
      ? Math.min(
          holding(across, at.x, middle.x, needed.left, needed.right),
          holding(down, at.y, middle.y, needed.top, needed.bottom),
        )
      : Math.min(
          (across - 2 * playMarginPx) / (needed.right - needed.left),
          (down - 2 * playMarginPx) / (needed.bottom - needed.top),
        );
  const scale =
    wanted >= drawn * zoomSlack ? drawn : stepped(Math.min(drawn, Math.max(least, wanted)));
  const along = (
    size: number,
    to: number,
    point: number | undefined,
    low: number,
    high: number,
    keepLow?: number,
    keepHigh?: number,
  ) => {
    if ((high - low) * scale > size - 2 * playMarginPx + pixelTolerance) {
      const start = size / 2 + low * scale - playMarginPx;
      if (keepLow === undefined || keepHigh === undefined) return start;
      return Math.min(
        Math.max(start, size / 2 + keepHigh * scale - size + playMarginPx),
        size / 2 + keepLow * scale - playMarginPx,
      );
    }
    const held =
      point === undefined
        ? ((low + high) / 2) * scale
        : size / 2 + point * scale - screen(point, to, size);
    return Math.min(
      Math.max(held, size / 2 + high * scale - size + playMarginPx),
      size / 2 + low * scale - playMarginPx,
    );
  };
  return {
    scale,
    toX: along(across, at.x, middle?.x, needed.left, needed.right, anchor?.left, anchor?.right),
    toY: along(down, at.y, middle?.y, needed.top, needed.bottom, anchor?.top, anchor?.bottom),
  };
}
