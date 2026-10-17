'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react';

/** What a reorder announces, with the row's label and its position and the count as text. */
export interface ReorderAnnouncements {
  lifted: (values: { label: string; position: string; count: string }) => string;
  moved: (values: { label: string; position: string; count: string }) => string;
  dropped: (values: { label: string; position: string; count: string }) => string;
  cancelled: (values: { label: string; position: string; count: string }) => string;
}

/** What the controller reads as it works, from the latest render. */
interface ReorderOptions {
  list: HTMLElement | null;
  onReorder: ((from: number, to: number) => void) | undefined;
  announcements: ReorderAnnouncements;
  formatNumber: (value: number) => string;
}

/** A row being moved, from the press or key that lifted it until it is dropped or put back. */
interface Move {
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
    startScroll: number;
    /** Whether the pointer has moved far enough to start dragging, rather than pressing. */
    dragging: boolean;
  };
}

/** How far, in CSS pixels, a press moves before it drags the row. */
const dragThreshold = 4;
/** The band at each edge of the scroll area, in CSS pixels, where a drag scrolls it. */
const scrollEdge = 48;
/** The most a drag scrolls in a frame, in CSS pixels. */
const scrollStep = 16;

/** The rows of a list: its `li` children. */
function rowsOf(list: HTMLElement) {
  return Array.from(list.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === 'LI',
  );
}

/** The nearest ancestor that scrolls vertically, or the document's scrolling element. */
function scrollerOf(element: HTMLElement): Element {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight)
      return node;
  }
  return document.scrollingElement ?? document.documentElement;
}

/** How far the pointer has moved the row, with what the scroll area scrolled meanwhile. */
function pointerOffset(pointer: NonNullable<Move['pointer']>) {
  return pointer.lastY - pointer.startY + pointer.scroller.scrollTop - pointer.startScroll;
}

/**
 * The moves of one list, outside React's render: the rows shift with the CSS `translate` property
 * while a row moves, and nothing moves in the DOM until onReorder.
 */
