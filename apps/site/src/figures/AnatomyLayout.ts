/*
 * Where an anatomy figure's callouts sit (AnatomyFigure.tsx): a numbered one on each part, on the
 * side it is nearest to, spread so none overlap; for a variants figure, each variant's name beside
 * its item, with the room the names take.
 */
import type { AnatomyLegendItem } from '../shared/DocumentationTypes';
import { partSelector } from '../template/Parts';
import { openerBox } from './OpenExample';

/** A callout's number, where it sits and the part it points at, in the stage's coordinates. */
export interface Callout {
  number: number;
  /** A variants figure's callout: the variant's name, and the side of its item it sits on. */
  label?: string;
  side?: Side;
  badge: { x: number; y: number };
  anchor: { x: number; y: number };
  /** The part's box, outlined; the root's is not. */
  box?: { x: number; y: number; width: number; height: number };
}

type Side = 'top' | 'bottom' | 'left' | 'right';
interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** How far outside the component a callout's badge sits, and the badges' diameter, in px. */
const reach = 28;
const badgeSize = 24;
/** The least distance between two badges' centres on one side. */
const spacing = badgeSize + 4;
/** How far below its top the root's callout points, at most: past a large corner's curve. */
const rootInset = 32;
/** How far a part's dashed box stands off the part, in px, so it never runs through its text. */
const fencePadding = 3;

/** A part's box grown by the fence's padding on every side. */
const fenced = (box: Box): Box => ({
  left: box.left - fencePadding,
  top: box.top - fencePadding,
  right: box.right + fencePadding,
  bottom: box.bottom + fencePadding,
});

/** The corners of a part's dashed box, which is square. */
const square: Corners = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

/** The box of a part, or of its own text, relative to the stage. */
function boxOf(element: Element, text: boolean, origin: DOMRect): Box | undefined {
  let rects: DOMRect[] = [element.getBoundingClientRect()];
  if (text) {
    rects = [];
    for (const node of element.childNodes)
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        rects.push(range.getBoundingClientRect());
      }
  }
  rects = rects.filter((rect) => rect.width || rect.height);
  if (!rects.length) return undefined;
  return {
    left: Math.min(...rects.map((rect) => rect.left)) - origin.left,
    top: Math.min(...rects.map((rect) => rect.top)) - origin.top,
    right: Math.max(...rects.map((rect) => rect.right)) - origin.left,
    bottom: Math.max(...rects.map((rect) => rect.bottom)) - origin.top,
  };
}

