import {
  cursorRoomPx,
  insetPx,
  join,
  scalePrecision,
  scaleTolerance,
  type Box,
} from './FitGeometry';
import { pixelTolerance } from '../shared/Remeasure';

export const rowSlackPx = 2;

const heldFadeLeastPx = 8;

export const heldTopLeastPx = 4;

const heldLeastScale = 0.6;

export const heldNextLeastScale = 0.7;

const heldRowsLeastScale = 0.65;

const heldBisectionSteps = 16;

export interface HeldWay {
  whole: Box;
  reach: Box;
  fade: number;
  least: number;
  slack: number;
}

export interface HeldHeights {
  stage: number;
  top: number;
  pointerFoot: number | null;
  cursor: number;
}

export interface HeldRows {
  chosen: Box;
  keep: Box;
  keepFurther: Box;
  below: boolean;
  further: boolean;
}

export function heldWays({ chosen, keep, keepFurther, below, further }: HeldRows): HeldWay[] {
  return [
    ...(further
      ? [
          {
            whole: keep,
            reach: keepFurther,
            fade: heldFadeLeastPx,
            least: heldRowsLeastScale,
            slack: rowSlackPx,
          },
        ]
      : []),
    ...(below
      ? [
          {
            whole: keep,
            reach: keep,
            fade: heldFadeLeastPx,
            least: heldLeastScale,
            slack: rowSlackPx,
          },
          { whole: keep, reach: keep, fade: 0, least: heldLeastScale, slack: rowSlackPx },
        ]
      : []),
    { whole: chosen, reach: keep, fade: 0, least: heldNextLeastScale, slack: 0 },
    { whole: chosen, reach: chosen, fade: heldFadeLeastPx, least: heldLeastScale, slack: 0 },
    { whole: chosen, reach: chosen, fade: 0, least: heldLeastScale, slack: 0 },
  ];
}

export function heldRows(acted: readonly Box[], below: readonly Box[], further: readonly Box[]) {
  const chosen = join(...acted);
  if (!chosen) return null;
  const keep = join(chosen, ...below)!;
  return {
    chosen,
    keep,
    keepFurther: join(keep, ...further)!,
    below: below.length > 0,
    further: further.length > 0,
  };
}

/** @internal */
export function heldTop(scale: number, way: HeldWay, heights: HeldHeights) {
  const { stage, top, pointerFoot, cursor } = heights;
  const cursorFoot = pointerFoot === null ? -Infinity : (pointerFoot - top + cursor) * scale;
  const at = Math.min(
    insetPx,
    stage - way.fade - (way.whole.bottom - top) * scale + (way.fade ? 0 : way.slack),
    stage + way.slack - (way.reach.bottom - top) * scale,
    stage - cursorRoomPx - cursorFoot,
  );
  return at >= heldTopLeastPx - pixelTolerance ? { at, fadeAt: way.whole.bottom } : null;
}

export function heldPlace(scale: number, ways: readonly HeldWay[], heights: HeldHeights) {
  for (const way of ways) {
    const placed = heldTop(scale, way, heights);
    if (placed) return placed;
  }
  return null;
}

/** @internal */
export function heldAtMost(low: number, high: number, way: HeldWay, heights: HeldHeights) {
  if (high < low) return null;
  if (heldTop(high, way, heights)) return high;
  if (!heldTop(low, way, heights)) return null;
  for (let count = 0; count < heldBisectionSteps; count++) {
    const middle = (low + high) / 2;
    if (heldTop(middle, way, heights)) low = middle;
    else high = middle;
  }
  return Math.floor(low * scalePrecision) / scalePrecision;
}

export interface HeldScales {
  phone: boolean;
  steps: readonly number[];
  popupLeast: number;
  overlayScale: number;
}

export function heldScale(
  scale: number,
  ways: readonly HeldWay[],
  heights: HeldHeights,
  { tall, height }: { tall: number; height: number },
  { phone, steps, popupLeast, overlayScale }: HeldScales,
) {
  if (!ways.length || tall * scale <= height + insetPx) return scale;
  const [alone, bare] = ways.slice(-2) as [HeldWay, HeldWay];
  for (const way of ways.slice(0, -2)) {
    const found = heldAtMost(way.least, scale, way, heights);
    if (found !== null) return found;
  }
  if (heldTop(scale, alone, heights)) return scale;
  const least = overlayScale || scale;
  const lower = [...(phone ? steps : [popupLeast]), least]
    .filter((each) => each < scale - scaleTolerance && each >= least - scaleTolerance)
    .sort((a, b) => b - a);
  const found = lower.find((each) => heldTop(each, alone, heights) !== null);
  if (found !== undefined) return found;
  const high = lower.at(-1) ?? scale;
  return (
    heldAtMost(heldLeastScale, high, alone, heights) ??
    heldAtMost(heldLeastScale, high, bare, heights) ??
    heldLeastScale
  );
}

export function subjectScale(
  scale: number,
  wants: number,
  { phone, steps, popupLeast, overlayScale }: HeldScales,
) {
  if (wants >= scale - scaleTolerance) return scale;
  const overlayLeast = overlayScale || scale;
  const found = [...(phone ? steps : [popupLeast]), overlayLeast]
    .filter((each) => each < scale - scaleTolerance)
    .sort((a, b) => b - a)
    .find((each) => each <= wants + scaleTolerance);
  return found ?? Math.max(heldLeastScale, Math.floor(wants * scalePrecision) / scalePrecision);
}

const followSlackPx = 4;

const followsAtMost = 30;

const boxSlackPx = 1;
const viewSlackPx = 0.01;

export interface Shape {
  sizes: number[];
  whole: boolean;
  view: number[];
  boxes: { box: Box; popup: Element | null }[];
  popups: number;
}

export interface Framed {
  shape: Shape;
  scale: number;
  toX: number;
  toY: number;
  cut: string | undefined;
  fadeAt: number | null;
}

export interface Follow {
  count: number;
  following: boolean;
}

export function holdsFrame(was: Shape, now: Shape, follow: Follow) {
  const holds = (held: boolean) => ({ holds: held, follow });
  const near = (a: readonly number[], b: readonly number[], slack: number) =>
    a.every((value, index) => Math.abs(value - b[index]!) <= slack);
  const edges = ({ box }: Shape['boxes'][number]) => [box.left, box.top, box.right, box.bottom];
  const same = (before: Shape['boxes'], after: Shape['boxes'], slack: number) =>
    before.length === after.length &&
    before.every((shown, index) => near(edges(shown), edges(after[index]!), slack));
  const parts = (boxes: Shape['boxes'], inPopup: boolean) =>
    boxes.filter(({ popup }) => (popup !== null) === inPopup);
  if (
    !near(was.sizes, now.sizes, pixelTolerance) ||
    was.popups !== now.popups ||
    !same(parts(was.boxes, false), parts(now.boxes, false), boxSlackPx)
  )
    return holds(false);
  if (!now.whole) return holds(true);
  const popups = [parts(was.boxes, true), parts(now.boxes, true)] as const;
  if (near(was.view, now.view, viewSlackPx)) return holds(same(...popups, boxSlackPx));
  if (follow.count >= followsAtMost || same(...popups, followSlackPx)) return holds(true);
  return { holds: false, follow: { count: follow.count + 1, following: true } };
}
