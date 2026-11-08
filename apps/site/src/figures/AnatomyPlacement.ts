/*
 * Where an anatomy figure's callouts sit, from its geometry (AnatomyGeometry.ts): a numbered one on
 * each part, on the side it is nearest to, spread so none overlap; for a variants figure, each
 * variant's name beside its item. Nothing here reads the page (tests/AnatomyPlacement.test.mjs).
 */

export type Side = 'top' | 'bottom' | 'left' | 'right';

/** A box in the stage's coordinates. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A part's corner radii, in px, as drawn: none for the text of a part. */
export interface Corners {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

/** A callout's number, where it sits and the part it points at, in the stage's coordinates. */
export interface Callout {
  /** Its number, in the order the figure is read: by rows, from the top, each from the start. */
  number: number;
  /** The legend item it calls out, from 0. */
  index: number;
  /** A variants figure's callout: the variant's name, and the side of its item it sits on. */
  label?: string;
  side?: Side;
  /**
   * In a variants figure whose items stand one under another, what the variant is for, beside its
   * item on the other side from its name, where every item's fits (stackedVariants): its lines,
   * and where they start.
   */
  use?: { lines: string[]; width: number; x: number; y: number; side: Side };
  badge: { x: number; y: number };
  anchor: { x: number; y: number };
  /**
   * The part's box, outlined: only a region's, which has no edge of its own and holds several
   * things, such as a card's actions. A part with a fill, a border or a shadow shows its own edge,
   * and text or an icon its own shape, so the callout's dot alone marks them.
   */
  box?: { x: number; y: number; width: number; height: number };
  /** Where the outline gives way, so it doesn't strike through a label it crosses. */
  gaps?: { x: number; y: number; width: number; height: number }[];
}

/** One part a legend item names, as measured in the subject (anatomyGeometry). */
export interface Part {
  /** Its legend item's number, from 1. */
  number: number;
  /** Its element, as an index into the geometry's `contains`. */
  element: number;
  /** Whether the part is its element's own text. */
  text: boolean;
  /** What shows of it, and its corners. */
  box: Box;
  corners: Corners;
  /** Whether it comes after text in its line, such as a time inside a sentence. */
  inline: boolean;
  /** Whether what shows of it draws an edge of its own, and whether its element does. */
  edge: boolean;
  ownEdge: boolean;
  /** A region: no edge or shape of its own, around several things that show. */
  region: boolean;
  /** One of several alike, such as a list's row. */
  repeated: boolean;
}

/** An anatomy figure's subject as measured (anatomyGeometry), in the stage's coordinates. */
export interface AnatomyGeometry {
  /** The stage's size, and whether it reads right to left. */
  width: number;
  height: number;
  rtl: boolean;
  parts: Part[];
  /** Whether one part's element holds another's, itself included, by their `element`. */
  contains: boolean[][];
  /** The labels that show in the subject. */
  labels: Box[];
  /** What opens the popup a figure shows open, such as a select's field. */
  opener?: Box;
}

/** How far outside the component a callout's badge sits, and the badges' diameter, in px. */
const reach = 28;
const badgeSize = 24;
/** The least distance between two badges' centres on one side, so neighbours never touch. */
const spacing = badgeSize + 12;
/** How far below its top the root's callout points, at most: past a large corner's curve. */
const rootInset = 32;
/** How far a part's box stands off the part, in px, so it never runs through its text. */
const fencePadding = 4;

/** A part's box grown by the fence's padding on every side. */
const fenced = (box: Box): Box => ({
  left: box.left - fencePadding,
  top: box.top - fencePadding,
  right: box.right + fencePadding,
  bottom: box.bottom + fencePadding,
});

/** The corners of a part's box, which is square. */
const square: Corners = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

/** The least box around boxes. */
export const around = (boxes: Box[]): Box => ({
  left: Math.min(...boxes.map((box) => box.left)),
  top: Math.min(...boxes.map((box) => box.top)),
  right: Math.max(...boxes.map((box) => box.right)),
  bottom: Math.max(...boxes.map((box) => box.bottom)),
});

/** Whether a box lies inside another, to half a px. */
const inside = (outer: Box, inner: Box) =>
  inner.left >= outer.left - 0.5 &&
  inner.right <= outer.right + 0.5 &&
  inner.top >= outer.top - 0.5 &&
  inner.bottom <= outer.bottom + 0.5;

/**
 * Where a part's outline gives way: across the labels its edge runs through, such as a field's
 * label floated into its outline, which the outline would otherwise strike through. A label
 * wholly inside the box, or the part itself, leaves the outline whole.
 */
export function gapsIn(box: Box, labels: Box[]) {
  const gaps = labels.filter(
    (label) =>
      label.left < box.right &&
      label.right > box.left &&
      label.top < box.bottom &&
      label.bottom > box.top &&
      !(
        label.left >= box.left - 0.5 &&
        label.right <= box.right + 0.5 &&
        label.top >= box.top - 0.5 &&
        label.bottom <= box.bottom + 0.5
      ),
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

/**
 * How far in from its box's side a part's edge is at `along` past the box's start on that side, by
 * the corners at either end of the side: a callout that meets a rounded part near its corner
 * meets its curve, not the empty corner of its box.
 */
export function cornerInset(along: number, length: number, start: number, end: number) {
  const curve = (radius: number, from: number) =>
    from < radius ? radius - Math.sqrt(radius ** 2 - (radius - from) ** 2) : 0;
  return Math.max(curve(start, along), curve(end, length - along));
}

/** Spreads positions along one side so badges never overlap, within `min` and `max`. */
export function spread(positions: number[], min: number, max: number) {
  const order = positions.map((_, index) => index).sort((a, b) => positions[a]! - positions[b]!);
  const placed = order.map((index) => positions[index]!);
  for (let index = 1; index < placed.length; index++)
    placed[index] = Math.max(placed[index]!, placed[index - 1]! + spacing);
  if (placed.length) placed[placed.length - 1] = Math.min(placed.at(-1)!, max);
  for (let index = placed.length - 2; index >= 0; index--)
    placed[index] = Math.min(placed[index]!, placed[index + 1]! - spacing);
  if (placed.length) placed[0] = Math.max(placed[0]!, min);
  const result = [...positions];
  order.forEach((index, rank) => (result[index] = placed[rank]!));
  return result;
}

/**
 * Numbers the callouts in the order the figure is read: by rows of badges from the top, and along
 * each row from the start, so the numbers go round the component rather than jump about it.
 */
export function inReadingOrder(callouts: Callout[], rtl: boolean) {
  const rows: Callout[][] = [];
  for (const callout of [...callouts].sort((a, b) => a.badge.y - b.badge.y)) {
    const row = rows.at(-1);
    if (row && callout.badge.y - row[0]!.badge.y < badgeSize / 2) row.push(callout);
    else rows.push([callout]);
  }
  const ordered = rows.flatMap((row) =>
    row.sort((a, b) => (rtl ? b.badge.x - a.badge.x : a.badge.x - b.badge.x)),
  );
  return ordered.map((callout, rank) => ({ ...callout, number: rank + 1 }));
}

/**
 * The parts the legend names alone, as their callouts would point at the edges of the parts
 * inside them: the outermost frame around several others, with no edge of its own, such as a
 * field around its label and control; and inside it, a part of its box, or the one part as wide
 * as it that holds several others, such as that control around its icon, prefix and input, but
 * not a list's row.
 */
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

/** What a part's callout is placed by, as the sides are chosen (placeSides). */
interface Placed {
  number: number;
  box: Box;
  corners: Corners;
  root: boolean;
  side: Side;
  /** Where along its side its line reaches out clear of the others, if anywhere. */
  at: number | null;
  edge: boolean;
  region: boolean;
  /** Each side it may take, and how far it is from it. */
  options: [Side, number][];
}

/** What the sides are chosen in: the parts called out, and what they keep clear of. */
interface Layout {
  geometry: AnatomyGeometry;
  found: Part[];
  /** The whole component, the parts the legend names alone included. */
  outer: Box;
  /** The component and what opens it: the callouts sit outside both. */
  reachOuter: Box;
}

/**
 * Places a numbered callout on each part found in the subject: on the side of the component the
 * part is nearest to, the root at the start, with a line to what shows of the part, and a region's
 * box outlined. A part that only frames the others, with no edge of its own, such as a field
 * around its label and control, and a part of the same box as that frame, such as the control,
 * take no callout: the legend names them alone (`whole`, by their legend items, wholeParts). In a
 * figure of an open popup, the callouts keep clear of what opens it, such as a select's field: no
 * callout sits over it, or reaches a part across it.
 */
export function placeCallouts(geometry: AnatomyGeometry): { callouts: Callout[]; whole: number[] } {
  const all = geometry.parts;
  const whole = wholeParts(all, geometry.contains);
  const found = all.filter((part) => !whole.includes(part));
  const wholeItems = whole.map(({ number }) => number - 1);
  if (!found.length) return { callouts: [], whole: wholeItems };
  const outer = around(all.map(({ box }) => box));
  const { opener } = geometry;
  const layout: Layout = {
    geometry,
    found,
    outer,
    reachOuter: opener ? around([outer, opener]) : outer,
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

/** Whether what opens the popup lies between a part and a side. */
function blocked(avoid: Box | undefined, side: Side, box: Box) {
  if (!avoid) return false;
  const across = avoid.left < box.right && avoid.right > box.left;
  const along = avoid.top < box.bottom && avoid.bottom > box.top;
  if (side === 'top') return across && avoid.bottom <= box.top + 1;
  if (side === 'bottom') return across && avoid.top >= box.bottom - 1;
  if (side === 'left') return along && avoid.right <= box.left + 1;
  return along && avoid.left >= box.right - 1;
}

/**
 * Where along a side a straight line from the part reaches out past the others, nearest its
 * middle: clear of the parts and labels on the way, but those around it or inside it, which its
 * line crosses whatever it does. Null where every line from it would cross one.
 */
function clearAt({ found, geometry }: Layout, side: Side, box: Box) {
  const vertical = side === 'top' || side === 'bottom';
  const others = [...found.map((other) => other.box), ...geometry.labels].filter(
    (other) => !inside(other, box) && !inside(box, other),
  );
  const inWay = others.filter((other) =>
    side === 'top'
      ? other.top < box.top - 0.5
      : side === 'bottom'
        ? other.bottom > box.bottom + 0.5
        : side === 'left'
          ? other.left < box.left - 0.5
          : other.right > box.right + 0.5,
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

/** The side each part's callout takes, and where along it its line reaches out. */
function placeSides(layout: Layout): Placed[] {
  const { found, outer, reachOuter, geometry } = layout;
  const avoid = geometry.opener;
  // The root fills the component, or holds every other part, as a field holds its label floated
  // above its own box. A part that is the text of an element, such as a button's label, is never
  // the root, though its element holds the others.
  const isRoot = ({ box, element, text }: Part) =>
    (box.left - outer.left < 1 &&
      box.top - outer.top < 1 &&
      outer.right - box.right < 1 &&
      outer.bottom - box.bottom < 1) ||
    (!text &&
      found.length > 1 &&
      found.every((other) => geometry.contains[element]![other.element]));
  // Parts that all fill the component, such as a number and its value, would crowd its start:
  // their callouts sit above and below it instead, in turn.
  const roots = found.filter(isRoot).length;
  let stacked = 0;
  const placed = found.map((part): Placed => {
    const { number, box, corners, inline, edge, region } = part;
    const root = isRoot(part);
    if (root && roots > 1) {
      const side: Side = stacked++ % 2 ? 'bottom' : 'top';
      return { number, box, corners, root, side, at: null, edge, region, options: [] };
    }
    // The nearest side whose line reaches out clear of the other parts, with the sides above and
    // below preferred by a few pixels.
    const distances = (
      [
        ['top', box.top - reachOuter.top],
        ['bottom', reachOuter.bottom - box.bottom],
        ['left', box.left - reachOuter.left + 6],
        ['right', reachOuter.right - box.right + 6],
      ] as [Side, number][]
    )
      .filter(
        ([side], _, sides) =>
          !blocked(avoid, side, box) || sides.every(([other]) => blocked(avoid, other, box)),
      )
      .map(([side, distance]): [Side, number] => [
        side,
        distance + (root || clearAt(layout, side, box) !== null ? 0 : 1000),
      ]);
    // A root that follows text, such as a time in a sentence, takes its callout above it, clear of
    // the words before it.
    let side: Side = root
      ? inline
        ? 'top'
        : geometry.rtl
          ? 'right'
          : 'left'
      : distances.reduce((best, entry) => (entry[1] < best[1] ? entry : best))[0];
    // A part that holds others called out, as a strip holds its tabs, sits below them where it is
    // as near below as above, so the callouts of a row of parts don't all crowd its top.
    const holds = found.some((other) => other.number !== number && inside(box, other.box));
    const below = distances.find(([name]) => name === 'bottom');
    const above = distances.find(([name]) => name === 'top');
    if (side === 'top' && !root && holds && below && above && Math.abs(below[1] - above[1]) < 1)
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

/**
 * One side for each of two parts where one holds the other, such as a select's trigger and its
 * value: their lines would run side by side, the inner one bent across the outer one's edge. The
 * outer part moves to its nearest other side that is clear, holds neither and lies just past its
 * edge, so its line crosses nothing else of the component, such as a list's other rows.
 */
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

/** The callouts of the parts on one side: their badges spread along it, each with its line. */
function calloutsAlong(side: Side, items: Placed[], { geometry, reachOuter }: Layout): Callout[] {
  const vertical = side === 'top' || side === 'bottom';
  const centre = (box: Box) => (vertical ? (box.left + box.right) / 2 : (box.top + box.bottom) / 2);
  const extent = vertical ? geometry.width : geometry.height;
  // The root's callout sits by its top corner, above its parts' on its side, rather than halfway
  // down, where a tall component's own parts, such as a card's content, take theirs.
  const parts = items.filter(({ root }) => !root).map(({ box }) => centre(box));
  const along = spread(
    items.map(({ box, root, at }) =>
      root && !vertical
        ? Math.min(centre(box), box.top + rootInset, Math.min(...parts) - spacing)
        : (at ?? centre(box)),
    ),
    badgeSize / 2 + 2,
    extent - badgeSize / 2 - 2,
  );
  return items.map(({ number, box: part, corners: partCorners, root, edge, region }, index) => {
    const at = along[index]!;
    // A part with an edge of its own takes the dot on that edge, round its corners; text, an icon
    // or a region takes it a little off, where a region's outline runs.
    const own = root || edge;
    const box = own ? part : fenced(part);
    const corners = own ? partCorners : square;
    const clamp = (value: number, low: number, high: number) =>
      Math.min(Math.max(value, low + 2), Math.max(high - 2, low + 2));
    const badge =
      side === 'top'
        ? { x: at, y: reachOuter.top - reach }
        : side === 'bottom'
          ? { x: at, y: reachOuter.bottom + reach }
          : side === 'left'
            ? { x: reachOuter.left - reach, y: at }
            : { x: reachOuter.right + reach, y: at };
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

/** The room, in px, a variants figure's names take beside its items: on the start side or above. */
export interface Room {
  start: number;
  bottom: number;
  end?: number;
  /** In a variants figure, whether what each variant is for sits under its item. */
  under?: boolean;
}

/** How far a variant's name stands off its item, in px, and the height of its line of text. */
const nameGap = 16;
const nameHeight = 20;

/** The most and the least room, in rem, what a variant is for takes beside its item. */
const useMeasure = 28;
const useLeast = 12;
/** How far what a variant is for stands under its item, and off the next, in px. */
const useGap = 6;
/** The least room, in rem, what a variant is for takes under its item. */
const underLeast = 10;

/** One item of a variants figure, as measured (variantGeometry). */
export interface VariantItem {
  /** Its legend item's number, from 1, and the variant's name. */
  number: number;
  label: string;
  box: Box;
  /**
   * The room an earlier measure set above it for what the item before it is for, under that one
   * (`data-catalogue-spread`), in px.
   */
  added: number;
}

/** A variants figure's subject as measured (variantGeometry). */
export interface VariantGeometry {
  /** The stage's width, the room inside its padding, and its padding on the start side. */
  width: number;
  inner: number;
  paddingStart: number;
  /** The px in a rem, and whether the stage reads right to left. */
  rem: number;
  rtl: boolean;
  items: VariantItem[];
}

/** The size, in px, of what a variant is for, wrapped at the room it is given. */
export interface UseSize {
  width: number;
  height: number;
}

/** A variants figure's items in order down the stage, where they stand one under another. */
export function stackedItems(items: VariantItem[]) {
  // One under another where no two items share a line.
  const sorted = [...items].sort((a, b) => a.box.top - b.box.top);
  const stacked = sorted.every(
    (item, index) => index === 0 || item.box.top >= sorted[index - 1]!.box.bottom - 1,
  );
  return stacked ? sorted : null;
}

/**
 * Items side by side take their names under them, spread so that none overlaps the next, `widths`
 * being their names' widths.
 */
export function variantsInRow(items: VariantItem[], widths: number[]) {
  const outer = around(items.map(({ box }) => box));
  const order = items
    .map((_, index) => index)
    .sort((a, b) => items[a]!.box.left - items[b]!.box.left);
  const centres = order.map((index) => (items[index]!.box.left + items[index]!.box.right) / 2);
  for (let rank = 1; rank < order.length; rank++)
    centres[rank] = Math.max(
      centres[rank]!,
      centres[rank - 1]! + (widths[order[rank - 1]!]! + widths[order[rank]!]!) / 2 + 12,
    );
  const callouts: Callout[] = order.map((index, rank) => {
    const { number, label } = items[index]!;
    const point = { x: centres[rank]!, y: outer.bottom + nameGap / 2 };
    return { number, index: number - 1, label, side: 'bottom', badge: point, anchor: point };
  });
  return {
    callouts: callouts.sort((a, b) => a.number - b.number),
    room: { start: 0, bottom: Math.ceil(nameHeight + nameGap / 2) },
  };
}

/** The room the variants' names take on the start side, by their widths. */
export const nameRoom = (widths: number[]) => Math.ceil(Math.max(...widths) + nameGap);

/**
 * Where items stand one under another, their names take `start` on the start side. What each
 * variant is for goes beside its item on the other side, in the room left there, at most a readable
 * measure: none where that is less than `useLeast`. Else it goes under its item, under the items'
 * column (`column`) where that has the room and else from the names' start: none where the stage
 * has less than `underLeast`.
 */
export function roomsForUses(geometry: VariantGeometry, start: number) {
  const { inner, rem, items } = geometry;
  const outer = around(items.map(({ box }) => box));
  const across = Math.floor(
    Math.min(useMeasure * rem, inner - start - (outer.right - outer.left) - nameGap),
  );
  const column = inner - start >= underLeast * rem;
  return {
    beside: across >= useLeast * rem ? across : null,
    column,
    under:
      inner >= underLeast * rem
        ? Math.floor(Math.min(useMeasure * rem, column ? inner - start : inner))
        : null,
  };
}

/**
 * Whether what each variant is for, at its size, fits beside its item: each centred on its item's
 * line, clear of the next one's. The room an earlier measure set above an item is left out, so the
 * choice is made on the items' own spacing and never flips.
 */
export function fitsBeside(sorted: VariantItem[], items: VariantItem[], sizes: UseSize[]) {
  let shift = 0;
  const rows = sorted.map((item) => {
    shift += item.added;
    return {
      centre: (item.box.top + item.box.bottom) / 2 - shift,
      height: sizes[items.indexOf(item)]?.height ?? 0,
    };
  });
  return rows.every(
    (row, index) =>
      index === 0 ||
      row.centre - rows[index - 1]!.centre >= (row.height + rows[index - 1]!.height) / 2 + 4,
  );
}

/**
 * The room, in px, each item in order down the stage stands further from the one before, so what
 * that one is for shows under it: none where those don't go under their items.
 */
export const spreadAbove = (sorted: VariantItem[], items: VariantItem[], under?: UseSize[]) =>
  sorted.map((item, rank) => {
    const before = rank > 0 && under?.[items.indexOf(sorted[rank - 1]!)];
    return before ? Math.ceil(before.height + 2 * useGap) : 0;
  });

/**
 * Places each variant's name beside its item, on the start side, and what each is for beside it on
 * the other side (`beside`) or under it (`under`), as decided; returns the room they take.
 */
export function stackedVariants(
  geometry: VariantGeometry,
  sorted: VariantItem[],
  start: number,
  lines: (string[] | undefined)[],
  uses: { beside?: UseSize[]; under?: UseSize[]; column: boolean },
): { callouts: Callout[]; room: Room; beside: boolean } {
  const { items, rtl } = geometry;
  const { beside, under } = uses;
  const side: Side = rtl ? 'right' : 'left';
  const outer = around(items.map(({ box }) => box));
  const end = beside && Math.ceil(Math.max(...beside.map(({ width }) => width)) + nameGap);
  const innerStart = geometry.paddingStart + (uses.column ? start : 0);
  const callouts = items.map(({ number, box, label }, index): Callout => {
    const y = (box.top + box.bottom) / 2;
    const x = side === 'left' ? outer.left - nameGap : outer.right + nameGap;
    const use = beside
      ? {
          lines: lines[index]!,
          width: beside[index]!.width,
          x: side === 'left' ? outer.right + nameGap : outer.left - nameGap,
          y,
          side: side === 'left' ? ('right' as const) : ('left' as const),
        }
      : under
        ? {
            lines: lines[index]!,
            width: under[index]!.width,
            x: rtl ? geometry.width - innerStart : innerStart,
            y: box.bottom + useGap,
            side: 'bottom' as const,
          }
        : undefined;
    return { number, index: number - 1, label, side, badge: { x, y }, anchor: { x, y }, use };
  });
  const last = sorted.at(-1)!;
  return {
    callouts,
    room: under
      ? { start, bottom: Math.ceil(under[items.indexOf(last)]!.height + useGap), under: true }
      : { start, bottom: 0, end: beside ? end : 0 },
    beside: beside !== undefined || under !== undefined,
  };
}
