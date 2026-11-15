import type { ContainerQuery } from './queries.js';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const layoutKinds = ['box', 'row', 'column', 'grid', 'scaffold', 'panes', 'page'] as const;
export type LayoutKind = (typeof layoutKinds)[number];

export type OverlayKind = 'dialog' | 'popover' | 'menu' | 'tooltip';

export interface StickyData {
  edge: 'top' | 'bottom' | 'left' | 'right';
  offset: number;
  scroller: string;
  scrolls: boolean;
  stuck: boolean;
}

export interface ScrollData {
  axes: 'x' | 'y' | 'both';
  content: { w: number; h: number };
  client: { w: number; h: number };
  at: { x: number; y: number };
}

export interface ChildData {
  label: string;
  box: Box;
  node: boolean;
  detached: boolean;
  outset?: { left: number; right: number; top: number; bottom: number };
}

export interface InnerData {
  label: string;
  sticky?: StickyData;
  scroll?: ScrollData;
  squeezed?: { chars: number; width: number };
}

export interface NodeData {
  index: number;
  key: number;
  kind: LayoutKind | OverlayKind;
  name: string;
  part: string | null;
  overlay: boolean;
  parent: number | null;
  children: number[];
  depth: number;
  hidden: string | null;
  hiddenInside: number;
  box: Box;
  clip: Box;
  size: { w: number; h: number };
  display: string;
  flexDirection: string;
  flexWrap: string;
  alignItems: string;
  justifyContent: string;
  gap: [row: number, column: number];
  padding: [top: number, right: number, bottom: number, left: number];
  border: [top: number, right: number, bottom: number, left: number];
  grid: { columns: number[]; rows: number[]; areas: string | null } | null;
  container: { name: string; type: string } | null;
  overflow: { x: string; y: string };
  scrollSize: { w: number; clientW: number; h: number; clientH: number };
  outsetInside?: number;
  scroll: ScrollData | null;
  position: string;
  sticky: StickyData | null;
  paints: string[];
  kids: ChildData[];
  inner: InnerData[];
  side: string | null;
  level: number;
}

export interface Snapshot {
  rootPx: number;
  root: { label: string; box: Box };
  window: { w: number; h: number };
  nodes: NodeData[];
  tops: number[];
  queries: Map<string, ContainerQuery[]>;
  minTextCharacters: number;
  elements?: HTMLElement[];
}

/** What a problem is about. */
export type LayoutProblemRule =
  | 'content-overflow'
  | 'child-overflow'
  | 'overlay-off-window'
  | 'layout-paints'
  | 'sticky-without-scroll'
  | 'text-squeezed'
  | 'skeleton-shift';

/** A problem the readout measured. */
export interface LayoutProblem {
  rule: LayoutProblemRule;
  /** The node it is about, as the readout labels it, such as `grid "cards"`. */
  node: string;
  /** The nodes from the top down to it, such as `scaffold > page > grid "cards"`. */
  path: string;
  /** What is wrong and what to do, in a sentence or two. */
  message: string;
}
