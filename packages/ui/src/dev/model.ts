// What one measurement of the page holds: plain data, so the readout and its checks can be
// computed, and tested, apart from the DOM.

import type { ContainerQuery } from './queries.js';

/** A rectangle in px, in the window's coordinates. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The kinds of layout node: a primitive, a scaffold or Page. */
export const layoutKinds = ['box', 'row', 'column', 'grid', 'scaffold', 'panes', 'page'] as const;
export type LayoutKind = (typeof layoutKinds)[number];

/** The kinds of open overlay. */
export type OverlayKind = 'dialog' | 'popover' | 'menu' | 'tooltip';

/** How an element sticks. */
export interface StickyData {
  /** The edge it sticks to. */
  edge: 'top' | 'bottom' | 'left' | 'right';
  /** Its offset from that edge, in px. */
  offset: number;
  /** The element it sticks in, described; `the document` for the page's own scrolling. */
  scroller: string;
  /** Whether that element scrolls; if it only clips, the element never sticks. */
  scrolls: boolean;
  /** Whether it is stuck now. */
  stuck: boolean;
}

/** How an element scrolls. */
export interface ScrollData {
  /** The axes it scrolls along. */
  axes: 'x' | 'y' | 'both';
  /** The content's size, in px. */
  content: { w: number; h: number };
  /** Its visible size, inside the scrollbars, in px. */
  client: { w: number; h: number };
  /** How far it is scrolled, in px. */
  at: { x: number; y: number };
}

/** A layout child of a node: an element child, looking through `display: contents`. */
export interface ChildData {
  /** The child, described: a node's label, or else its tag and part class. */
  label: string;
  box: Box;
  /** Whether it is a node itself. */
  node: boolean;
  /**
   * Whether it is out of the flow, so it never spills: fixed, absolute, such as a resize handle
   * across its parent's edge, or an overlay.
   */
  detached: boolean;
  /**
   * How far a negative margin sets it out past its place on each side, in px, such as a text
   * button's hit area reaching past its label: sticking out by that much is by design.
   */
  outset?: { left: number; right: number; top: number; bottom: number };
}

/** An element inside a node, not a node itself, that sticks, scrolls or holds squeezed text. */
export interface InnerData {
  label: string;
  sticky?: StickyData;
  scroll?: ScrollData;
  /** Text squeezed to so few characters a line, with its width in px. */
  squeezed?: { chars: number; width: number };
}

/** One node: a layout element, or an open overlay. */
export interface NodeData {
  /** Its index in the measurement. */
  index: number;
  /** A number that stays the node's while the element lives, across measurements. */
  key: number;
  kind: LayoutKind | OverlayKind;
  /** Its part class, else its `data-env-name`, else its kind. */
  name: string;
  /** Its part class, if it has one. */
  part: string | null;
  overlay: boolean;
  /** The index of the node it is in, or null for a node at the top. */
  parent: number | null;
  children: number[];
  depth: number;
  /** Why it isn't shown, or null when it is. Nothing else is measured for a hidden node. */
  hidden: string | null;
  /** The nodes inside a hidden node, which aren't listed. */
  hiddenInside: number;
  /** Its border box, as the window shows it. */
  box: Box;
  /** The part of it that is visible, inside everything around it that clips. */
  clip: Box;
  /** Its layout size, before transforms, in px. */
  size: { w: number; h: number };
  display: string;
  flexDirection: string;
  flexWrap: string;
  alignItems: string;
  justifyContent: string;
  /** Gaps in px: between rows, between columns. */
  gap: [number, number];
  /** Padding in px: top, right, bottom, left. */
  padding: [number, number, number, number];
  /** Border widths in px: top, right, bottom, left. */
  border: [number, number, number, number];
  /** The resolved grid tracks in px, for a grid. */
  grid: { columns: number[]; rows: number[]; areas: string | null } | null;
  /** Its container name and type, if it is a size container. */
  container: { name: string; type: string } | null;
  /** How it overflows: visible, or clipped, or scrolling. */
  overflow: { x: string; y: string };
  /** Its own scroll sizes in px, for the overflow checks. */
  scrollSize: { w: number; clientW: number; h: number; clientH: number };
  /**
   * The furthest anything inside it is set out sideways by a negative margin, in px, which widens
   * its content by design, such as a toolbar whose padding keeps focus rings in view.
   */
  outsetInside?: number;
  scroll: ScrollData | null;
  position: string;
  sticky: StickyData | null;
  /** What it paints: background, border, shadow. */
  paints: string[];
  /** Its layout children, nodes or not, for the overflow checks and the 3D view's spacing. */
  kids: ChildData[];
  /** Elements in it that stick, scroll or hold squeezed text; measured only for the readout. */
  inner: InnerData[];
  /** For an overlay: the side of its anchor it took, if it has one. */
  side: string | null;
  /** How far the 3D view lifts it: one step per level of nesting, more for sticky and overlays. */
  level: number;
}

/** One measurement of the page. */
export interface Snapshot {
  /** The root font size: 1 rem in px. */
  rootPx: number;
  /** The element measured, described, and its box. */
  root: { label: string; box: Box };
  /** The window's size, in px. */
  window: { w: number; h: number };
  nodes: NodeData[];
  /** The nodes at the top, in order: the page's, then the open overlays. */
  tops: number[];
  /** The page's container queries, by container name. */
  queries: Map<string, ContainerQuery[]>;
  /** The fewest characters a line of text may hold before it counts as squeezed. */
  minTextChars: number;
  /** The nodes' elements, by index; a measurement of the page has them, a test's need not. */
  elements?: HTMLElement[];
}

/** What a problem is about. */
export type ProblemRule =
  | 'content-overflow'
  | 'child-overflow'
  | 'overlay-off-window'
  | 'layout-paints'
  | 'sticky-without-scroll'
  | 'text-squeezed'
  | 'skeleton-shift';

/** A problem the readout measured. */
export interface LayoutProblem {
  rule: ProblemRule;
  /** The node it is about, as the readout labels it, such as `grid "cards"`. */
  node: string;
  /** The nodes from the top down to it, such as `scaffold > page > grid "cards"`. */
  path: string;
  /** What is wrong and what to do, in a sentence or two. */
  message: string;
}
