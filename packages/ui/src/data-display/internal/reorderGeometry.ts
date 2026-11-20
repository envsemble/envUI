import { scrolledBy } from '../../internal/dom/scrolledBy.js';

export interface Move {
  list: HTMLElement;
  row: HTMLElement;
  handle: HTMLElement;
  label: string;
  from: number;
  to: number;
  rows: HTMLElement[];
  tops: number[];
  heights: number[];
  gap: number;
  mode: 'keyboard' | 'pointer';
  pointer?: {
    id: number;
    startY: number;
    lastY: number;
    scroller: Element;
    row: HTMLElement;
    startScrolled: number;
    dragging: boolean;
  };
}

const edgeScrollBandPixels = 48;
const maxEdgeScrollPerFramePixels = 16;

export function rowsOf(list: HTMLElement) {
  return Array.from(list.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === 'LI',
  );
}

export function measureRows(list: HTMLElement, rows: readonly HTMLElement[]) {
  const origin = list.getBoundingClientRect().top;
  const boxes = rows.map((each) => each.getBoundingClientRect());
  return {
    tops: boxes.map((box) => box.top - origin),
    heights: boxes.map((box) => box.height),
    gap: boxes.length > 1 ? Math.max(0, boxes[1].top - boxes[0].bottom) : 0,
  };
}

function pointerOffsetIncludingScroll(pointer: NonNullable<Move['pointer']>) {
  return pointer.lastY - pointer.startY + scrolledBy(pointer.row, 'y') - pointer.startScrolled;
}

export function rowOffset(move: Move, index: number) {
  const { tops, heights, from, to, gap } = move;
  const shift = heights[from] + gap;
  if (index === from)
    return move.mode === 'pointer' && move.pointer
      ? pointerOffsetIncludingScroll(move.pointer)
      : to > from
        ? tops[to] + heights[to] - (tops[from] + heights[from])
        : tops[to] - tops[from];
  if (from < to && index > from && index <= to) return -shift;
  if (to < from && index >= to && index < from) return shift;
  return 0;
}

export function pointerTarget(move: Move, pointer: NonNullable<Move['pointer']>) {
  const { tops, heights, from } = move;
  const centre = tops[from] + heights[from] / 2 + pointerOffsetIncludingScroll(pointer);
  let to = from;
  for (let index = from + 1; index < tops.length; index++)
    if (centre > tops[index] + heights[index] / 2) to = index;
  for (let index = from - 1; index >= 0; index--)
    if (centre < tops[index] + heights[index] / 2) to = index;
  return to;
}

export function edgeScrollDelta(scroller: Element, y: number) {
  const viewport =
    scroller === document.scrollingElement || scroller === document.documentElement
      ? { top: 0, bottom: window.innerHeight }
      : scroller.getBoundingClientRect();
  const band = edgeScrollBandPixels;
  const step = maxEdgeScrollPerFramePixels;
  if (y < viewport.top + band) return -Math.ceil(((viewport.top + band - y) / band) * step);
  if (y > viewport.bottom - band) return Math.ceil(((y - (viewport.bottom - band)) / band) * step);
  return 0;
}
