import { inside, union, type Box } from '../../fit/FitGeometry';
import { pixelTolerance } from '../../shared/Remeasure';

export type Side = 'top' | 'bottom' | 'left' | 'right';

export interface Corners {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface Callout {
  number: number;
  index: number;
  label?: string;
  side?: Side;
  use?: { lines: string[]; width: number; x: number; y: number; side: Side };
  badge: { x: number; y: number };
  anchor: { x: number; y: number };
  box?: { x: number; y: number; width: number; height: number };
  gaps?: { x: number; y: number; width: number; height: number }[];
}

export interface Part {
  number: number;
  element: number;
  text: boolean;
  box: Box;
  corners: Corners;
  inline: boolean;
  edge: boolean;
  ownEdge: boolean;
  region: boolean;
  repeated: boolean;
}

export interface AnatomyGeometry {
  width: number;
  height: number;
  rtl: boolean;
  parts: Part[];
  contains: boolean[][];
  labels: Box[];
  opener?: Box;
}

const badgeReachPx = 28;
const badgeDiameterPx = 24;
const badgeSpacingPx = badgeDiameterPx + 12;
const mostRootInsetPx = 32;
const fencePaddingPx = 4;
const sidewaysSidePenaltyPx = 6;
const crossingLinePenaltyPx = 1000;

const fenced = (box: Box): Box => ({
  left: box.left - fencePaddingPx,
  top: box.top - fencePaddingPx,
  right: box.right + fencePaddingPx,
  bottom: box.bottom + fencePaddingPx,
});

const square: Corners = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

/** @internal */
export function gapsIn(box: Box, labels: Box[]) {
  const gaps = labels.filter(
    (label) =>
      label.left < box.right &&
      label.right > box.left &&
      label.top < box.bottom &&
      label.bottom > box.top &&
      !inside(box, label),
  );
  return gaps.length
    ? gaps.map((gap) => ({
        x: gap.left,
        y: gap.top,
        width: gap.right - gap.left,
        height: gap.bottom - gap.top,
      }))
    : undefined;
}

/** @internal */
export function cornerInset(along: number, length: number, start: number, end: number) {
  const curve = (radius: number, from: number) =>
    from < radius ? radius - Math.sqrt(radius ** 2 - (radius - from) ** 2) : 0;
  return Math.max(curve(start, along), curve(end, length - along));
}

/** @internal */
export function spread(positions: number[], min: number, max: number) {
  const order = positions.map((_, index) => index).sort((a, b) => positions[a]! - positions[b]!);
  const placed = order.map((index) => positions[index]!);
  for (let index = 1; index < placed.length; index++)
    placed[index] = Math.max(placed[index]!, placed[index - 1]! + badgeSpacingPx);
  if (placed.length) placed[placed.length - 1] = Math.min(placed.at(-1)!, max);
  for (let index = placed.length - 2; index >= 0; index--)
    placed[index] = Math.min(placed[index]!, placed[index + 1]! - badgeSpacingPx);
  if (placed.length) placed[0] = Math.max(placed[0]!, min);
  const result = [...positions];
  order.forEach((index, rank) => (result[index] = placed[rank]!));
  return result;
}

/** @internal */
export function inReadingOrder(callouts: Callout[], rtl: boolean) {
  const rows: Callout[][] = [];
  for (const callout of [...callouts].sort((a, b) => a.badge.y - b.badge.y)) {
    const row = rows.at(-1);
    if (row && callout.badge.y - row[0]!.badge.y < badgeDiameterPx / 2) row.push(callout);
    else rows.push([callout]);
  }
  const ordered = rows.flatMap((row) =>
    row.sort((a, b) => (rtl ? b.badge.x - a.badge.x : a.badge.x - b.badge.x)),
  );
  return ordered.map((callout, rank) => ({ ...callout, number: rank + 1 }));
}

/** @internal */
export function wholeParts(all: Part[], contains: boolean[][]) {
  const sameBox = (a: Box, b: Box) =>
    Math.abs(a.left - b.left) < 2 &&
    Math.abs(a.top - b.top) < 2 &&
    Math.abs(a.right - b.right) < 2 &&
    Math.abs(a.bottom - b.bottom) < 2;
  const holds = (part: Part) =>
    all.filter((other) => other !== part && contains[part.element]![other.element]);
  const frames = all.filter(
    (part) =>
      !part.ownEdge &&
      holds(part).length > 1 &&
      !all.some((other) => other !== part && contains[other.element]![part.element]),
  );
  return all.filter(
    (part) =>
      frames.includes(part) ||
      frames.some(
        (frame) =>
          contains[frame.element]![part.element] &&
          (sameBox(frame.box, part.box) ||
            (holds(part).length > 1 &&
              !part.repeated &&
              Math.abs(frame.box.left - part.box.left) < 2 &&
              Math.abs(frame.box.right - part.box.right) < 2)),
      ),
  );
}

interface Placed {
  number: number;
  box: Box;
  corners: Corners;
  root: boolean;
  side: Side;
  at: number | null;
  edge: boolean;
  region: boolean;
  options: [Side, number][];
}

interface Layout {
  geometry: AnatomyGeometry;
  found: Part[];
  outer: Box;
  reachOuter: Box;
}

export function placeCallouts(geometry: AnatomyGeometry): { callouts: Callout[]; whole: number[] } {
  const all = geometry.parts;
  const whole = wholeParts(all, geometry.contains);
  const found = all.filter((part) => !whole.includes(part));
  const wholeItems = whole.map(({ number }) => number - 1);
  if (!found.length) return { callouts: [], whole: wholeItems };
  const outer = union(all.map(({ box }) => box));
  const { opener } = geometry;
  const layout: Layout = {
    geometry,
    found,
    outer,
    reachOuter: opener ? union([outer, opener]) : outer,
  };
  const placed = placeSides(layout);
  const callouts = (['top', 'bottom', 'left', 'right'] as const).flatMap((side) =>
    calloutsAlong(
      side,
      placed.filter((item) => item.side === side),
      layout,
    ),
  );
  return { callouts: inReadingOrder(callouts, geometry.rtl), whole: wholeItems };
}

function blocked(avoid: Box | undefined, side: Side, box: Box) {
  if (!avoid) return false;
  const across = avoid.left < box.right && avoid.right > box.left;
  const along = avoid.top < box.bottom && avoid.bottom > box.top;
  if (side === 'top') return across && avoid.bottom <= box.top + 1;
  if (side === 'bottom') return across && avoid.top >= box.bottom - 1;
  if (side === 'left') return along && avoid.right <= box.left + 1;
  return along && avoid.left >= box.right - 1;
}

function clearAt({ found, geometry }: Layout, side: Side, box: Box) {
  const vertical = side === 'top' || side === 'bottom';
  const others = [...found.map((other) => other.box), ...geometry.labels].filter(
    (other) => !inside(other, box) && !inside(box, other),
  );
  const inWay = others.filter((other) =>
    side === 'top'
      ? other.top < box.top - pixelTolerance
      : side === 'bottom'
        ? other.bottom > box.bottom + pixelTolerance
        : side === 'left'
          ? other.left < box.left - pixelTolerance
          : other.right > box.right + pixelTolerance,
  );
  const across = (other: Box): [number, number] =>
    vertical ? [other.left - 10, other.right + 10] : [other.top - 10, other.bottom + 10];
  const [start, end] = vertical ? [box.left, box.right] : [box.top, box.bottom];
  const middle = (start + end) / 2;
  const low = Math.min(start + 4, middle);
  const high = Math.max(end - 4, middle);
  const spans = inWay
    .filter((other) =>
      vertical
        ? other.left < box.right && other.right > box.left
        : other.top < box.bottom && other.bottom > box.top,
    )
    .map(across);
  const candidates = [middle, ...spans.flat()]
    .filter((at) => at >= low && at <= high)
    .filter((at) => spans.every(([from, to]) => at <= from || at >= to))
    .sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle));
  return candidates[0] ?? null;
}

