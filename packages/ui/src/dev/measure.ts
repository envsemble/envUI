// Measures the page in one pass of reads: the layout nodes (elements with data-env-layout) and
// the open overlays, with what the readout and the 3D view need of each. It writes nothing to the
// page, so it never forces a layout of its own beyond the first read.

import type {
  Box,
  ChildData,
  InnerData,
  LayoutKind,
  NodeData,
  OverlayKind,
  ScrollData,
  Snapshot,
  StickyData,
} from './model.js';
import { layoutKinds } from './model.js';
import { partClassOf } from './parts.js';
import { pageContainerQueries } from './queries.js';
import { rootFontPx } from './units.js';

/** The attribute every primitive and scaffold renders on its root, with its kind. */
export const layoutAttribute = 'data-env-layout';
/** The attribute on dev mode's own UI, which the readout leaves out. */
export const devAttribute = 'data-env-dev';

/**
 * What can be an open overlay, if it floats: dialogs, popovers, and the popups of components, which
 * take a role or the side of their anchor (`data-side`), but not their positioners.
 */
export const overlaySelector = [
  'dialog[open]',
  '[popover]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="tooltip"]',
  '[data-side]:not([role="presentation"])',
].join(', ');

export interface MeasureOptions {
  /** Also read what sticks, scrolls or holds squeezed text inside the nodes; the readout does. */
  inner?: boolean;
  /** The fewest characters a line of text may hold before it counts as squeezed. */
  minTextChars?: number;
}

const ids = new WeakMap<Element, number>();
let nextId = 1;
/** A number for an element that stays its own across measurements. */
export function keyOf(element: Element): number {
  let id = ids.get(element);
  if (id === undefined) {
    id = nextId++;
    ids.set(element, id);
  }
  return id;
}

const px = (value: string) => Number.parseFloat(value) || 0;
const toBox = (rect: DOMRect): Box => ({
  x: rect.left,
  y: rect.top,
  w: rect.width,
  h: rect.height,
});
const scrollsAlong = (overflow: string) => overflow === 'auto' || overflow === 'scroll';
const isTransparent = (color: string) =>
  color === 'transparent' ||
  /rgba?\([^)]*[,/]\s*0\s*\)$/.test(color) ||
  /\/\s*0%?\s*\)$/.test(color);

function intersect(a: Box, b: Box): Box {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(0, Math.min(a.x + a.w, b.x + b.w) - x),
    h: Math.max(0, Math.min(a.y + a.h, b.y + b.h) - y),
  };
}

/** Whether an element belongs to dev mode's own UI. */
export const isDevElement = (element: Element) => element.closest(`[${devAttribute}]`) !== null;

/** A short description of an element that is not a node: its tag and part class, or its label. */
export function describeElement(element: Element): string {
  const part = partClassOf(element);
  const label = element.getAttribute('aria-label');
  return `${element.tagName.toLowerCase()}${part ? `.${part}` : ''}${label ? ` "${label}"` : ''}`;
}

/** What an element paints: a background, a border or a shadow. */
export function paintsOf(style: CSSStyleDeclaration): string[] {
  const paints: string[] = [];
  if (!isTransparent(style.backgroundColor)) paints.push(`background ${style.backgroundColor}`);
  if (style.backgroundImage !== 'none') paints.push('a background image');
  const sides = (['top', 'right', 'bottom', 'left'] as const).filter(
    (side) =>
      px(style.getPropertyValue(`border-${side}-width`)) > 0 &&
      !['none', 'hidden'].includes(style.getPropertyValue(`border-${side}-style`)),
  );
  if (sides.length) paints.push(`a border (${sides.join(', ')})`);
  if (style.boxShadow !== 'none') paints.push('a shadow');
  return paints;
}

/** The element children of an element, looking through `display: contents`. */
export function layoutChildrenOf(element: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const child of Array.from(element.children)) {
    if (!(child instanceof HTMLElement) || ['STYLE', 'SCRIPT', 'TEMPLATE'].includes(child.tagName))
      continue;
    const display = getComputedStyle(child).display;
    if (display === 'none') continue;
    if (display === 'contents') out.push(...layoutChildrenOf(child));
    else out.push(child);
  }
  return out;
}

