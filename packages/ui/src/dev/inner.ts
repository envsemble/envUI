// What a node holds without being one, or does beyond its box: what scrolls and sticks, how far
// it reaches past its place, and text squeezed too narrow. measure reads it for the nodes, and for
// what is inside them when the readout asks.

import type { InnerData, NodeData, ScrollData, StickyData } from './model.js';
import { describeElement, isDevElement, labelFor, nearestNodeOf } from './elements.js';
import { pixelsOf } from '../internal/dom/lengths.js';

const scrollsAlong = (overflow: string) => overflow === 'auto' || overflow === 'scroll';

export function scrollOf(element: Element, style: CSSStyleDeclaration): ScrollData | null {
  const x = scrollsAlong(style.overflowX);
  const y = scrollsAlong(style.overflowY);
  if (!x && !y) return null;
  return {
    axes: x && y ? 'both' : x ? 'x' : 'y',
    content: { w: element.scrollWidth, h: element.scrollHeight },
    client: { w: element.clientWidth, h: element.clientHeight },
    at: { x: element.scrollLeft, y: element.scrollTop },
  };
}

type Edge = StickyData['edge'];
type Edges = Record<Edge, number>;

/**
 * Where a scroll container shows its content, in viewport px, inside its borders and scrollbars,
 * and how far its content reaches past each of those edges, hidden.
 */
interface Scrollport {
  edges: Edges;
  hidden: Edges;
}

/**
 * Whether an element sticky at `edge` is stuck: it sits `offset` inside that edge of the
 * scrollport while content is hidden past the edge, so it has left the place it would scroll to.
 * @internal
 */
export function isStuck(edge: Edge, offset: number, rect: Edges, port: Scrollport): boolean {
  const line =
    edge === 'top' || edge === 'left' ? port.edges[edge] + offset : port.edges[edge] - offset;
  return port.hidden[edge] > 0.5 && Math.abs(rect[edge] - line) < 1;
}

/** The scrollport of a scroll container, or of the document's own scrolling. */
function scrollportOf(scroller: Element | null): Scrollport {
  const page = document.scrollingElement ?? document.documentElement;
  const element = scroller ?? page;
  // The document's scrollport is the viewport; a container's starts inside its border and, in a
  // right-to-left container, its scrollbar, which clientLeft counts.
  const box = scroller?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const left = box.left + (scroller?.clientLeft ?? 0);
  const top = box.top + (scroller?.clientTop ?? 0);
  // scrollLeft runs from 0 to negative in a right-to-left scroller, whose start is its right edge.
  const across = element.scrollWidth - element.clientWidth;
  const rtl = getComputedStyle(element).direction === 'rtl';
  const hiddenLeft = rtl ? across + element.scrollLeft : element.scrollLeft;
  return {
    edges: {
      top,
      left,
      bottom: top + element.clientHeight,
      right: left + element.clientWidth,
    },
    hidden: {
      top: element.scrollTop,
      bottom: element.scrollHeight - element.clientHeight - element.scrollTop,
      left: hiddenLeft,
      right: across - hiddenLeft,
    },
  };
}

/** Where an element sticks, in what, and whether it is stuck now. */
export function stickyOf(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  indexOf: Map<Element, number>,
  nodes: NodeData[],
): StickyData {
  const edge =
    (['top', 'bottom', 'left', 'right'] as const).find(
      (side) => style.getPropertyValue(side) !== 'auto',
    ) ?? 'right';
  const offset = pixelsOf(style.getPropertyValue(edge));
  let scroller: Element | null = null;
  // It sticks in the nearest scroll container: overflow hidden, auto or scroll. `clip` makes none.
  const container = (overflow: string) => overflow === 'hidden' || scrollsAlong(overflow);
  for (let at = element.parentElement; at && at !== document.body; at = at.parentElement) {
    const around = getComputedStyle(at);
    if (container(around.overflowX) || container(around.overflowY)) {
      scroller = at;
      break;
    }
  }
  const stuck = isStuck(edge, offset, element.getBoundingClientRect(), scrollportOf(scroller));
  if (!scroller) return { edge, offset, scroller: 'the document', scrolls: true, stuck };
  const around = getComputedStyle(scroller);
  const index = indexOf.get(scroller);
  return {
    edge,
    offset,
    scroller: index === undefined ? describeElement(scroller) : labelFor(nodes, index, scroller),
    scrolls: scrollsAlong(around.overflowX) || scrollsAlong(around.overflowY),
    stuck,
  };
}

