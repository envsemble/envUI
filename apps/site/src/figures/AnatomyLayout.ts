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
  /** Its number, in the order the figure is read: by rows, from the top, each from the start. */
  number: number;
  /** The legend item it calls out, from 0. */
  index: number;
  /** A variants figure's callout: the variant's name, and the side of its item it sits on. */
  label?: string;
  side?: Side;
  badge: { x: number; y: number };
  anchor: { x: number; y: number };
  /** The part's box, outlined; the root's is not. */
  box?: { x: number; y: number; width: number; height: number };
  /** Where the outline gives way, so it doesn't strike through a label it crosses. */
  gaps?: { x: number; y: number; width: number; height: number }[];
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
/** How far a part's box stands off the part, in px, so it never runs through its text. */
const fencePadding = 3;

/** A part's box grown by the fence's padding on every side. */
const fenced = (box: Box): Box => ({
  left: box.left - fencePadding,
  top: box.top - fencePadding,
  right: box.right + fencePadding,
  bottom: box.bottom + fencePadding,
});

/** The corners of a part's box, which is square. */
const square: Corners = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

/**
 * Whether an element is only text, such as a label or a description, with no fill or edge of its
 * own: its box is then its text's, as an outline around the whole box would run through what lies
 * beside the text, such as a field's prefix under its floated label.
 */
function holdsText(element: Element) {
  if (!element.textContent?.trim()) return false;
  const style = getComputedStyle(element);
  if (parseFloat(style.borderTopWidth) || parseFloat(style.borderBottomWidth)) return false;
  if (!/[,/]\s*0\)$|^transparent$/.test(style.backgroundColor)) return false;
  return [...element.children].every((child) =>
    getComputedStyle(child).display.startsWith('inline'),
  );
}

/** The box of a part, or of its own text, relative to the stage. */
function boxOf(element: Element, text: boolean, origin: DOMRect): Box | undefined {
  let rects: DOMRect[] = [element.getBoundingClientRect()];
  if (!text && holdsText(element)) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const own = range.getBoundingClientRect();
    // A field's text, such as a textarea's, lays out no nodes of its own: its box stays.
    if (own.width && own.height) rects = [own];
  } else if (text) {
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

/** The boxes of the labels that show in the subject, relative to the stage. */
function labelBoxes(subject: Element, origin: DOMRect): Box[] {
  return [...subject.querySelectorAll('label')].flatMap((label) => {
    const rect = label.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1 ? [boxOf(label, false, origin)!] : [];
  });
}

/**
 * Where a part's outline gives way: across the labels its edge runs through, such as a field's
 * label floated into its outline, which the outline would otherwise strike through. A label
 * wholly inside the box, or the part itself, leaves the outline whole.
 */
function gapsIn(box: Box, labels: Box[]) {
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
            element,
            box,
            corners: cornersOf(element, text, box),
            inline: followsText(element),
          },
        ]
      : [];
  });
  if (!found.length) return [];
  const labelled = labelBoxes(subject, origin);
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
  // The root fills the component, or holds every other part, as a field holds its label floated
  // above its own box.
  const isRoot = (box: Box, element?: Element) =>
    (box.left - outer.left < 1 &&
      box.top - outer.top < 1 &&
      outer.right - box.right < 1 &&
      outer.bottom - box.bottom < 1) ||
    (element !== undefined &&
      found.length > 1 &&
      found.every((other) => other.element === element || element.contains(other.element)));
  // Parts that all fill the component, such as a number and its value, would crowd its start:
  // their callouts sit above and below it instead, in turn.
  const roots = found.filter(({ box, element }) => isRoot(box, element)).length;
  const inside = (outerBox: Box, innerBox: Box) =>
    innerBox.left >= outerBox.left - 0.5 &&
    innerBox.right <= outerBox.right + 0.5 &&
    innerBox.top >= outerBox.top - 0.5 &&
    innerBox.bottom <= outerBox.bottom + 0.5;
  /**
   * Where along a side a straight line from the part reaches out past the others, nearest its
   * middle: clear of the parts and labels on the way, but those around it or inside it, which its
   * line crosses whatever it does. Null where every line from it would cross one.
   */
  const clearAt = (side: Side, box: Box) => {
    const vertical = side === 'top' || side === 'bottom';
    const others = [...found.map((other) => other.box), ...labelled].filter(
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
      vertical ? [other.left - 6, other.right + 6] : [other.top - 6, other.bottom + 6];
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
  };
  let stacked = 0;
  const placed = found.map(({ number, element, box, corners, inline }) => {
    const root = isRoot(box, element);
    if (root && roots > 1) {
      const side: Side = stacked++ % 2 ? 'bottom' : 'top';
      return { number, box, corners, root, side, at: null };
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
        ([side], _, all) => !blocked(side, box) || all.every(([other]) => blocked(other, box)),
      )
      .map(([side, distance]): [Side, number] => [
        side,
        distance + (root || clearAt(side, box) !== null ? 0 : 1000),
      ]);
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
      at: root ? null : clearAt(side, box),
    };
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
      items.map(({ box, root, at }) =>
        root && !vertical
          ? Math.min(centre(box), box.top + rootInset, Math.min(...parts) - spacing)
          : (at ?? centre(box)),
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
        index: number - 1,
        badge,
        anchor,
        box: root
          ? undefined
          : { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top },
        gaps: root ? undefined : gapsIn(box, labelled),
      });
    });
  }
  return inReadingOrder(callouts, rtl);
}

