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
  /**
   * In a variants figure whose items stand one under another, what the variant is for, beside its
   * item on the other side from its name, where every item's fits (measureVariants): its lines,
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

/**
 * Whether an element draws an edge of its own: a fill, a border or a shadow, on itself or on a
 * pseudo-element, as a segmented control's outline is drawn.
 */
function hasEdge(element: Element) {
  return [null, '::before', '::after'].some((pseudo) => {
    const style = getComputedStyle(element, pseudo);
    if (pseudo && (style.content === 'none' || style.display === 'none')) return false;
    const border = ['top', 'right', 'bottom', 'left'].some(
      (side) =>
        parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
        style.getPropertyValue(`border-${side}-style`) !== 'none',
    );
    const fill =
      !/[,/]\s*0\)$|^transparent$/.test(style.backgroundColor) || style.backgroundImage !== 'none';
    return border || fill || style.boxShadow !== 'none';
  });
}

/** Whether an element has text of its own, outside its child elements. */
const ownText = (element: Element) =>
  [...element.childNodes].some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );

/**
 * What shows of a part: the part, or where it is only a frame around one thing, with no edge or
 * text of its own, that thing, as an icon's slot holds its icon, so the callout meets what shows.
 */
function drawnPart(element: Element): Element {
  let drawn = element;
  while (drawn.children.length === 1 && !ownText(drawn) && !hasEdge(drawn))
    drawn = drawn.children[0]!;
  return drawn;
}

/**
 * The box of a text input's value, as drawn: the input's own box spans its field, wider than the
 * words in it. Undefined for an empty input or one of another kind.
 */
function valueBox(element: Element, origin: DOMRect): Box | undefined {
  if (!(element instanceof HTMLInputElement) || !element.value) return undefined;
  if (!/^(?:text|search|url|email|tel|number)$/.test(element.type)) return undefined;
  const style = getComputedStyle(element);
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return undefined;
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const rect = element.getBoundingClientRect();
  // Drawn larger or smaller than laid out, as an enlarged figure's subject is.
  const scale = element.offsetWidth ? rect.width / element.offsetWidth : 1;
  const start = (parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth)) * scale;
  const end = (parseFloat(style.paddingRight) + parseFloat(style.borderRightWidth)) * scale;
  const width = Math.min(
    context.measureText(element.value).width * scale,
    rect.width - start - end,
  );
  const height = parseFloat(style.fontSize) * 1.25 * scale;
  const left = style.direction === 'rtl' ? rect.right - end - width : rect.left + start;
  const top = rect.top + (rect.height - height) / 2;
  return {
    left: left - origin.left,
    top: top - origin.top,
    right: left + width - origin.left,
    bottom: top + height - origin.top,
  };
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
 * part is nearest to, the root at the start, with a line to what shows of the part, and a region's
 * box outlined. A part that only frames the others, with no edge of its own, such as a field
 * around its label and control, and a part of the same box as that frame, such as the control,
 * take no callout: the legend names them alone (`whole`, by their legend items). In a figure of an
 * open popup, the callouts keep clear of what opens it, such as a select's field: no callout sits
 * over it, or reaches a part across it.
 */