/** Whether an open overlay: in the top layer, or floating, and shown. */
function isOpenOverlay(element: Element): boolean {
  if (element instanceof HTMLDialogElement) return element.open;
  if (element.hasAttribute('popover')) {
    try {
      return element.matches(':popover-open');
    } catch {
      return false;
    }
  }
  // Floating is the element's own position, or its positioner's: Base UI places a popup in a
  // positioner, its parent, and a dialog or a command palette sits in a positioner fixed over the
  // window. A listbox or menu inside some other floating box is no overlay.
  const position = (at: Element) => getComputedStyle(at).position;
  if (['fixed', 'absolute'].includes(position(element))) return true;
  const parent = element.parentElement;
  if (parent === null) return false;
  if (parent.matches('[role="presentation"]') && ['fixed', 'absolute'].includes(position(parent)))
    return true;
  return element.matches('[role="dialog"], [role="alertdialog"]') && position(parent) === 'fixed';
}

function overlayKind(element: Element): OverlayKind {
  const role = element.getAttribute('role');
  if (element instanceof HTMLDialogElement || role === 'dialog' || role === 'alertdialog')
    return 'dialog';
  if (role === 'menu') return 'menu';
  if (role === 'tooltip') return 'tooltip';
  return 'popover';
}

/**
 * The element dev mode measures when none is given: the outermost theme boundary that is the
 * `env-window` container, else the first theme boundary, else the body. Dev mode's own UI and the
 * boundaries popups carry don't count.
 */
export function defaultRoot(): HTMLElement {
  const boundaries = Array.from(document.querySelectorAll<HTMLElement>('.env-theme')).filter(
    (element) =>
      element !== document.documentElement &&
      // The boundaries around popups take no box of their own.
      getComputedStyle(element).display !== 'contents' &&
      !isDevElement(element),
  );
  const window = boundaries.find((element) =>
    getComputedStyle(element).containerName.split(/\s+/).includes('env-window'),
  );
  return window ?? boundaries[0] ?? document.body;
}

/** Resolves a root given as an element or a selector. */
export function resolveRoot(root?: Element | string | null): HTMLElement {
  if (!root) return defaultRoot();
  const element = typeof root === 'string' ? document.querySelector(root) : root;
  if (!(element instanceof HTMLElement))
    throw new Error(`No element for the root ${String(root)}.`);
  return element;
}

