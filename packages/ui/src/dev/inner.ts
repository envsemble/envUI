import type { InnerData, NodeData, ScrollData, StickyData } from './model.js';
import { describeElement, isDevElement, nodeLabelFor, nearestNodeOf } from './elements.js';
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

interface Scrollport {
  edges: Edges;
  hidden: Edges;
}

/** @internal */
export function isStuck(edge: Edge, offset: number, rect: Edges, port: Scrollport): boolean {
  const stickingLine =
    edge === 'top' || edge === 'left' ? port.edges[edge] + offset : port.edges[edge] - offset;
  const contentHiddenPastEdge = port.hidden[edge] > 0.5;
  const onStickingLine = Math.abs(rect[edge] - stickingLine) < 1;
  return contentHiddenPastEdge && onStickingLine;
}

function scrollportOf(scroller: Element | null): Scrollport {
  const page = document.scrollingElement ?? document.documentElement;
  const element = scroller ?? page;
  const box = scroller?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const left = box.left + (scroller?.clientLeft ?? 0);
  const top = box.top + (scroller?.clientTop ?? 0);
  const scrollableWidth = element.scrollWidth - element.clientWidth;
  const rtlScrollLeftRunsNegative = getComputedStyle(element).direction === 'rtl';
  const hiddenLeft = rtlScrollLeftRunsNegative
    ? scrollableWidth + element.scrollLeft
    : element.scrollLeft;
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
      right: scrollableWidth - hiddenLeft,
    },
  };
}

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
  const makesScrollContainer = (overflow: string) =>
    overflow === 'hidden' || scrollsAlong(overflow);
  for (let at = element.parentElement; at && at !== document.body; at = at.parentElement) {
    const around = getComputedStyle(at);
    if (makesScrollContainer(around.overflowX) || makesScrollContainer(around.overflowY)) {
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
    scroller:
      index === undefined ? describeElement(scroller) : nodeLabelFor(nodes, index, scroller),
    scrolls: scrollsAlong(around.overflowX) || scrollsAlong(around.overflowY),
    stuck,
  };
}

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
      const outset = deliberateOutsetOf(element, style);
      if (outset > 0)
        for (let at = nearestNode(element); at !== null; at = nodes[at].parent)
          nodes[at].outsetInside = Math.max(nodes[at].outsetInside ?? 0, outset);
      if (indexOf.has(element) || !(element instanceof HTMLElement)) continue;
      const sticky = style.position === 'sticky';
      const scroll = scrollOf(element, style);
      const squeezed = squeezedTextOf(element, style, minTextCharacters, rootPx);
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

function deliberateOutsetOf(element: Element, style: CSSStyleDeclaration): number {
  let outset = Math.max(0, -pixelsOf(style.marginLeft), -pixelsOf(style.marginRight));
  if (style.position !== 'static')
    for (const pseudo of ['::before', '::after']) {
      const pseudoStyle = getComputedStyle(element, pseudo);
      const rendered = !['none', 'normal'].includes(pseudoStyle.content);
      if (pseudoStyle.position === 'absolute' && rendered)
        outset = Math.max(outset, -pixelsOf(pseudoStyle.left), -pixelsOf(pseudoStyle.right));
    }
  return Math.max(outset, transformReach(element, style, element.getBoundingClientRect()).x);
}

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

function squeezedTextOf(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  minTextCharacters: number,
  rootPx: number,
): { chars: number; width: number } | null {
  const width = element.clientWidth - pixelsOf(style.paddingLeft) - pixelsOf(style.paddingRight);
  const fontSize = pixelsOf(style.fontSize) || rootPx;
  const approximateCharWidth = fontSize / 2;
  if (width <= 0 || width >= minTextCharacters * approximateCharWidth) return null;
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
  const normalLineHeight = fontSize * 1.4;
  const lineHeight = pixelsOf(style.lineHeight) || normalLineHeight;
  const contentHeight =
    element.clientHeight - pixelsOf(style.paddingTop) - pixelsOf(style.paddingBottom);
  const wraps = contentHeight >= lineHeight * 1.5;
  if (!wraps) return null;
  return { chars: Math.max(1, Math.floor(width / approximateCharWidth)), width };
}
