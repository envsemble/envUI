'use client';

import {
  useEffect,
  useLayoutEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import { scrolledBy } from '../../internal/scrolledBy.js';
import { useLatest } from '../../internal/useLatest.js';
import {
  edgeScrollDelta,
  measureRows,
  pointerTarget,
  rowOffset,
  rowsOf,
  scrollerOf,
  type Move,
} from './reorderGeometry.js';

type AnnouncementValues = { label: string; position: string; count: string };

/** What a reorder announces, with the row's label and its position and the count as text. */
export interface ReorderAnnouncements {
  /** A row lifted by keyboard or a press, which the arrow keys move. */
  lifted: (values: AnnouncementValues) => string;
  /** A row the pointer drags. */
  liftedByPointer: (values: AnnouncementValues) => string;
  moved: (values: AnnouncementValues) => string;
  /** A row that can't move further toward the start, or the end, of the list. */
  atStart: (values: AnnouncementValues) => string;
  atEnd: (values: AnnouncementValues) => string;
  dropped: (values: AnnouncementValues) => string;
  cancelled: (values: AnnouncementValues) => string;
}

/** The latest announcement, and how many there have been, so a repeat is told apart. */
export interface Announcement {
  text: string;
  count: number;
}

/** What the controller reads as it works, from the latest render. */
interface ReorderOptions {
  list: HTMLElement | null;
  onReorder: ((from: number, to: number) => void) | undefined;
  announcements: ReorderAnnouncements;
  formatNumber: (value: number) => string;
}

/** How far, in CSS pixels, a press moves before it drags the row. */
const dragThreshold = 4;

/** What a list's moves share: the row that moves, and what the handlers set between events. */
interface ReorderState {
  move: Move | null;
  frame: number;
  /** The control to focus again once the application has moved the row. */
  refocus: HTMLElement | null;
  /** Set as a drag ends, so the click that follows its release doesn't lift the row again. */
  afterDrag: boolean;
  /**
   * Set while the pointer presses the handle of a row it lifted by a press, so the focus some
   * browsers take from the handle on that press doesn't put the row back before the click drops it.
   */
  pressingLifted: boolean;
}

/**
 * The moves of one list, outside React's render: the rows shift with the CSS `translate` property
 * while a row moves, and nothing moves in the DOM until onReorder.
 */
function createReorderSession(read: () => ReorderOptions, announce: (text: string) => void) {
  const state: ReorderState = {
    move: null,
    frame: 0,
    refocus: null,
    afterDrag: false,
    pressingLifted: false,
  };

  const say = (kind: keyof ReorderAnnouncements, label: string, index: number, count: number) => {
    const { announcements, formatNumber } = read();
    announce(
      announcements[kind]({ label, position: formatNumber(index + 1), count: formatNumber(count) }),
    );
  };

  /** Shows the rows where they would be with the moving row at its target. */
  const paint = (current: Move) => {
    current.rows.forEach((row, index) => {
      const offset = rowOffset(current, index);
      row.style.translate = offset === 0 ? '' : `0 ${offset}px`;
    });
  };

  /** Marks the moving row, its pressed handle and the list, which raise the row and animate the others. */
  const show = (current: Move) => {
    current.row.dataset.moving = current.mode;
    current.handle.setAttribute('aria-pressed', 'true');
    current.list.dataset.reordering = '';
  };

  /** Ends a move: the rows return to rest, without a transition where the DOM is about to move. */
  const settle = (current: Move, instant: boolean) => {
    cancelAnimationFrame(state.frame);
    for (const row of current.rows) {
      if (instant) row.style.transition = 'none';
      row.style.translate = '';
      delete row.dataset.moving;
    }
    current.handle.setAttribute('aria-pressed', 'false');
    delete current.list.dataset.reordering;
    if (instant)
      requestAnimationFrame(() => {
        for (const row of current.rows) row.style.transition = '';
      });
    state.move = null;
  };

  const start = (row: HTMLElement, handle: HTMLElement, label: string, mode: Move['mode']) => {
    const { list } = read();
    if (!list) return null;
    const rows = rowsOf(list);
    const from = rows.indexOf(row);
    if (from === -1) return null;
    state.move = {
      list,
      row,
      handle,
      label,
      from,
      to: from,
      rows,
      ...measureRows(list, rows),
      mode,
    };
    // A press on the handle shows nothing until the pointer drags; a key lifts the row at once.
    if (mode === 'keyboard') show(state.move);
    return state.move;
  };

  const drop = () => {
    if (!state.move) return;
    const { from, to, label, rows, handle } = state.move;
    const moved = from !== to;
    settle(state.move, moved);
    say('dropped', label, to, rows.length);
    if (moved) {
      state.refocus = handle;
      read().onReorder?.(from, to);
    }
  };

  const cancel = (quiet = false) => {
    if (!state.move) return;
    const { label, from, rows } = state.move;
    settle(state.move, false);
    if (!quiet) say('cancelled', label, from, rows.length);
  };

  /** Says that a row is at an end of the list and can't move further that way. */
  const sayEnd = (label: string, index: number, count: number) =>
    say(index === 0 ? 'atStart' : 'atEnd', label, index, count);

  /** Moves the lifted row to `to` by keyboard. */
  const step = (to: number) => {
    if (!state.move) return;
    const next = Math.max(0, Math.min(state.move.rows.length - 1, to));
    if (next === state.move.to) {
      if (next === 0 || next === state.move.rows.length - 1)
        sayEnd(state.move.label, next, state.move.rows.length);
      return;
    }
    state.move.to = next;
    paint(state.move);
    say('moved', state.move.label, next, state.move.rows.length);
  };

  /** Follows the pointer: the target place for the row under it. */
  const follow = () => {
    const pointer = state.move?.pointer;
    if (!state.move || !pointer) return;
    const to = pointerTarget(state.move, pointer);
    if (to !== state.move.to) {
      state.move.to = to;
      say('moved', state.move.label, to, state.move.rows.length);
    }
    paint(state.move);
  };

  /** Scrolls the scroll area while the pointer drags near its edges. */
  const autoScroll = () => {
    cancelAnimationFrame(state.frame);
    const pointer = state.move?.pointer;
    if (!pointer?.dragging) return;
    const { scroller } = pointer;
    const delta = edgeScrollDelta(scroller, pointer.lastY);
    if (delta === 0) return;
    const before = scroller.scrollTop;
    scroller.scrollTop = before + delta;
    if (scroller.scrollTop === before) return;
    follow();
    state.frame = requestAnimationFrame(autoScroll);
  };

  /** Lifts a row for the arrow keys, by keyboard or a press of its handle. */
  const lift = (row: HTMLElement, handle: HTMLElement, label: string) => {
    const started = start(row, handle, label, 'keyboard');
    if (started) say('lifted', label, started.from, started.rows.length);
  };

  return {
    state,
    read,
    say,
    sayEnd,
    show,
    settle,
    start,
    drop,
    cancel,
    step,
    follow,
    autoScroll,
    lift,
  };
}

type ReorderSession = ReturnType<typeof createReorderSession>;

/** The handlers of a list's rows and their handles, which start, move and end its moves. */
function reorderHandlers({
  state,
  read,
  say,
  sayEnd,
  show,
  start,
  drop,
  cancel,
  step,
  follow,
  autoScroll,
  lift,
}: ReorderSession) {
  return {
    /**
     * The handle's keys. Space and Enter lift and drop here, and their own click is prevented, so
     * a click comes only from a press, such as a pointer's, voice control's or a screen reader's.
     */
    handleKeyDown(event: KeyboardEvent<HTMLElement>, row: HTMLElement, label: string) {
      const isLift = event.key === ' ' || event.key === 'Enter';
      if (isLift) event.preventDefault();
      // A row another handle lifted, which kept it lifted as focus moved here, goes back first.
      if (state.move && state.move.handle !== event.currentTarget) cancel(true);
      if (!state.move) {
        if (!isLift || event.repeat) return;
        lift(row, event.currentTarget, label);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancel();
        return;
      }
      if (state.move.mode !== 'keyboard' || event.repeat) return;
      if (isLift) drop();
      else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        step(state.move.to + (event.key === 'ArrowUp' ? -1 : 1));
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        step(event.key === 'Home' ? 0 : state.move.rows.length - 1);
      } else if (event.key === 'Tab') cancel();
    },
    /** Space clicks a button as it is released; the key down has done what it does. */
    handleKeyUp(event: KeyboardEvent<HTMLElement>) {
      if (event.key === ' ') event.preventDefault();
    },
    /**
     * A press of the handle that didn't drag lifts its row, or drops the lifted row, so people who
     * press rather than drag or type, through voice control, switch access or a screen reader's
     * browse mode, can move it too.
     */
    handleClick(event: MouseEvent<HTMLElement>, row: HTMLElement, label: string) {
      state.pressingLifted = false;
      if (state.afterDrag) {
        state.afterDrag = false;
        return;
      }
      const handle = event.currentTarget;
      handle.focus({ preventScroll: true });
      if (state.move && state.move.handle !== handle) cancel(true);
      if (!state.move) lift(row, handle, label);
      else if (state.move.mode === 'keyboard' && state.move.row === row) drop();
    },
    /** Losing focus puts a row lifted by keyboard back. */
    handleBlur() {
      if (state.move?.mode === 'keyboard' && !state.pressingLifted) cancel();
    },
    handlePointerDown(event: PointerEvent<HTMLElement>, row: HTMLElement, label: string) {
      if (event.button !== 0) return;
      if (state.move) {
        if (state.move.mode === 'keyboard' && state.move.handle === event.currentTarget) {
          state.pressingLifted = true;
          setTimeout(() => {
            state.pressingLifted = false;
          });
          // Released off the handle, the press clicks nothing, and a browser that took focus from
          // the handle as it was pressed would leave the row lifted with no handle to hear its keys:
          // once the release and any click have run, the lifted row's handle has focus again.
          const current = state.move;
          const released = () => {
            window.removeEventListener('pointerup', released, true);
            window.removeEventListener('pointercancel', released, true);
            setTimeout(() => {
              if (state.move === current && document.activeElement !== current.handle)
                current.handle.focus({ preventScroll: true });
            });
          };
          window.addEventListener('pointerup', released, true);
          window.addEventListener('pointercancel', released, true);
        }
        return;
      }
      state.afterDrag = false;
      const handle = event.currentTarget;
      const current = start(row, handle, label, 'pointer');
      if (!current) return;
      const scroller = scrollerOf(row);
      current.pointer = {
        id: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        scroller,
        row,
        startScrolled: scrolledBy(row, 'y'),
        dragging: false,
      };
      handle.setPointerCapture?.(event.pointerId);
      // The handle is no text to select, and the press shouldn't scroll the page on touch.
      event.preventDefault();
      handle.focus({ preventScroll: true });
    },
    handlePointerMove(event: PointerEvent<HTMLElement>) {
      const pointer = state.move?.pointer;
      if (!state.move || !pointer || event.pointerId !== pointer.id) return;
      pointer.lastY = event.clientY;
      if (!pointer.dragging) {
        if (Math.abs(event.clientY - pointer.startY) < dragThreshold) return;
        pointer.dragging = true;
        show(state.move);
        say('liftedByPointer', state.move.label, state.move.from, state.move.rows.length);
      }
      follow();
      autoScroll();
    },
    handlePointerUp(event: PointerEvent<HTMLElement>) {
      const pointer = state.move?.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;
      // A press that never moved far enough is no drag: nothing is announced, and the click that
      // follows lifts the row. The click that follows a drag does nothing, and in case none
      // follows, nothing is held for the next one.
      if (pointer.dragging) {
        state.afterDrag = true;
        setTimeout(() => {
          state.afterDrag = false;
        });
        drop();
      } else cancel(true);
    },
    handlePointerCancel(event: PointerEvent<HTMLElement>) {
      const pointer = state.move?.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;
      cancel(!pointer.dragging);
    },
    /** Alt+↑ and Alt+↓ on a row's target move the row one place at once. */
    rowKeyDown(event: KeyboardEvent<HTMLElement>, row: HTMLElement, label: string) {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || state.move) return;
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      const target = event.target as HTMLElement;
      const { list, onReorder } = read();
      if (!target.closest('[data-row-target]') || !list) return;
      const rows = rowsOf(list);
      const from = rows.indexOf(row);
      const to = from + (event.key === 'ArrowUp' ? -1 : 1);
      if (from === -1) return;
      event.preventDefault();
      if (to < 0 || to >= rows.length) {
        sayEnd(label, from, rows.length);
        return;
      }
      state.refocus = target;
      say('moved', label, to, rows.length);
      onReorder?.(from, to);
    },
  };
}