/** Measures the page under a root, with the open overlays anywhere in the document. */
export function measure(root: HTMLElement, options: MeasureOptions = {}): Snapshot {
  const rootPx = rootFontPx();
  const minTextChars = options.minTextChars ?? 8;
  const queries = pageContainerQueries(rootPx);
  const windowBox: Box = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
  const rootBox = toBox(root.getBoundingClientRect());

  // The overlays first, outermost only, then the layout nodes under the root and in the overlays.
  const overlays = Array.from(document.querySelectorAll(overlaySelector)).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && !isDevElement(element) && isOpenOverlay(element),
  );
  const overlaySet = new Set<Element>(overlays);
  const outerOverlays = overlays.filter((element) => {
    for (let at = element.parentElement; at; at = at.parentElement)
      if (overlaySet.has(at)) return false;
    return true;
  });
  // The nodes in document order, so that parents come before their children: the page's, then
  // each overlay with the nodes in it.
  const inOverlay = (element: Element) =>
    outerOverlays.some((overlay) => overlay !== element && overlay.contains(element));
  const elements: HTMLElement[] = [];
  const seen = new Set<Element>();
  const add = (element: HTMLElement) => {
    if (seen.has(element) || isDevElement(element)) return;
    seen.add(element);
    elements.push(element);
  };
  const selector = `[${layoutAttribute}]`;
  if (root.hasAttribute(layoutAttribute) && !inOverlay(root)) add(root);
  for (const element of Array.from(root.querySelectorAll<HTMLElement>(selector)))
    if (!inOverlay(element)) add(element);
  for (const overlay of outerOverlays) {
    add(overlay);
    for (const element of Array.from(overlay.querySelectorAll<HTMLElement>(selector))) add(element);
  }
  const indexOf = new Map<Element, number>();
  elements.forEach((element, index) => indexOf.set(element, index));

  /** The node an element is in: its nearest ancestor that is a node. */
  const parentNodeOf = (element: Element): number | null => {
    for (let at = element.parentElement; at; at = at.parentElement) {
      const index = indexOf.get(at);
      if (index !== undefined) return index;
    }
    return null;
  };

  // The visible part of each element on the way up, inside every ancestor that clips, up to the
  // root: what is around the root, and the window, cut nothing off, as a window of the root's
  // size would show it all. The responsive frame lays the root out wider or taller than what
  // holds it, or than the window, and its planes are whole.
  const clips = new Map<Element, Box>();
  const unclipped: Box = { x: -1e7, y: -1e7, w: 2e7, h: 2e7 };
  const clipOf = (element: Element | null): Box => {
    if (!element || element === document.documentElement) return windowBox;
    if (element !== root && element.contains(root)) return unclipped;
    const known = clips.get(element);
    if (known) return known;
    const style = getComputedStyle(element);
    let clip = style.position === 'fixed' ? windowBox : clipOf(element.parentElement);
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible')
      clip = intersect(clip, toBox(element.getBoundingClientRect()));
    clips.set(element, clip);
    return clip;
  };

  const nodes: NodeData[] = [];
  const hiddenUnder = new Set<number>();
  /** The overlay each node is in, by index, for the nodes that are in one. */
  const overlayOf = new Map<number, number>();
  elements.forEach((element, index) => {
    const parent = parentNodeOf(element);
    const overlay = overlaySet.has(element);
    const attribute = element.getAttribute(layoutAttribute) ?? '';
    const kind: NodeData['kind'] = overlay
      ? overlayKind(element)
      : (layoutKinds as readonly string[]).includes(attribute)
        ? (attribute as LayoutKind)
        : 'box';
    const part = partClassOf(element);
    const name = part ?? element.getAttribute('data-env-name') ?? kind;
    const depth = parent === null ? 0 : nodes[parent].depth + 1;
    const style = getComputedStyle(element);
    const node: NodeData = {
      index,
      key: keyOf(element),
      kind,
      name,
      part,
      overlay,
      parent,
      children: [],
      depth,
      hidden: null,
      hiddenInside: 0,
      box: toBox(element.getBoundingClientRect()),
      clip: windowBox,
      size: { w: element.offsetWidth, h: element.offsetHeight },
      display: style.display,
      flexDirection: style.flexDirection,
      flexWrap: style.flexWrap,
      alignItems: style.alignItems,
      justifyContent: style.justifyContent,
      gap: [px(style.rowGap), px(style.columnGap)],
      padding: [
        px(style.paddingTop),
        px(style.paddingRight),
        px(style.paddingBottom),
        px(style.paddingLeft),
      ],
      border: [
        px(style.borderTopWidth),
        px(style.borderRightWidth),
        px(style.borderBottomWidth),
        px(style.borderLeftWidth),
      ],
      grid: null,
      container: null,
      overflow: { x: style.overflowX, y: style.overflowY },
      scrollSize: {
        w: element.scrollWidth,
        clientW: element.clientWidth,
        h: element.scrollHeight,
        clientH: element.clientHeight,
      },
      scroll: null,
      position: style.position,
      sticky: null,
      paints: [],
      kids: [],
      inner: [],
      side: null,
      level: 0,
    };
    nodes.push(node);
    if (parent !== null) nodes[parent].children.push(index);
    if (overlay) overlayOf.set(index, index);
    else if (parent !== null && overlayOf.has(parent)) overlayOf.set(index, overlayOf.get(parent)!);
    // A node inside a hidden one is counted there and measured no further.
    if (parent !== null && (hiddenUnder.has(parent) || nodes[parent].hidden !== null)) {
      hiddenUnder.add(index);
      node.hidden = 'hidden';
      let top = parent;
      while (hiddenUnder.has(top) && nodes[top].parent !== null) top = nodes[top].parent!;
      nodes[top].hiddenInside++;
      return;
    }
    const visible =
      typeof element.checkVisibility === 'function'
        ? element.checkVisibility({ checkVisibilityCSS: true })
        : element.getClientRects().length > 0;
    if (!visible) {
      node.hidden = hiddenReason(element, style, root, indexOf, nodes);
      return;
    }
    // An overlay, or what is fixed, is clipped by the window alone; the rest by what is around it.
    node.clip = intersect(
      overlay || style.position === 'fixed' ? windowBox : clipOf(element.parentElement),
      node.box,
    );
    if (!overlayOf.has(index)) node.clip = intersect(node.clip, rootBox);
    if (style.display.includes('grid')) {
      const tracks = (list: string) =>
        list
          .split(/\s+/)
          .filter((value) => value.endsWith('px'))
          .map(px);
      node.grid = {
        columns: tracks(style.gridTemplateColumns),
        rows: tracks(style.gridTemplateRows),
        areas:
          style.gridTemplateAreas === 'none'
            ? null
            : style.gridTemplateAreas.replace(/"\s+"/g, '" / "'),
      };
    }
    if (style.containerType && style.containerType !== 'normal')
      node.container = {
        name: style.containerName === 'none' ? '' : style.containerName,
        type: style.containerType,
      };
    node.scroll = scrollOf(element, style);
    if (style.position === 'sticky') node.sticky = stickyOf(element, style, indexOf, nodes);
    if (options.inner) node.paints = paintsOf(style);
    if (overlay)
      node.side =
        element.getAttribute('data-side') ??
        element.closest('[data-side]')?.getAttribute('data-side') ??
        null;
    node.kids = layoutChildrenOf(element).map((child): ChildData => {
      const childIndex = indexOf.get(child);
      const childStyle = getComputedStyle(child);
      const rect = child.getBoundingClientRect();
      const turned = transformReach(child, childStyle, rect);
      const outset = (margin: string, reach: number) => Math.max(0, -px(margin)) + reach;
      return {
        label:
          childIndex === undefined ? describeElement(child) : labelFor(nodes, childIndex, child),
        box: toBox(rect),
        node: childIndex !== undefined,
        detached:
          childStyle.position === 'fixed' ||
          childStyle.position === 'absolute' ||
          overlaySet.has(child) ||
          child.matches('dialog, [popover]'),
        outset: {
          left: outset(childStyle.marginLeft, turned.x),
          right: outset(childStyle.marginRight, turned.x),
          top: outset(childStyle.marginTop, turned.y),
          bottom: outset(childStyle.marginBottom, turned.y),
        },
      };
    });
    // One level per step of nesting, and half a level more for what sticks or floats.
    const lifted = !overlay && ['sticky', 'absolute', 'fixed'].includes(style.position) ? 0.5 : 0;
    node.level = (parent === null ? 0 : nodes[parent].level + 1) + lifted;
  });

  // Overlays, and what is in them, float two levels above the whole page.
  const top = Math.max(
    0,
    ...nodes.filter((node) => !overlayOf.has(node.index)).map((node) => node.level),
  );
  for (const index of overlayOf.keys()) nodes[index].level += Math.ceil(top) + 2;

  if (options.inner) measureInner(root, outerOverlays, nodes, indexOf, minTextChars, rootPx);

  return {
    rootPx,
    root: { label: describeElement(root), box: rootBox },
    window: { w: windowBox.w, h: windowBox.h },
    nodes,
    tops: nodes.filter((node) => node.parent === null).map((node) => node.index),
    queries,
    minTextChars,
    elements,
  };
}

