import { scrolledBy } from '../../internal/scrolledBy.js';

/** A row being moved, from the press or key that lifted it until it is dropped or put back. */
export interface Move {
  list: HTMLElement;
  row: HTMLElement;
  /** The handle that lifted it, which keeps focus. */
  handle: HTMLElement;
  label: string;
  from: number;
  to: number;
  rows: HTMLElement[];
  /** Each row's top and height in the list, measured as the move starts. */
  tops: number[];
  heights: number[];
  /** The space between two rows. */
  gap: number;
  mode: 'keyboard' | 'pointer';
  pointer?: {
    id: number;
    startY: number;
    lastY: number;
    scroller: Element;
    /** The row, and how far the boxes around it had scrolled it as the press began. */
    row: HTMLElement;
    startScrolled: number;
    /** Whether the pointer has moved far enough to start dragging, rather than pressing. */
    dragging: boolean;
  };
}

/** The band at each edge of the scroll area, in CSS pixels, where a drag scrolls it. */
const scrollEdge = 48;
/** The most a drag scrolls in a frame, in CSS pixels. */
const scrollStep = 16;

/** The rows of a list: its `li` children. */
export function rowsOf(list: HTMLElement) {
  return Array.from(list.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === 'LI',
  );
}

/** Each row's top and height in the list, and the space between two rows. */
export function measureRows(list: HTMLElement, rows: readonly HTMLElement[]) {
  const origin = list.getBoundingClientRect().top;
  const boxes = rows.map((each) => each.getBoundingClientRect());
  return {
    tops: boxes.map((box) => box.top - origin),
    heights: boxes.map((box) => box.height),
    gap: boxes.length > 1 ? Math.max(0, boxes[1].top - boxes[0].bottom) : 0,
  };
}

/** The nearest ancestor that scrolls vertically, or the document's scrolling element. */
export function scrollerOf(element: HTMLElement): Element {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight)
      return node;
  }
  return document.scrollingElement ?? document.documentElement;
}

/**
 * How far the pointer has moved the row, with what the boxes around it, the page among them,
 * scrolled meanwhile: the row stays under a pointer held still while one of them scrolls.
 */
export function pointerOffset(pointer: NonNullable<Move['pointer']>) {
  return pointer.lastY - pointer.startY + scrolledBy(pointer.row, 'y') - pointer.startScrolled;
}

/**
 * How far the row at `index` is shifted, in CSS pixels, while the moving row is at its target: the
 * moving row follows the pointer, or takes its target's place, and the rows between make room.
 */
export function rowOffset(move: Move, index: number) {
  const { tops, heights, from, to, gap } = move;
  const shift = heights[from] + gap;
  if (index === from)
    return move.mode === 'pointer' && move.pointer
      ? pointerOffset(move.pointer)
      : to > from
        ? tops[to] + heights[to] - (tops[from] + heights[from])
        : tops[to] - tops[from];
  if (from < to && index > from && index <= to) return -shift;
  if (to < from && index >= to && index < from) return shift;
  return 0;
}

/** The target place for the row the pointer drags: past every row whose middle its centre passed. */
export function pointerTarget(move: Move, pointer: NonNullable<Move['pointer']>) {
  const { tops, heights, from } = move;
  const centre = tops[from] + heights[from] / 2 + pointerOffset(pointer);
  let to = from;
  for (let index = from + 1; index < tops.length; index++)
    if (centre > tops[index] + heights[index] / 2) to = index;
  for (let index = from - 1; index >= 0; index--)
    if (centre < tops[index] + heights[index] / 2) to = index;
  return to;
}

/**
 * How far to scroll the scroll area in a frame while the pointer drags at `y`: more the nearer the
 * pointer is to an edge, within the band at each edge, and none outside them.
 */
export function edgeScrollDelta(scroller: Element, y: number) {
  const viewport =
    scroller === document.scrollingElement || scroller === document.documentElement
      ? { top: 0, bottom: window.innerHeight }
      : scroller.getBoundingClientRect();
  if (y < viewport.top + scrollEdge)
    return -Math.ceil(((viewport.top + scrollEdge - y) / scrollEdge) * scrollStep);
  if (y > viewport.bottom - scrollEdge)
    return Math.ceil(((y - (viewport.bottom - scrollEdge)) / scrollEdge) * scrollStep);
  return 0;
}
