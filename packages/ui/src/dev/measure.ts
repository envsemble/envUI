import type { Box, ChildData, LayoutKind, NodeData, Snapshot } from './model.js';
import { layoutKinds } from './model.js';
import { partClassOf } from './parts.js';
import { pageContainerQueries } from './queries.js';
import {
  describeElement,
  isDevElement,
  nodeLabelFor,
  layoutAttribute,
  nearestNodeOf,
} from './elements.js';
import { measureInner, scrollOf, stickyOf, transformReach } from './inner.js';
import { pixelsOf, remPixels } from '../internal/dom/lengths.js';
import { paintsOf } from '../internal/dom/paints.js';
import {
  isOpenOverlay,
  outermostOverlays,
  overlayKind,
  overlayCandidateSelector,
} from './overlays.js';

export interface MeasureOptions {
  inner?: boolean;
  minTextCharacters?: number;
}

const keysThatOutliveMeasurements = new WeakMap<Element, number>();
let nextId = 1;
export function keyOf(element: Element): number {
  let id = keysThatOutliveMeasurements.get(element);
  if (id === undefined) {
    id = nextId++;
    keysThatOutliveMeasurements.set(element, id);
  }
  return id;
}

export const toBox = (rect: DOMRect): Box => ({
  x: rect.left,
  y: rect.top,
  w: rect.width,
  h: rect.height,
});
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

function defaultRoot(): HTMLElement {
  const isPopupBoundaryWithoutBox = (element: HTMLElement) =>
    getComputedStyle(element).display === 'contents';
  const boundaries = Array.from(document.querySelectorAll<HTMLElement>('.env-theme')).filter(
    (element) =>
      element !== document.documentElement &&
      !isPopupBoundaryWithoutBox(element) &&
      !isDevElement(element),
  );
  const windowContainer = boundaries.find((element) =>
    getComputedStyle(element).containerName.split(/\s+/).includes('env-window'),
  );
  return windowContainer ?? boundaries[0] ?? document.body;
}

export function resolveRoot(root?: Element | string | null): HTMLElement {
  if (!root) return defaultRoot();
  const element = typeof root === 'string' ? document.querySelector(root) : root;
  if (!(element instanceof HTMLElement))
    throw new Error(`No element for the root ${String(root)}.`);
  return element;
}

interface Collected {
  elements: HTMLElement[];
  indexOf: Map<Element, number>;
  overlaySet: Set<Element>;
  outerOverlays: HTMLElement[];
}

function collectElementsParentsFirst(root: HTMLElement): Collected {
  const overlays = Array.from(document.querySelectorAll(overlayCandidateSelector)).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement && !isDevElement(element) && isOpenOverlay(element),
  );
  const outerOverlays = outermostOverlays(overlays);
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
  return { elements, indexOf, overlaySet: new Set<Element>(overlays), outerOverlays };
}

function clipperUpToTheRoot(root: HTMLElement, windowBox: Box) {
  const clips = new Map<Element, Box>();
  const unclipped: Box = { x: -1e7, y: -1e7, w: 2e7, h: 2e7 };
  const clipOf = (element: Element | null): Box => {
    if (!element || element === document.documentElement) return windowBox;
    const aroundTheRoot = element !== root && element.contains(root);
    if (aroundTheRoot) return unclipped;
    const known = clips.get(element);
    if (known) return known;
    const style = getComputedStyle(element);
    let clip = style.position === 'fixed' ? windowBox : clipOf(element.parentElement);
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible')
      clip = intersect(clip, toBox(element.getBoundingClientRect()));
    clips.set(element, clip);
    return clip;
  };
  return clipOf;
}