/** A part's corner radii, in px, as drawn: none for the text of a part. */
interface Corners {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

function cornersOf(element: Element, text: boolean, box: Box): Corners {
  const style = getComputedStyle(element);
  const most = Math.min(box.right - box.left, box.bottom - box.top) / 2;
  const radius = (value: string) => (text ? 0 : Math.min(parseFloat(value) || 0, most));
  return {
    topLeft: radius(style.borderTopLeftRadius),
    topRight: radius(style.borderTopRightRadius),
    bottomLeft: radius(style.borderBottomLeftRadius),
    bottomRight: radius(style.borderBottomRightRadius),
  };
}

/**
 * How far in from its box's side a part's edge is at `along` past the box's start on that side, by
 * the corners at either end of the side: a callout that meets a rounded part near its corner
 * meets its curve, not the empty corner of its box.
 */
function cornerInset(along: number, length: number, start: number, end: number) {
  const curve = (radius: number, from: number) =>
    from < radius ? radius - Math.sqrt(radius ** 2 - (radius - from) ** 2) : 0;
  return Math.max(curve(start, along), curve(end, length - along));
}

/** Spreads positions along one side so badges never overlap, within `min` and `max`. */
function spread(positions: number[], min: number, max: number) {
  const order = positions.map((_, index) => index).sort((a, b) => positions[a] - positions[b]);
  const placed = order.map((index) => positions[index]);
  for (let index = 1; index < placed.length; index++)
    placed[index] = Math.max(placed[index], placed[index - 1] + spacing);
  if (placed.length) placed[placed.length - 1] = Math.min(placed.at(-1)!, max);
  for (let index = placed.length - 2; index >= 0; index--)
    placed[index] = Math.min(placed[index], placed[index + 1] - spacing);
  if (placed.length) placed[0] = Math.max(placed[0], min);
  const result = [...positions];
  order.forEach((index, rank) => (result[index] = placed[rank]));
  return result;
}

/** Whether an element comes after text in its line, such as a time inside a sentence. */
function followsText(element: Element) {
  for (let node = element.previousSibling; node; node = node.previousSibling)
    if (node.textContent?.trim()) return true;
  return false;
}

/**
 * Places a numbered callout on each part found in the subject: on the side of the component the
 * part is nearest to, the root at the start, with a line to the part and its box outlined. In a
 * figure of an open popup, the callouts keep clear of what opens it, such as a select's field: no
 * callout sits over it, or reaches a part across it.
 */
export function measure(stage: HTMLElement, subject: HTMLElement, legend: AnatomyLegendItem[]) {
  const origin = stage.getBoundingClientRect();
  const rtl = getComputedStyle(stage).direction === 'rtl';
  const found = legend.flatMap((item, index) => {
    const { selector, text } = partSelector(item.part);
    let element: Element | null;
    try {
      element = subject.querySelector(selector);
    } catch {
      // A reference that is no selector numbers nothing; the legend still lists it.
      return [];
    }
    const box = element && boxOf(element, text, origin);
    return element && box
      ? [
          {
            number: index + 1,
            box,
            corners: cornersOf(element, text, box),
            inline: followsText(element),
          },
        ]
      : [];
  });
  if (!found.length) return [];
  const outer: Box = {
    left: Math.min(...found.map(({ box }) => box.left)),
    top: Math.min(...found.map(({ box }) => box.top)),
    right: Math.max(...found.map(({ box }) => box.right)),
    bottom: Math.max(...found.map(({ box }) => box.bottom)),
  };
  const opener = openerBox(subject);
  const avoid: Box | undefined = opener && {
    left: opener.left - origin.left,
    top: opener.top - origin.top,
    right: opener.right - origin.left,
    bottom: opener.bottom - origin.top,
  };
  // The callouts sit outside the parts and what opens them.
  const reachOuter: Box = avoid
    ? {
        left: Math.min(outer.left, avoid.left),
        top: Math.min(outer.top, avoid.top),
        right: Math.max(outer.right, avoid.right),
        bottom: Math.max(outer.bottom, avoid.bottom),
      }
    : outer;
  /** Whether what opens the popup lies between a part and a side. */
  const blocked = (side: Side, box: Box) => {
    if (!avoid) return false;
    const across = avoid.left < box.right && avoid.right > box.left;
    const along = avoid.top < box.bottom && avoid.bottom > box.top;
    if (side === 'top') return across && avoid.bottom <= box.top + 1;
    if (side === 'bottom') return across && avoid.top >= box.bottom - 1;
    if (side === 'left') return along && avoid.right <= box.left + 1;
    return along && avoid.left >= box.right - 1;
  };
  const isRoot = (box: Box) =>
    box.left - outer.left < 1 &&
    box.top - outer.top < 1 &&
    outer.right - box.right < 1 &&
    outer.bottom - box.bottom < 1;
  // Parts that all fill the component, such as a number and its value, would crowd its start:
  // their callouts sit above and below it instead, in turn.
  const roots = found.filter(({ box }) => isRoot(box)).length;
  let stacked = 0;
  const placed = found.map(({ number, box, corners, inline }) => {
    const root = isRoot(box);
    if (root && roots > 1) {
      const side: Side = stacked++ % 2 ? 'bottom' : 'top';
      return { number, box, corners, root, side };
    }
    // The nearest side, with the sides above and below preferred by a few pixels.
    const distances = (
      [
        ['top', box.top - reachOuter.top],
        ['bottom', reachOuter.bottom - box.bottom],
        ['left', box.left - reachOuter.left + 6],
        ['right', reachOuter.right - box.right + 6],
      ] as [Side, number][]
    ).filter(
      ([side], _, all) => !blocked(side, box) || all.every(([other]) => blocked(other, box)),
    );
    // A root that follows text, such as a time in a sentence, takes its callout above it, clear of
    // the words before it.
    let side: Side = root
      ? inline
        ? 'top'
        : rtl
          ? 'right'
          : 'left'
      : distances.reduce((best, entry) => (entry[1] < best[1] ? entry : best))[0];
    // A part that holds others called out, as a strip holds its tabs, sits below them where it is
    // as near below as above, so the callouts of a row of parts don't all crowd its top.
    const holds = found.some(
      (other) =>
        other.number !== number &&
        other.box.left >= box.left - 0.5 &&
        other.box.right <= box.right + 0.5 &&
        other.box.top >= box.top - 0.5 &&
        other.box.bottom <= box.bottom + 0.5,
    );
    const below = distances.find(([name]) => name === 'bottom');
    const above = distances.find(([name]) => name === 'top');
    if (side === 'top' && !root && holds && below && above && Math.abs(below[1] - above[1]) < 1)
      side = 'bottom';
    return { number, box, corners, root: root && !inline, side };
  });
  const callouts: Callout[] = [];
  for (const side of ['top', 'bottom', 'left', 'right'] as const) {
    const items = placed.filter((item) => item.side === side);
    const vertical = side === 'top' || side === 'bottom';
    const centre = (box: Box) =>
      vertical ? (box.left + box.right) / 2 : (box.top + box.bottom) / 2;
    const extent = vertical ? origin.width : origin.height;
    // The root's callout sits by its top corner, above its parts' on its side, rather than
    // halfway down, where a tall component's own parts, such as a card's content, take theirs.
    const parts = items.filter(({ root }) => !root).map(({ box }) => centre(box));
    const along = spread(
      items.map(({ box, root }) =>
        root && !vertical
          ? Math.min(centre(box), box.top + rootInset, Math.min(...parts) - spacing)
          : centre(box),
      ),
      badgeSize / 2 + 2,
      extent - badgeSize / 2 - 2,
    );
    items.forEach(({ number, box: part, corners: partCorners, root }, index) => {
      const at = along[index];
      // A part other than the root is outlined, a little off it: its line ends on the outline.
      const box = root ? part : fenced(part);
      const corners = root ? partCorners : square;
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
      callouts.push({
        number,
        badge,
        anchor,
        box: root
          ? undefined
          : { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top },
      });
    });
  }
  return callouts.sort((a, b) => a.number - b.number);
}

/** The room, in px, a variants figure's names take beside its items: on the start side or above. */
export interface Room {
  start: number;
  top: number;
}

/**
 * The names' widths in px, as their callouts draw them, measured off-screen in the stage, or kept in
 * `known` from an earlier measure: a name's width follows the root's font size and the fonts, not
 * the stage's width, and placing a probe in the stage restyles the whole example, which every
 * frame of a resize made it lag. Those still to measure are all placed before any is read, so the
 * browser lays out once for them all.
 */
function labelWidths(stage: HTMLElement, texts: string[], known: Map<string, number>) {
  const rem = getComputedStyle(document.documentElement).fontSize;
  const keyOf = (text: string) => `${rem} ${text}`;
  const missing = [...new Set(texts.filter((text) => !known.has(keyOf(text))))];
  if (missing.length) {
    const probes = missing.map((text) => {
      const probe = document.createElement('span');
      probe.className = 'site-anatomy-badge catalogue-variant-label';
      probe.style.visibility = 'hidden';
      probe.textContent = text;
      return probe;
    });
    stage.append(...probes);
    probes.forEach((probe, index) =>
      known.set(keyOf(missing[index]!), probe.getBoundingClientRect().width),
    );
    for (const probe of probes) probe.remove();
  }
  return texts.map((text) => known.get(keyOf(text))!);
}

/**
 * Places a callout with each variant's name on the item it labels: the item a legend item's part
 * names, or else the example's items in the legend's order. Items one under another take their
 * names on the start side, items side by side above them, each with a line to its item and its box
 * outlined. Returns the room the names need, which the subject keeps free.
 */
export function measureVariants(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
  /** The names' widths measured before, which the caller keeps until the fonts change. */
  labels: Map<string, number> = new Map(),
): { callouts: Callout[]; room: Room } {
  const origin = stage.getBoundingClientRect();
  const rtl = getComputedStyle(stage).direction === 'rtl';
  // The example's items: the children of its root, or of the wrapper the root holds alone, that
  // show, leaving out such as a select's hidden input.
  const shown = (element: Element) => {
    const box = element.getBoundingClientRect();
    return box.width > 1 && box.height > 1;
  };
  let root = subject.firstElementChild;
  while (root && [...root.children].filter(shown).length === 1 && legend.length > 1)
    root = [...root.children].find(shown) ?? null;
  const items = root ? [...root.children].filter(shown) : [];
  const found = legend.flatMap((item, index) => {
    let element: Element | null | undefined = items[index];
    if (item.part) {
      try {
        element = subject.querySelector(partSelector(item.part).selector);
      } catch {
        element = undefined;
      }
    }
    const box = element && boxOf(element, false, origin);
    return box ? [{ number: index + 1, box, label: item.label ?? '' }] : [];
  });
  if (!found.length) return { callouts: [], room: { start: 0, top: 0 } };
  const widths = labelWidths(
    stage,
    found.map(({ label }) => label),
    labels,
  );
  const outer: Box = {
    left: Math.min(...found.map(({ box }) => box.left)),
    top: Math.min(...found.map(({ box }) => box.top)),
    right: Math.max(...found.map(({ box }) => box.right)),
    bottom: Math.max(...found.map(({ box }) => box.bottom)),
  };
  const outline = (part: Box) => {
    const box = fenced(part);
    return { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top };
  };
  // One under another where no two items share a line.
  const sorted = [...found].sort((a, b) => a.box.top - b.box.top);
  const stacked = sorted.every(
    (item, index) => index === 0 || item.box.top >= sorted[index - 1].box.bottom - 1,
  );
  if (stacked) {
    const side: Side = rtl ? 'right' : 'left';
    const callouts = found.map(({ number, box, label }) => {
      const y = (box.top + box.bottom) / 2;
      return {
        number,
        label,
        side,
        badge: { x: side === 'left' ? outer.left - reach : outer.right + reach, y },
        anchor: { x: side === 'left' ? box.left - fencePadding : box.right + fencePadding, y },
        box: outline(box),
      };
    });
    return { callouts, room: { start: Math.ceil(Math.max(...widths) + reach + 8), top: 0 } };
  }
  // Side by side: the names above, spread so that none overlaps the next.
  const order = found
    .map((_, index) => index)
    .sort((a, b) => found[a].box.left - found[b].box.left);
  const centres = order.map((index) => (found[index].box.left + found[index].box.right) / 2);
  for (let rank = 1; rank < order.length; rank++)
    centres[rank] = Math.max(
      centres[rank],
      centres[rank - 1] + (widths[order[rank - 1]] + widths[order[rank]]) / 2 + 6,
    );
  const callouts = order.map((index, rank) => {
    const { number, box, label } = found[index];
    const x = centres[rank];
    return {
      number,
      label,
      side: 'top' as const,
      badge: { x, y: outer.top - reach },
      anchor: { x: Math.min(Math.max(x, box.left + 2), box.right - 2), y: box.top - fencePadding },
      box: outline(box),
    };
  });
  return {
    callouts: callouts.sort((a, b) => a.number - b.number),
    room: { start: 0, top: Math.ceil(badgeSize + reach) },
  };
}