function placeSides(layout: Layout): Placed[] {
  const { found, outer, reachOuter, geometry } = layout;
  const avoid = geometry.opener;
  const fillsComponent = (box: Box) =>
    box.left - outer.left < 1 &&
    box.top - outer.top < 1 &&
    outer.right - box.right < 1 &&
    outer.bottom - box.bottom < 1;
  const elementHoldsEveryOther = ({ element, text }: Part) =>
    !text && found.length > 1 && found.every((other) => geometry.contains[element]![other.element]);
  const isRoot = (part: Part) => fillsComponent(part.box) || elementHoldsEveryOther(part);
  const roots = found.filter(isRoot).length;
  let stacked = 0;
  const placed = found.map((part): Placed => {
    const { number, box, corners, inline, edge, region } = part;
    const root = isRoot(part);
    if (root && roots > 1) {
      const side: Side = stacked++ % 2 ? 'bottom' : 'top';
      return { number, box, corners, root, side, at: null, edge, region, options: [] };
    }
    const distances = (
      [
        ['top', box.top - reachOuter.top],
        ['bottom', reachOuter.bottom - box.bottom],
        ['left', box.left - reachOuter.left + sidewaysSidePenaltyPx],
        ['right', reachOuter.right - box.right + sidewaysSidePenaltyPx],
      ] as [Side, number][]
    )
      .filter(
        ([side], _, sides) =>
          !blocked(avoid, side, box) || sides.every(([other]) => blocked(avoid, other, box)),
      )
      .map(([side, distance]): [Side, number] => [
        side,
        distance + (root || clearAt(layout, side, box) !== null ? 0 : crossingLinePenaltyPx),
      ]);
    let side: Side = root
      ? inline
        ? 'top'
        : geometry.rtl
          ? 'right'
          : 'left'
      : distances.reduce((best, entry) => (entry[1] < best[1] ? entry : best))[0];
    const holdsCalledOutParts = found.some(
      (other) => other.number !== number && inside(box, other.box),
    );
    const below = distances.find(([name]) => name === 'bottom');
    const above = distances.find(([name]) => name === 'top');
    if (
      side === 'top' &&
      !root &&
      holdsCalledOutParts &&
      below &&
      above &&
      Math.abs(below[1] - above[1]) < 1
    )
      side = 'bottom';
    return {
      number,
      box,
      corners,
      root: root && !inline,
      side,
      at: root ? null : clearAt(layout, side, box),
      edge,
      region,
      options: distances,
    };
  });
  separateNested(layout, placed);
  return placed;
}