export function measure(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
): { callouts: Callout[]; whole: number[] } {
  const origin = stage.getBoundingClientRect();
  const rtl = getComputedStyle(stage).direction === 'rtl';
  const all = legend.flatMap((item, index) => {
    const { selector, text } = partSelector(item.part);
    let element: Element | null;
    try {
      element = subject.querySelector(selector);
    } catch {
      // A reference that is no selector numbers nothing; the legend still lists it.
      return [];
    }
    if (!element) return [];
    const drawn = text ? element : drawnPart(element);
    const box = (!text && valueBox(drawn, origin)) || boxOf(drawn, text, origin);
    const textual = text || drawn instanceof HTMLInputElement || holdsText(drawn);
    const edge = !textual && hasEdge(drawn);
    return box
      ? [
          {
            number: index + 1,
            element,
            text,
            box,
            corners: cornersOf(drawn, text, box),
            inline: followsText(element),
            edge,
            // A region: no edge or shape of its own, around several things that show.
            region:
              !edge &&
              !textual &&
              !(drawn instanceof SVGElement) &&
              [...drawn.children].filter((child) => {
                const rect = child.getBoundingClientRect();
                return rect.width > 1 && rect.height > 1;
              }).length > 1,
            // One of several alike, such as a list's row.
            repeated: subject.querySelectorAll(selector).length > 1,
          },
        ]
      : [];
  });
  const sameBox = (a: Box, b: Box) =>
    Math.abs(a.left - b.left) < 2 &&
    Math.abs(a.top - b.top) < 2 &&
    Math.abs(a.right - b.right) < 2 &&
    Math.abs(a.bottom - b.bottom) < 2;
  const holds = (part: (typeof all)[number]) =>
    all.filter((other) => other !== part && part.element.contains(other.element));
  // The parts the legend names alone, as their callouts would point at the edges of the parts
  // inside them: the outermost frame around several others, with no edge of its own, such as a
  // field around its label and control; and inside it, a part of its box, or the one part as wide
  // as it that holds several others, such as that control around its icon, prefix and input, but
  // not a list's row.
  const frames = all.filter(
    (part) =>
      !hasEdge(part.element) &&
      holds(part).length > 1 &&
      !all.some((other) => other !== part && other.element.contains(part.element)),
  );
  const whole = all.filter(
    (part) =>
      frames.includes(part) ||
      frames.some(
        (frame) =>
          frame.element.contains(part.element) &&
          (sameBox(frame.box, part.box) ||
            (holds(part).length > 1 &&
              !part.repeated &&
              Math.abs(frame.box.left - part.box.left) < 2 &&
              Math.abs(frame.box.right - part.box.right) < 2)),
      ),
  );
  const found = all.filter((part) => !whole.includes(part));
  const wholeItems = whole.map(({ number }) => number - 1);
  if (!found.length) return { callouts: [], whole: wholeItems };
  const labelled = labelBoxes(subject, origin);
  // The whole component, the parts the legend names alone included: the callouts sit outside it.
  const outer: Box = {
    left: Math.min(...all.map(({ box }) => box.left)),
    top: Math.min(...all.map(({ box }) => box.top)),
    right: Math.max(...all.map(({ box }) => box.right)),
    bottom: Math.max(...all.map(({ box }) => box.bottom)),
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
  // above its own box. A part that is the text of an element, such as a button's label, is never
  // the root, though its element holds the others.
  const isRoot = (box: Box, element?: Element, text = false) =>
    (box.left - outer.left < 1 &&
      box.top - outer.top < 1 &&
      outer.right - box.right < 1 &&
      outer.bottom - box.bottom < 1) ||
    (element !== undefined &&
      !text &&
      found.length > 1 &&
      found.every((other) => other.element === element || element.contains(other.element)));
  // Parts that all fill the component, such as a number and its value, would crowd its start:
  // their callouts sit above and below it instead, in turn.
  const roots = found.filter(({ box, element, text }) => isRoot(box, element, text)).length;
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
  };
  let stacked = 0;
  const placed = found.map(({ number, element, text, box, corners, inline, edge, region }) => {
    const root = isRoot(box, element, text);
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
      edge,
      region,
      options: distances,
    };
  });
  // One side for each of two parts where one holds the other, such as a select's trigger and its
  // value: their lines would run side by side, the inner one bent across the outer one's edge.
  // The outer part moves to its nearest other side that is clear, holds neither and lies just past
  // its edge, so its line crosses nothing else of the component, such as a list's other rows.
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
    item.at = clearAt(next[0], item.box);
  }
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
    items.forEach(({ number, box: part, corners: partCorners, root, edge, region }, index) => {
      const at = along[index];
      // A part with an edge of its own takes the dot on that edge, round its corners; text, an
      // icon or a region takes it a little off, where a region's outline runs.
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
      callouts.push({
        number,
        index: number - 1,
        badge,
        anchor,
        box:
          root || !region
            ? undefined
            : {
                x: box.left,
                y: box.top,
                width: box.right - box.left,
                height: box.bottom - box.top,
              },
        gaps: root || !region ? undefined : gapsIn(box, labelled),
      });
    });
  }
  return { callouts: inReadingOrder(callouts, rtl), whole: wholeItems };
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
  end?: number;
}