/** A list's moves, their handlers, and what runs as React commits and unmounts the list. */
function createReorder(read: () => ReorderOptions, announce: (text: string) => void) {
  const session = createReorderSession(read, announce);
  const { state, settle } = session;
  return {
    handlers: reorderHandlers(session),
    /**
     * After a drop the application moves the row in the DOM, which can take focus from it: focus
     * goes back to the control that moved the row.
     */
    restoreFocus() {
      const element = state.refocus;
      state.refocus = null;
      if (element?.isConnected && document.activeElement !== element)
        element.focus({ preventScroll: true });
    },
    dispose() {
      if (state.move) settle(state.move, false);
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
 * - A press of the handle without dragging lifts the row as the keys do, and another drops it.
 *   While the row is lifted, the handle is pressed (aria-pressed).
 * - Alt+↑ or Alt+↓ on the row's target moves it one place at once.
 * - Dragging the handle moves the row with the pointer and scrolls the nearest scroll area near its
 *   edges.
 *
 * Each step is announced through `announcement`, which the list shows in a polite live region,
 * and so is a move that the start or the end of the list stops.
 * After a move, focus returns to the handle or target that moved the row.
 */
export function useReorder(
  list: RefObject<HTMLElement | null>,
  onReorder: ((from: number, to: number) => void) | undefined,
  announcements: ReorderAnnouncements,
  formatNumber: (value: number) => string,
) {
  const [announcement, setAnnouncement] = useState<Announcement>({ text: '', count: 0 });
  const latest = useLatest({ onReorder, announcements, formatNumber });
  const [controller] = useState(() =>
    createReorder(
      () => ({ list: list.current, ...latest.current }),
      (text) => setAnnouncement((last) => ({ text, count: last.count + 1 })),
    ),
  );
  useLayoutEffect(() => controller.restoreFocus());
  useEffect(() => () => controller.dispose(), [controller]);
  return { announcement, handlers: controller.handlers };
}