function separateNested(layout: Layout, placed: Placed[]) {
  const nested = (a: Box, b: Box) => inside(a, b) || inside(b, a);
  for (const item of placed) {
    if (item.root) continue;
    const shares = placed.some(
      (other) =>
        other !== item && !other.root && other.side === item.side && inside(item.box, other.box),
    );
    if (!shares) continue;
    const next = item.options
      .filter(
        ([side, distance]) =>
          side !== item.side &&
          distance < 16 &&
          !placed.some(
            (other) => other !== item && other.side === side && nested(item.box, other.box),
          ),
      )
      .sort((a, b) => a[1] - b[1])[0];
    if (!next) continue;
    item.side = next[0];
    item.at = clearAt(layout, next[0], item.box);
  }
}

function calloutsAlong(side: Side, items: Placed[], { geometry, reachOuter }: Layout): Callout[] {
  const vertical = side === 'top' || side === 'bottom';
  const centre = (box: Box) => (vertical ? (box.left + box.right) / 2 : (box.top + box.bottom) / 2);
  const extent = vertical ? geometry.width : geometry.height;
  const parts = items.filter(({ root }) => !root).map(({ box }) => centre(box));
  const along = spread(
    items.map(({ box, root, at }) =>
      root && !vertical
        ? Math.min(centre(box), box.top + mostRootInsetPx, Math.min(...parts) - badgeSpacingPx)
        : (at ?? centre(box)),
    ),
    badgeDiameterPx / 2 + 2,
    extent - badgeDiameterPx / 2 - 2,
  );
  return items.map(({ number, box: part, corners: partCorners, root, edge, region }, index) => {
    const at = along[index]!;
    const own = root || edge;
    const box = own ? part : fenced(part);
    const corners = own ? partCorners : square;
    const clamp = (value: number, low: number, high: number) =>
      high - low < 4 ? (low + high) / 2 : Math.min(Math.max(value, low + 2), high - 2);
    const nearest = badgeDiameterPx / 2 + 2;
    const badge =
      side === 'top'
        ? { x: at, y: Math.max(reachOuter.top - badgeReachPx, nearest) }
        : side === 'bottom'
          ? { x: at, y: Math.min(reachOuter.bottom + badgeReachPx, geometry.height - nearest) }
          : side === 'left'
            ? { x: Math.max(reachOuter.left - badgeReachPx, nearest), y: at }
            : { x: Math.min(reachOuter.right + badgeReachPx, geometry.width - nearest), y: at };
    const x = clamp(at, box.left, box.right);
    const y = clamp(at, box.top, box.bottom);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const { topLeft, topRight, bottomLeft, bottomRight } = corners;
    const anchor =
      side === 'top'
        ? { x, y: box.top + cornerInset(x - box.left, width, topLeft, topRight) }
        : side === 'bottom'
          ? { x, y: box.bottom - cornerInset(x - box.left, width, bottomLeft, bottomRight) }
          : side === 'left'
            ? { x: box.left + cornerInset(y - box.top, height, topLeft, bottomLeft), y }
            : { x: box.right - cornerInset(y - box.top, height, topRight, bottomRight), y };
    return {
      number,
      index: number - 1,
      badge,
      anchor,
      box:
        root || !region
          ? undefined
          : { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top },
      gaps: root || !region ? undefined : gapsIn(box, geometry.labels),
    };
  });
}