function createReorder(read: () => ReorderOptions, announce: (text: string) => void) {
  let move: Move | null = null;
  let frame = 0;
  /** The control to focus again once the application has moved the row. */
  let refocus: HTMLElement | null = null;

  const say = (kind: keyof ReorderAnnouncements, label: string, index: number, count: number) => {
    const { announcements, formatNumber } = read();
    announce(
      announcements[kind]({ label, position: formatNumber(index + 1), count: formatNumber(count) }),
    );
  };

  /** Shows the rows where they would be with the moving row at its target. */
  const paint = (current: Move) => {
    const { rows, tops, heights, from, to, gap } = current;
    const shift = heights[from]! + gap;
    rows.forEach((row, index) => {
      let offset = 0;
      if (index === from)
        offset =
          current.mode === 'pointer' && current.pointer
            ? pointerOffset(current.pointer)
            : to > from
              ? tops[to]! + heights[to]! - (tops[from]! + heights[from]!)
              : tops[to]! - tops[from]!;
      else if (from < to && index > from && index <= to) offset = -shift;
      else if (to < from && index >= to && index < from) offset = shift;
      row.style.translate = offset === 0 ? '' : `0 ${offset}px`;
    });
  };

  /** Marks the moving row and the list, which raise the row and animate the others. */
  const show = (current: Move) => {
    current.row.dataset.moving = current.mode;
    current.list.dataset.reordering = '';
  };

  /** Ends a move: the rows return to rest, without a transition where the DOM is about to move. */
  const settle = (current: Move, instant: boolean) => {
    cancelAnimationFrame(frame);
    for (const row of current.rows) {
      if (instant) row.style.transition = 'none';
      row.style.translate = '';
      delete row.dataset.moving;
    }
    delete current.list.dataset.reordering;
    if (instant)
      requestAnimationFrame(() => {
        for (const row of current.rows) row.style.transition = '';
      });
    move = null;
  };

  const start = (row: HTMLElement, handle: HTMLElement, label: string, mode: Move['mode']) => {
    const { list } = read();
    if (!list) return null;
    const rows = rowsOf(list);
    const from = rows.indexOf(row);
    if (from === -1) return null;
    const origin = list.getBoundingClientRect().top;
    const boxes = rows.map((each) => each.getBoundingClientRect());
    move = {
      list,
      row,
      handle,
      label,
      from,
      to: from,
      rows,
      tops: boxes.map((box) => box.top - origin),
      heights: boxes.map((box) => box.height),
      gap: boxes.length > 1 ? Math.max(0, boxes[1]!.top - boxes[0]!.bottom) : 0,
      mode,
    };
    // A press on the handle shows nothing until the pointer drags; a key lifts the row at once.
    if (mode === 'keyboard') show(move);
    return move;
  };

  const drop = () => {
    if (!move) return;
    const { from, to, label, rows, handle } = move;
    const moved = from !== to;
    settle(move, moved);
    say('dropped', label, to, rows.length);
    if (moved) {
      refocus = handle;
      read().onReorder?.(from, to);
    }
  };

  const cancel = (quiet = false) => {
    if (!move) return;
    const { label, from, rows } = move;
    settle(move, false);
    if (!quiet) say('cancelled', label, from, rows.length);
  };

  /** Moves the lifted row to `to` by keyboard. */
  const step = (to: number) => {
    if (!move) return;
    const next = Math.max(0, Math.min(move.rows.length - 1, to));
    if (next === move.to) return;
    move.to = next;
    paint(move);
    say('moved', move.label, next, move.rows.length);
  };

  /** Follows the pointer: the target place for the row under it. */
  const follow = () => {
    const pointer = move?.pointer;
    if (!move || !pointer) return;
    const { tops, heights, from } = move;
    const centre = tops[from]! + heights[from]! / 2 + pointerOffset(pointer);
    let to = from;
    for (let index = from + 1; index < tops.length; index++)
      if (centre > tops[index]! + heights[index]! / 2) to = index;
    for (let index = from - 1; index >= 0; index--)
      if (centre < tops[index]! + heights[index]! / 2) to = index;
    if (to !== move.to) {
      move.to = to;
      say('moved', move.label, to, move.rows.length);
    }
    paint(move);
  };

  /** Scrolls the scroll area while the pointer drags near its edges. */
  const autoScroll = () => {
    cancelAnimationFrame(frame);
    const pointer = move?.pointer;
    if (!pointer?.dragging) return;
    const { scroller } = pointer;
    const viewport =
      scroller === document.scrollingElement || scroller === document.documentElement
        ? { top: 0, bottom: window.innerHeight }
        : scroller.getBoundingClientRect();
    let delta = 0;
    if (pointer.lastY < viewport.top + scrollEdge)
      delta = -Math.ceil(((viewport.top + scrollEdge - pointer.lastY) / scrollEdge) * scrollStep);
    else if (pointer.lastY > viewport.bottom - scrollEdge)
      delta = Math.ceil(
        ((pointer.lastY - (viewport.bottom - scrollEdge)) / scrollEdge) * scrollStep,
      );
    if (delta === 0) return;
    const before = scroller.scrollTop;
    scroller.scrollTop = before + delta;
    if (scroller.scrollTop === before) return;
    follow();
    frame = requestAnimationFrame(autoScroll);
  };

  const handlers = {
    /** The handle's keys. */
    handleKeyDown(event: KeyboardEvent<HTMLElement>, row: HTMLElement, label: string) {
      const lift = event.key === ' ' || event.key === 'Enter';
      if (!move) {
        if (!lift || event.repeat) return;
        event.preventDefault();
        const started = start(row, event.currentTarget, label, 'keyboard');
        if (started) say('lifted', label, started.from, started.rows.length);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancel();
        return;
      }
      if (move.mode !== 'keyboard') return;
      if (lift) {
        event.preventDefault();
        drop();
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        step(move.to + (event.key === 'ArrowUp' ? -1 : 1));
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        step(event.key === 'Home' ? 0 : move.rows.length - 1);
      } else if (event.key === 'Tab') cancel();
    },
    /** Losing focus puts a row lifted by keyboard back. */
    handleBlur() {
      if (move?.mode === 'keyboard') cancel();
    },
    handlePointerDown(event: PointerEvent<HTMLElement>, row: HTMLElement, label: string) {
      if (event.button !== 0 || move) return;
      const handle = event.currentTarget;
      const current = start(row, handle, label, 'pointer');
      if (!current) return;
      const scroller = scrollerOf(row);
      current.pointer = {
        id: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        scroller,
        startScroll: scroller.scrollTop,
        dragging: false,
      };
      handle.setPointerCapture?.(event.pointerId);
      // The handle is no text to select, and the press shouldn't scroll the page on touch.
      event.preventDefault();
      handle.focus({ preventScroll: true });
    },
    handlePointerMove(event: PointerEvent<HTMLElement>) {
      const pointer = move?.pointer;
      if (!move || !pointer || event.pointerId !== pointer.id) return;
      pointer.lastY = event.clientY;
      if (!pointer.dragging) {
        if (Math.abs(event.clientY - pointer.startY) < dragThreshold) return;
        pointer.dragging = true;
        show(move);
        say('lifted', move.label, move.from, move.rows.length);
      }
      follow();
      autoScroll();
    },
    handlePointerUp(event: PointerEvent<HTMLElement>) {
      const pointer = move?.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;
      // A press that never moved far enough is no drag: nothing moved, so nothing is announced.
      if (pointer.dragging) drop();
      else cancel(true);
    },
    handlePointerCancel(event: PointerEvent<HTMLElement>) {
      const pointer = move?.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;
      cancel(!pointer.dragging);
    },
    /** Alt+↑ and Alt+↓ on a row's target move the row one place at once. */
    rowKeyDown(event: KeyboardEvent<HTMLElement>, row: HTMLElement, label: string) {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || move) return;
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      const target = event.target as HTMLElement;
      const { list, onReorder } = read();
      if (!target.closest('[data-row-target]') || !list) return;
      const rows = rowsOf(list);
      const from = rows.indexOf(row);
      const to = from + (event.key === 'ArrowUp' ? -1 : 1);
      if (from === -1 || to < 0 || to >= rows.length) return;
      event.preventDefault();
      refocus = target;
      say('moved', label, to, rows.length);
      onReorder?.(from, to);
    },
  };

  return {
    handlers,
    /**
     * After a drop the application moves the row in the DOM, which can take focus from it: focus
     * goes back to the control that moved the row.
     */
    restoreFocus() {
      const element = refocus;
      refocus = null;
      if (element?.isConnected && document.activeElement !== element)
        element.focus({ preventScroll: true });
    },
    dispose() {
      if (move) settle(move, false);
    },
  };
}