/** How far a variant's name stands off its item, in px, and the height of its line of text. */
const nameGap = 16;
const nameHeight = 20;

/** The most and the least room, in rem, what a variant is for takes beside its item. */
const useMeasure = 28;
const useLeast = 12;

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
 * The sizes in px of what each variant is for, as the figure sets them, each wrapped at `room`,
 * measured as the names are (labelWidths).
 */
function sizesOfUses(
  stage: HTMLElement,
  uses: string[][],
  room: number,
  known: Map<string, number>,
) {
  const rem = getComputedStyle(document.documentElement).fontSize;
  const keyOf = (lines: string[], axis: string) => `${rem} ${room} ${axis} ${lines.join('|')}`;
  const missing = uses.filter((lines) => !known.has(keyOf(lines, 'width')));
  if (missing.length) {
    const probes = missing.map((lines) => {
      const probe = document.createElement('span');
      probe.className = 'catalogue-variant-use';
      probe.style.visibility = 'hidden';
      probe.style.maxInlineSize = `${room}px`;
      for (const line of lines)
        probe.append(Object.assign(document.createElement('span'), { textContent: line }));
      return probe;
    });
    stage.append(...probes);
    probes.forEach((probe, index) => {
      const box = probe.getBoundingClientRect();
      known.set(keyOf(missing[index]!, 'width'), Math.ceil(box.width));
      known.set(keyOf(missing[index]!, 'height'), box.height);
    });
    for (const probe of probes) probe.remove();
  }
  return uses.map((lines) => ({
    width: known.get(keyOf(lines, 'width'))!,
    height: known.get(keyOf(lines, 'height'))!,
  }));
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
  /** What each legend item's variant is for, in lines, from the option table after the figure. */
  uses?: (string[] | undefined)[],
): { callouts: Callout[]; room: Room; beside?: boolean } {
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
    const start = Math.ceil(Math.max(...widths) + nameGap);
    // What each variant is for goes beside its item, on the other side, where every item has one
    // and each fits the room between its item's line and the next, and the stage's width.
    const lines = found.map(({ number }) => uses?.[number - 1]);
    const style = getComputedStyle(stage);
    const inner =
      stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    // The room beside the items, at most a readable measure.
    const across = Math.floor(
      Math.min(useMeasure * rem, inner - start - (outer.right - outer.left) - nameGap),
    );
    const sizes =
      across >= useLeast * rem && lines.every((entry) => entry?.length)
        ? sizesOfUses(stage, lines as string[][], across, labels)
        : undefined;
    // Each centred on its item's line, clear of the next one's.
    const rows = sorted.map((item) => ({
      centre: (item.box.top + item.box.bottom) / 2,
      height: sizes?.[found.indexOf(item)]?.height ?? 0,
    }));
    const clear = rows.every(
      (row, index) =>
        index === 0 ||
        row.centre - rows[index - 1]!.centre >= (row.height + rows[index - 1]!.height) / 2 + 4,
    );
    const end = sizes && Math.ceil(Math.max(...sizes.map(({ width }) => width)) + nameGap);
    const beside = sizes !== undefined && end !== undefined && clear;
    const callouts = found.map(({ number, box, label }, index) => {
      const y = (box.top + box.bottom) / 2;
      const x = side === 'left' ? outer.left - nameGap : outer.right + nameGap;
      const use = beside
        ? {
            lines: lines[index]!,
            width: sizes![index]!.width,
            x: side === 'left' ? outer.right + nameGap : outer.left - nameGap,
            y,
            side: side === 'left' ? ('right' as const) : ('left' as const),
          }
        : undefined;
      return { number, index: number - 1, label, side, badge: { x, y }, anchor: { x, y }, use };
    });
    return { callouts, room: { start, bottom: 0, end: beside ? end : 0 }, beside };
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