/** A node's label for its parent's children, before the readout formats it. */
function labelFor(nodes: NodeData[], index: number, element: Element): string {
  const node = nodes[index];
  if (node) return node.name === node.kind ? node.kind : `${node.kind} "${node.name}"`;
  const kind = element.getAttribute(layoutAttribute) ?? 'node';
  const name = partClassOf(element) ?? element.getAttribute('data-env-name') ?? kind;
  return name === kind ? kind : `${kind} "${name}"`;
}

function hiddenReason(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  root: Element,
  indexOf: Map<Element, number>,
  nodes: NodeData[],
): string {
  if (style.display === 'none') return 'hidden (display: none)';
  if (style.visibility === 'hidden') return 'hidden (visibility: hidden)';
  for (let at = element.parentElement; at && at !== root.parentElement; at = at.parentElement) {
    if (getComputedStyle(at).display !== 'none') continue;
    const index = indexOf.get(at);
    return `hidden: inside ${index === undefined ? describeElement(at) : labelFor(nodes, index, at)}, which is display: none`;
  }
  return 'hidden';
}

function scrollOf(element: Element, style: CSSStyleDeclaration): ScrollData | null {
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

/** Where an element sticks, in what, and whether it is stuck now. */
function stickyOf(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  indexOf: Map<Element, number>,
  nodes: NodeData[],
): StickyData {
  const edge: StickyData['edge'] =
    style.top !== 'auto'
      ? 'top'
      : style.bottom !== 'auto'
        ? 'bottom'
        : style.left !== 'auto'
          ? 'left'
          : 'right';
  const offset = px(style.getPropertyValue(edge));
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
  const rect = element.getBoundingClientRect();
  if (!scroller) {
    const page = document.scrollingElement ?? document.documentElement;
    const scrolled =
      edge === 'top' || edge === 'bottom' ? page.scrollTop > 0 : page.scrollLeft !== 0;
    const at = edge === 'top' ? rect.top : edge === 'left' ? rect.left : 0;
    return {
      edge,
      offset,
      scroller: 'the document',
      scrolls: true,
      stuck: scrolled && Math.abs(at - offset) < 1,
    };
  }
  const around = getComputedStyle(scroller);
  const scrolls = scrollsAlong(around.overflowX) || scrollsAlong(around.overflowY);
  const box = scroller.getBoundingClientRect();
  const stuck =
    edge === 'top'
      ? scroller.scrollTop > 0 &&
        Math.abs(rect.top - (box.top + px(around.borderTopWidth) + offset)) < 1
      : edge === 'bottom'
        ? scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1 &&
          Math.abs(box.bottom - px(around.borderBottomWidth) - offset - rect.bottom) < 1
        : edge === 'left'
          ? scroller.scrollLeft > 0 && Math.abs(rect.left - (box.left + offset)) < 1
          : false;
  const index = indexOf.get(scroller);
  return {
    edge,
    offset,
    scroller: index === undefined ? describeElement(scroller) : labelFor(nodes, index, scroller),
    scrolls,
    stuck,
  };
}

/**
 * What sticks, scrolls or holds squeezed text inside the nodes without being a node, told on the
 * line of the node it is in: the scroll regions and sticky headers of components, for one.
 */
function measureInner(
  root: HTMLElement,
  overlays: HTMLElement[],
  nodes: NodeData[],
  indexOf: Map<Element, number>,
  minTextChars: number,
  rootPx: number,
) {
  const nearestNode = (element: Element): number | null => {
    for (let at = element.parentElement; at; at = at.parentElement) {
      const index = indexOf.get(at);
      if (index !== undefined) return index;
    }
    return null;
  };
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
      const squeezed = squeezedText(element, style, minTextChars, rootPx);
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
  let outset = Math.max(0, -px(style.marginLeft), -px(style.marginRight));
  if (style.position !== 'static')
    for (const pseudo of ['::before', '::after']) {
      const reach = getComputedStyle(element, pseudo);
      if (reach.position === 'absolute' && !['none', 'normal'].includes(reach.content))
        outset = Math.max(outset, -px(reach.left), -px(reach.right));
    }
  return Math.max(outset, transformReach(element, style, element.getBoundingClientRect()).x);
}

/**
 * How far a transform, such as a turn or a scale, takes an element's box past its laid-out box on
 * each side, in px, sideways and up and down.
 */
function transformReach(
  element: Element,
  style: CSSStyleDeclaration,
  rect: DOMRect,
): { x: number; y: number } {
  if (style.transform === 'none') return { x: 0, y: 0 };
  const [width, height] =
    element instanceof HTMLElement
      ? [element.offsetWidth, element.offsetHeight]
      : [px(style.width), px(style.height)];
  return { x: Math.max(0, (rect.width - width) / 2), y: Math.max(0, (rect.height - height) / 2) };
}

/**
 * Text squeezed so narrow that it wraps at fewer than `minTextChars` characters a line: an element
 * holding text of its own that is longer than that, and wraps, in a box narrower than that many
 * characters of its font (a character taken as half the font size).
 */
function squeezedText(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  minTextChars: number,
  rootPx: number,
): { chars: number; width: number } | null {
  const width = element.clientWidth - px(style.paddingLeft) - px(style.paddingRight);
  const fontSize = px(style.fontSize) || rootPx;
  const charWidth = fontSize / 2;
  if (width <= 0 || width >= minTextChars * charWidth) return null;
  let text = '';
  for (const child of Array.from(element.childNodes))
    if (child.nodeType === Node.TEXT_NODE) text += child.textContent ?? '';
  text = text.trim();
  if (text.length <= minTextChars || style.whiteSpace === 'nowrap' || style.whiteSpace === 'pre')
    return null;
  const lineHeight = px(style.lineHeight) || fontSize * 1.4;
  // The content's height, without the padding, holds the lines.
  const height = element.clientHeight - px(style.paddingTop) - px(style.paddingBottom);
  if (height < lineHeight * 1.5) return null;
  return { chars: Math.max(1, Math.floor(width / charWidth)), width };
}