/** The handlers a list's rows and their handles call. */
export type ReorderHandlers = ReturnType<typeof createReorder>['handlers'];

/**
 * Moving the rows of a list by keyboard and pointer, with a preview while the row moves and one
 * onReorder(from, to) when it is dropped.
 *
 * - The handle's keys: Space or Enter lifts the row, ↑ and ↓ move it, Home and End move it to an
 *   end, Space or Enter drops it, and Escape or Tab puts it back. Losing focus puts it back too.
 * - Alt+↑ or Alt+↓ on the row's target moves it one place at once.
 * - Dragging the handle moves the row with the pointer and scrolls the nearest scroll area near its
 *   edges.
 *
 * Each step is announced through `announcement`, which the list shows in a polite live region.
 * After a move, focus returns to the handle or target that moved the row.
 */
export function useReorder(
  list: RefObject<HTMLElement | null>,
  onReorder: ((from: number, to: number) => void) | undefined,
  announcements: ReorderAnnouncements,
  formatNumber: (value: number) => string,
) {
  const [announcement, setAnnouncement] = useState('');
  const latest = useRef({ onReorder, announcements, formatNumber });
  useLayoutEffect(() => {
    latest.current = { onReorder, announcements, formatNumber };
  });
  const [controller] = useState(() =>
    createReorder(() => ({ list: list.current, ...latest.current }), setAnnouncement),
  );
  useLayoutEffect(() => controller.restoreFocus());
  useEffect(() => () => controller.dispose(), [controller]);
  return { announcement, handlers: controller.handlers };
}