function readNode(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  index: number,
  parent: number | null,
  overlay: boolean,
  nodes: NodeData[],
  windowBox: Box,
): NodeData {
  const attribute = element.getAttribute(layoutAttribute) ?? '';
  const kind: NodeData['kind'] = overlay
    ? overlayKind(element)
    : (layoutKinds as readonly string[]).includes(attribute)
      ? (attribute as LayoutKind)
      : 'box';
  const part = partClassOf(element);
  return {
    index,
    key: keyOf(element),
    kind,
    name: part ?? element.getAttribute('data-env-name') ?? kind,
    part,
    overlay,
    parent,
    children: [],
    depth: parent === null ? 0 : nodes[parent].depth + 1,
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
    gap: [pixelsOf(style.rowGap), pixelsOf(style.columnGap)],
    padding: [
      pixelsOf(style.paddingTop),
      pixelsOf(style.paddingRight),
      pixelsOf(style.paddingBottom),
      pixelsOf(style.paddingLeft),
    ],
    border: [
      pixelsOf(style.borderTopWidth),
      pixelsOf(style.borderRightWidth),
      pixelsOf(style.borderBottomWidth),
      pixelsOf(style.borderLeftWidth),
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
}

function gridOf(style: CSSStyleDeclaration): NodeData['grid'] {
  const tracks = (list: string) =>
    list
      .split(/\s+/)
      .filter((value) => value.endsWith('px'))
      .map(pixelsOf);
  return {
    columns: tracks(style.gridTemplateColumns),
    rows: tracks(style.gridTemplateRows),
    areas:
      style.gridTemplateAreas === 'none'
        ? null
        : style.gridTemplateAreas.replace(/"\s+"/g, '" / "'),
  };
}

function kidsOf(element: HTMLElement, collected: Collected, nodes: NodeData[]): ChildData[] {
  return layoutChildrenOf(element).map((child): ChildData => {
    const childIndex = collected.indexOf.get(child);
    const childStyle = getComputedStyle(child);
    const rect = child.getBoundingClientRect();
    const reachOfTransform = transformReach(child, childStyle, rect);
    const outset = (margin: string, reach: number) => Math.max(0, -pixelsOf(margin)) + reach;
    return {
      label:
        childIndex === undefined ? describeElement(child) : nodeLabelFor(nodes, childIndex, child),
      box: toBox(rect),
      node: childIndex !== undefined,
      detached:
        childStyle.position === 'fixed' ||
        childStyle.position === 'absolute' ||
        collected.overlaySet.has(child) ||
        child.matches('dialog, [popover]'),
      outset: {
        left: outset(childStyle.marginLeft, reachOfTransform.x),
        right: outset(childStyle.marginRight, reachOfTransform.x),
        top: outset(childStyle.marginTop, reachOfTransform.y),
        bottom: outset(childStyle.marginBottom, reachOfTransform.y),
      },
    };
  });
}

function readLayout(
  node: NodeData,
  element: HTMLElement,
  style: CSSStyleDeclaration,
  collected: Collected,
  nodes: NodeData[],
  inner: boolean,
) {
  if (style.display.includes('grid')) node.grid = gridOf(style);
  if (style.containerType && style.containerType !== 'normal')
    node.container = {
      name: style.containerName === 'none' ? '' : style.containerName,
      type: style.containerType,
    };
  node.scroll = scrollOf(element, style);
  if (style.position === 'sticky') node.sticky = stickyOf(element, style, collected.indexOf, nodes);
  if (inner) node.paints = paintsOf(style);
  if (node.overlay)
    node.side =
      element.getAttribute('data-side') ??
      element.closest('[data-side]')?.getAttribute('data-side') ??
      null;
  node.kids = kidsOf(element, collected, nodes);
}

function isShown(element: HTMLElement) {
  return typeof element.checkVisibility === 'function'
    ? element.checkVisibility({ checkVisibilityCSS: true })
    : element.getClientRects().length > 0;
}

const stickyOrFloatingLift = 0.5;
const overlayLiftAbovePage = 2;

export function measure(root: HTMLElement, options: MeasureOptions = {}): Snapshot {
  const rootPx = remPixels(root);
  const minTextCharacters = options.minTextCharacters ?? 8;
  const queries = pageContainerQueries(rootPx);
  const windowBox: Box = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
  const rootBox = toBox(root.getBoundingClientRect());
  const collected = collectElementsParentsFirst(root);
  const { elements, indexOf, overlaySet } = collected;
  const clipOf = clipperUpToTheRoot(root, windowBox);

  const nodes: NodeData[] = [];
  const hiddenUnder = new Set<number>();
  const overlayContaining = new Map<number, number>();
  elements.forEach((element, index) => {
    const parent = nearestNodeOf(element, indexOf);
    const overlay = overlaySet.has(element);
    const style = getComputedStyle(element);
    const node = readNode(element, style, index, parent, overlay, nodes, windowBox);
    nodes.push(node);
    if (parent !== null) nodes[parent].children.push(index);
    const parentOverlay = parent === null ? undefined : overlayContaining.get(parent);
    if (overlay) overlayContaining.set(index, index);
    else if (parentOverlay !== undefined) overlayContaining.set(index, parentOverlay);
    const insideHiddenNode =
      parent !== null && (hiddenUnder.has(parent) || nodes[parent].hidden !== null);
    if (insideHiddenNode) {
      hiddenUnder.add(index);
      node.hidden = 'hidden';
      let top = parent;
      while (hiddenUnder.has(top) && nodes[top].parent !== null) top = nodes[top].parent!;
      nodes[top].hiddenInside++;
      return;
    }
    if (!isShown(element)) {
      node.hidden = hiddenReason(element, style, root, indexOf, nodes);
      return;
    }
    const clippedByTheWindowAlone = overlay || style.position === 'fixed';
    node.clip = intersect(
      clippedByTheWindowAlone ? windowBox : clipOf(element.parentElement),
      node.box,
    );
    if (!overlayContaining.has(index)) node.clip = intersect(node.clip, rootBox);
    readLayout(node, element, style, collected, nodes, options.inner ?? false);
    const sticksOrFloats = !overlay && ['sticky', 'absolute', 'fixed'].includes(style.position);
    const nestingLevel = parent === null ? 0 : nodes[parent].level + 1;
    node.level = nestingLevel + (sticksOrFloats ? stickyOrFloatingLift : 0);
  });

  const pageTopLevel = Math.max(
    0,
    ...nodes.filter((node) => !overlayContaining.has(node.index)).map((node) => node.level),
  );
  for (const index of overlayContaining.keys())
    nodes[index].level += Math.ceil(pageTopLevel) + overlayLiftAbovePage;

  if (options.inner)
    measureInner(root, collected.outerOverlays, nodes, indexOf, minTextCharacters, rootPx);

  return {
    rootPx,
    root: { label: describeElement(root), box: rootBox },
    window: { w: windowBox.w, h: windowBox.h },
    nodes,
    tops: nodes.filter((node) => node.parent === null).map((node) => node.index),
    queries,
    minTextCharacters,
    elements,
  };
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
    return `hidden: inside ${index === undefined ? describeElement(at) : nodeLabelFor(nodes, index, at)}, which is display: none`;
  }
  return 'hidden';
}