/**
 * Numbers the callouts in the order the figure is read: by rows of badges from the top, and along
 * each row from the start, so the numbers go round the component rather than jump about it.
 */
function inReadingOrder(callouts: Callout[], rtl: boolean) {
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

/** The room, in px, a variants figure's names take beside its items: on the start side or above. */
export interface Room {
  start: number;
  bottom: number;
}

/** How far a variant's name stands off its item, in px, and the height of its line of text. */
const nameGap = 16;
const nameHeight = 20;

/**
 * The names' widths in px, as the figure sets them, measured off-screen in the stage, or kept in
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
      probe.className = 'catalogue-variant-label';
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
 * Places each variant's name by the item it names: the item a legend item's part names, or else the
 * example's items in the legend's order. Items one under another take their names on the start
 * side, items side by side under them: plain text, with no line or outline, as a picture's labels
 * are. Returns the room the names need, which the subject keeps free.
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
  if (!found.length) return { callouts: [], room: { start: 0, bottom: 0 } };
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
  // One under another where no two items share a line.
  const sorted = [...found].sort((a, b) => a.box.top - b.box.top);
  const stacked = sorted.every(
    (item, index) => index === 0 || item.box.top >= sorted[index - 1].box.bottom - 1,
  );
  if (stacked) {
    const side: Side = rtl ? 'right' : 'left';
    const callouts = found.map(({ number, box, label }) => {
      const y = (box.top + box.bottom) / 2;
      const x = side === 'left' ? outer.left - nameGap : outer.right + nameGap;
      return { number, index: number - 1, label, side, badge: { x, y }, anchor: { x, y } };
    });
    return { callouts, room: { start: Math.ceil(Math.max(...widths) + nameGap), bottom: 0 } };
  }
  // Side by side: the names under them, spread so that none overlaps the next.
  const order = found
    .map((_, index) => index)
    .sort((a, b) => found[a].box.left - found[b].box.left);
  const centres = order.map((index) => (found[index].box.left + found[index].box.right) / 2);
  for (let rank = 1; rank < order.length; rank++)
    centres[rank] = Math.max(
      centres[rank],
      centres[rank - 1] + (widths[order[rank - 1]] + widths[order[rank]]) / 2 + 12,
    );
  const callouts = order.map((index, rank) => {
    const { number, label } = found[index];
    const point = { x: centres[rank], y: outer.bottom + nameGap / 2 };
    return {
      number,
      index: number - 1,
      label,
      side: 'bottom' as const,
      badge: point,
      anchor: point,
    };
  });
  return {
    callouts: callouts.sort((a, b) => a.number - b.number),
    room: { start: 0, bottom: Math.ceil(nameHeight + nameGap / 2) },
  };
}