/**
 * What sticks, scrolls or holds squeezed text inside the nodes without being a node, told on the
 * line of the node it is in: the scroll regions and sticky headers of components, for one.
 */
export function measureInner(
  root: HTMLElement,
  overlays: HTMLElement[],
  nodes: NodeData[],
  indexOf: Map<Element, number>,
  minTextCharacters: number,
  rootPx: number,
) {
  const nearestNode = (element: Element) => nearestNodeOf(element, indexOf);
  const scopes = [root, ...overlays.filter((overlay) => !root.contains(overlay))];
  for (const scope of scopes) {
    for (const element of Array.from(scope.getElementsByTagName('*'))) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.display === 'contents') continue;
      const outset = outsetOf(element, style);
      if (outset > 0)
        for (let at = nearestNode(element); at !== null; at = nodes[at].parent)
          nodes[at].outsetInside = Math.max(nodes[at].outsetInside ?? 0, outset);
      if (indexOf.has(element) || !(element instanceof HTMLElement)) continue;
      const sticky = style.position === 'sticky';
      const scroll = scrollOf(element, style);
      const squeezed = squeezedText(element, style, minTextCharacters, rootPx);
      if (!sticky && !scroll && !squeezed) continue;
      const index = nearestNode(element);
      if (index === null || nodes[index].hidden !== null || isDevElement(element)) continue;
      if (element.getClientRects().length === 0) continue;
      const inner: InnerData = { label: describeElement(element) };
      if (sticky) inner.sticky = stickyOf(element, style, indexOf, nodes);
      if (scroll) inner.scroll = scroll;
      if (squeezed) inner.squeezed = squeezed;
      nodes[index].inner.push(inner);
    }
  }
}

/**
 * How far an element reaches sideways past its place in the layout, on purpose, in px: set out by
 * a negative margin, such as a text button's hit area past its label; by an absolute pseudo-element,
 * such as an invisible hit area; or by a transform, such as a turning spinner's corners. The
 * content of every node around it may be that much wider without overflowing.
 */
function outsetOf(element: Element, style: CSSStyleDeclaration): number {
  let outset = Math.max(0, -pixelsOf(style.marginLeft), -pixelsOf(style.marginRight));
  if (style.position !== 'static')
    for (const pseudo of ['::before', '::after']) {
      const reach = getComputedStyle(element, pseudo);
      if (reach.position === 'absolute' && !['none', 'normal'].includes(reach.content))
        outset = Math.max(outset, -pixelsOf(reach.left), -pixelsOf(reach.right));
    }
  return Math.max(outset, transformReach(element, style, element.getBoundingClientRect()).x);
}

/**
 * How far a transform, such as a turn or a scale, takes an element's box past its laid-out box on
 * each side, in px, sideways and up and down.
 */
export function transformReach(
  element: Element,
  style: CSSStyleDeclaration,
  rect: DOMRect,
): { x: number; y: number } {
  if (style.transform === 'none') return { x: 0, y: 0 };
  const [width, height] =
    element instanceof HTMLElement
      ? [element.offsetWidth, element.offsetHeight]
      : [pixelsOf(style.width), pixelsOf(style.height)];
  return { x: Math.max(0, (rect.width - width) / 2), y: Math.max(0, (rect.height - height) / 2) };
}

/**
 * Text squeezed so narrow that it wraps at fewer than `minTextCharacters` characters a line: an element
 * holding text of its own that is longer than that, and wraps, in a box narrower than that many
 * characters of its font (a character taken as half the font size).
 */
function squeezedText(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  minTextCharacters: number,
  rootPx: number,
): { chars: number; width: number } | null {
  const width = element.clientWidth - pixelsOf(style.paddingLeft) - pixelsOf(style.paddingRight);
  const fontSize = pixelsOf(style.fontSize) || rootPx;
  const charWidth = fontSize / 2;
  if (width <= 0 || width >= minTextCharacters * charWidth) return null;
  let text = '';
  for (const child of Array.from(element.childNodes))
    if (child.nodeType === Node.TEXT_NODE) text += child.textContent ?? '';
  text = text.trim();
  if (
    text.length <= minTextCharacters ||
    style.whiteSpace === 'nowrap' ||
    style.whiteSpace === 'pre'
  )
    return null;
  const lineHeight = pixelsOf(style.lineHeight) || fontSize * 1.4;
  // The content's height, without the padding, holds the lines.
  const height = element.clientHeight - pixelsOf(style.paddingTop) - pixelsOf(style.paddingBottom);
  if (height < lineHeight * 1.5) return null;
  return { chars: Math.max(1, Math.floor(width / charWidth)), width };
}
