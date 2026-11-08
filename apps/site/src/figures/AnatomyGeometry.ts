/*
 * What an anatomy figure's callouts are placed by, measured in its stage (AnatomyLayout.ts): what
 * shows of each part a legend item names, its corners and edge, the labels in the subject, and in
 * a variants figure, its items and the room their names and uses take.
 */
import type { AnatomyLegendItem } from '../../../../scripts/docs/model/DocumentationTypes';
import { remPixels } from '../shared/Lengths';
import { partSelector } from '../template/Parts';
import { union, type Box } from '../fit/FitMath';
import type { AnatomyGeometry, Corners, Part, UseSize, VariantGeometry } from './AnatomyPlacement';
import { openerBox } from '../fit/OverlayRoom';

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
  const all = union(rects);
  return {
    left: all.left - origin.left,
    top: all.top - origin.top,
    right: all.right - origin.left,
    bottom: all.bottom - origin.top,
  };
}

/** The boxes of the labels that show in the subject, relative to the stage. */
function labelBoxes(subject: Element, origin: DOMRect): Box[] {
  return [...subject.querySelectorAll('label')].flatMap((label) => {
    const rect = label.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1 ? [boxOf(label, false, origin)!] : [];
  });
}

/** A part's corner radii, in px, as drawn: none for the text of a part. */
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

/** Whether an element comes after text in its line, such as a time inside a sentence. */
function followsText(element: Element) {
  for (let node = element.previousSibling; node; node = node.previousSibling)
    if (node.textContent?.trim()) return true;
  return false;
}

/** Whether an element holds more than one thing that shows. */
const holdsSeveral = (element: Element) =>
  [...element.children].filter((child) => {
    const rect = child.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  }).length > 1;

/**
 * The parts the legend names, as they show in the subject, in the stage's coordinates, with what
 * the callouts keep clear of: the labels in the subject and what opens a popup shown open.
 */
export function anatomyGeometry(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
): AnatomyGeometry {
  const origin = stage.getBoundingClientRect();
  const elements: Element[] = [];
  const parts = legend.flatMap((item, index): Part[] => {
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
    if (!box) return [];
    const textual = text || drawn instanceof HTMLInputElement || holdsText(drawn);
    const edge = !textual && hasEdge(drawn);
    if (!elements.includes(element)) elements.push(element);
    return [
      {
        number: index + 1,
        element: elements.indexOf(element),
        text,
        box,
        corners: cornersOf(drawn, text, box),
        inline: followsText(element),
        edge,
        ownEdge: hasEdge(element),
        region: !edge && !textual && !(drawn instanceof SVGElement) && holdsSeveral(drawn),
        repeated: subject.querySelectorAll(selector).length > 1,
      },
    ];
  });
  const opener = openerBox(subject);
  return {
    width: origin.width,
    height: origin.height,
    rtl: getComputedStyle(stage).direction === 'rtl',
    parts,
    contains: elements.map((outer) => elements.map((inner) => outer.contains(inner))),
    labels: labelBoxes(subject, origin),
    opener: opener && {
      left: opener.left - origin.left,
      top: opener.top - origin.top,
      right: opener.right - origin.left,
      bottom: opener.bottom - origin.top,
    },
  };
}

/** The room an earlier measure set above an item for what the item before it is for. */
const added = (element: Element) =>
  element instanceof HTMLElement && element.hasAttribute('data-catalogue-spread')
    ? parseFloat(element.style.marginBlockStart) || 0
    : 0;

/**
 * A variants figure's items, each with the variant's name: the item a legend item's part names,
 * or else the example's items in the legend's order, the children of its root, or of the wrapper
 * the root holds alone, that show, leaving out such as a select's hidden input.
 */
export function variantGeometry(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
): VariantGeometry & { elements: Element[] } {
  const origin = stage.getBoundingClientRect();
  const shown = (element: Element) => {
    const box = element.getBoundingClientRect();
    return box.width > 1 && box.height > 1;
  };
  let root = subject.firstElementChild;
  while (root && [...root.children].filter(shown).length === 1 && legend.length > 1)
    root = [...root.children].find(shown) ?? null;
  const children = root ? [...root.children].filter(shown) : [];
  const found = legend.flatMap((item, index) => {
    let element: Element | null | undefined = children[index];
    if (item.part) {
      try {
        element = subject.querySelector(partSelector(item.part).selector);
      } catch {
        element = undefined;
      }
    }
    const box = element && boxOf(element, false, origin);
    return box && element ? [{ number: index + 1, box, label: item.label ?? '', element }] : [];
  });
  const style = getComputedStyle(stage);
  const rtl = style.direction === 'rtl';
  return {
    width: stage.clientWidth,
    inner: stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
    paddingStart: parseFloat(rtl ? style.paddingRight : style.paddingLeft),
    rem: remPixels(),
    rtl,
    items: found.map(({ number, box, label, element }) => ({
      number,
      box,
      label,
      added: added(element),
    })),
    elements: found.map(({ element }) => element),
  };
}

/**
 * The names' widths in px, as the figure sets them, measured off-screen in the stage, or kept in
 * `known` from an earlier measure: a name's width follows the root's font size and the fonts, not
 * the stage's width, and placing a probe in the stage restyles the whole example, which every
 * frame of a resize made it lag. Those still to measure are all placed before any is read, so the
 * browser lays out once for them all.
 */
export function labelWidths(stage: HTMLElement, texts: string[], known: Map<string, number>) {
  const rem = remPixels();
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
export function sizesOfUses(
  stage: HTMLElement,
  uses: string[][],
  room: number,
  known: Map<string, number>,
): UseSize[] {
  const rem = remPixels();
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
 * Stands each item that much further from the one before (`data-catalogue-spread`), so what that
 * one is for shows under it, by its item, rather than again in a legend under the figure.
 */
export function spreadItems(elements: Element[], room: number[]) {
  elements.forEach((element, index) => {
    if (!(element instanceof HTMLElement)) return;
    const margin = room[index] ? `${room[index]}px` : '';
    if (margin) {
      if (element.style.marginBlockStart !== margin) element.style.marginBlockStart = margin;
      if (!element.hasAttribute('data-catalogue-spread'))
        element.setAttribute('data-catalogue-spread', '');
    } else if (element.hasAttribute('data-catalogue-spread')) {
      element.style.marginBlockStart = '';
      element.removeAttribute('data-catalogue-spread');
    }
  });
}
