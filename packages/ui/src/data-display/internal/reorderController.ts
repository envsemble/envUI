import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { scrolledBy } from '../../internal/dom/scrolledBy.js';
import { dragThreshold } from '../../internal/dom/lengths.js';
import { isLiftKey, isRowMoveKey } from './reorderKeys.js';
import {
  edgeScrollDelta,
  measureRows,
  pointerTarget,
  rowOffset,
  rowsOf,
  type Move,
} from './reorderGeometry.js';
import { verticalScrollerOf } from '../../internal/dom/verticalScrollerOf.js';

type AnnouncementValues = { label: string; position: string; count: string };

export interface ReorderAnnouncements {
  lifted: (values: AnnouncementValues) => string;
  liftedByPointer: (values: AnnouncementValues) => string;
  moved: (values: AnnouncementValues) => string;
  atStart: (values: AnnouncementValues) => string;
  atEnd: (values: AnnouncementValues) => string;
  dropped: (values: AnnouncementValues) => string;
  cancelled: (values: AnnouncementValues) => string;
}

export interface ReorderOptions {
  list: HTMLElement | null;
  onReorder: ((from: number, to: number) => void) | undefined;
  announcements: ReorderAnnouncements;
  formatNumber: (value: number) => string;
}

export function createReorder(read: () => ReorderOptions, announce: (text: string) => void) {
  let move: Move | null = null;
  let frame = 0;
  let focusAfterTheApplicationMovesTheRow: HTMLElement | null = null;
  let ignoreTheClickThatEndsADrag = false;
  let pressOnLiftedHandleMayBlurIt = false;

  const say = (kind: keyof ReorderAnnouncements, label: string, index: number, count: number) => {
    const { announcements, formatNumber } = read();
    announce(
      announcements[kind]({ label, position: formatNumber(index + 1), count: formatNumber(count) }),
    );
  };

  const paintRowsAsIfMovingRowWereAtItsTarget = (current: Move) => {
    current.rows.forEach((row, index) => {
      const offset = rowOffset(current, index);
      row.style.translate = offset === 0 ? '' : `0 ${offset}px`;
    });
  };

  const markMovingRowHandleAndList = (current: Move) => {
    current.row.dataset.moving = current.mode;
    current.handle.setAttribute('aria-pressed', 'true');
    current.list.dataset.reordering = '';
  };

  const settle = (current: Move, instantSinceTheDomIsAboutToMove: boolean) => {
    cancelAnimationFrame(frame);
    for (const row of current.rows) {
      if (instantSinceTheDomIsAboutToMove) row.style.transition = 'none';
      row.style.translate = '';
      delete row.dataset.moving;
    }
    current.handle.setAttribute('aria-pressed', 'false');
    delete current.list.dataset.reordering;
    if (instantSinceTheDomIsAboutToMove)
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
    move = { list, row, handle, label, from, to: from, rows, ...measureRows(list, rows), mode };
    const liftedAtOnceByKey = mode === 'keyboard';
    if (liftedAtOnceByKey) markMovingRowHandleAndList(move);
    return move;
  };

  const drop = () => {
    if (!move) return;
    const { from, to, label, rows, handle } = move;
    const moved = from !== to;
    settle(move, moved);
    say('dropped', label, to, rows.length);
    if (moved) {
      focusAfterTheApplicationMovesTheRow = handle;
      read().onReorder?.(from, to);
    }
  };

  const cancel = (quiet = false) => {
    if (!move) return;
    const { label, from, rows } = move;
    settle(move, false);
    if (!quiet) say('cancelled', label, from, rows.length);
  };

  const sayCannotMovePastEnd = (label: string, index: number, count: number) =>
    say(index === 0 ? 'atStart' : 'atEnd', label, index, count);

  const stepByKeyboard = (to: number) => {
    if (!move) return;
    const next = Math.max(0, Math.min(move.rows.length - 1, to));
    if (next === move.to) {
      if (next === 0 || next === move.rows.length - 1)
        sayCannotMovePastEnd(move.label, next, move.rows.length);
      return;
    }
    move.to = next;
    paintRowsAsIfMovingRowWereAtItsTarget(move);
    say('moved', move.label, next, move.rows.length);
  };

  const followPointer = () => {
    const pointer = move?.pointer;
    if (!move || !pointer) return;
    const to = pointerTarget(move, pointer);
    if (to !== move.to) {
      move.to = to;
      say('moved', move.label, to, move.rows.length);
    }
    paintRowsAsIfMovingRowWereAtItsTarget(move);
  };

  const scrollWhileDraggingNearAnEdge = () => {
    cancelAnimationFrame(frame);
    const pointer = move?.pointer;
    if (!pointer?.dragging) return;
    const { scroller } = pointer;
    const delta = edgeScrollDelta(scroller, pointer.lastY);
    if (delta === 0) return;
    const before = scroller.scrollTop;
    scroller.scrollTop = before + delta;
    if (scroller.scrollTop === before) return;
    followPointer();
    frame = requestAnimationFrame(scrollWhileDraggingNearAnEdge);
  };

  const liftForArrowKeys = (row: HTMLElement, handle: HTMLElement, label: string) => {
    const started = start(row, handle, label, 'keyboard');
    if (started) say('lifted', label, started.from, started.rows.length);
  };

  const handlers = {
    handleKeyDown(event: KeyboardEvent<HTMLElement>, row: HTMLElement, label: string) {
      const isLift = isLiftKey(event.key);
      if (isLift) event.preventDefault();
      const liftedByAnotherHandle = move && move.handle !== event.currentTarget;
      if (liftedByAnotherHandle) cancel(true);
      if (!move) {
        if (!isLift || event.repeat) return;
        liftForArrowKeys(row, event.currentTarget, label);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancel();
        return;
      }
      if (move.mode !== 'keyboard' || event.repeat) return;
      if (isLift) drop();
      else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        stepByKeyboard(move.to + (event.key === 'ArrowUp' ? -1 : 1));
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        stepByKeyboard(event.key === 'Home' ? 0 : move.rows.length - 1);
      } else if (event.key === 'Tab') cancel();
    },
    handleKeyUp(event: KeyboardEvent<HTMLElement>) {
      const spaceReleaseWouldClick = event.key === ' ';
      if (spaceReleaseWouldClick) event.preventDefault();
    },
    handleClick(event: MouseEvent<HTMLElement>, row: HTMLElement, label: string) {
      pressOnLiftedHandleMayBlurIt = false;
      if (ignoreTheClickThatEndsADrag) {
        ignoreTheClickThatEndsADrag = false;
        return;
      }
      const handle = event.currentTarget;
      handle.focus({ preventScroll: true });
      if (move && move.handle !== handle) cancel(true);
      if (!move) liftForArrowKeys(row, handle, label);
      else if (move.mode === 'keyboard' && move.row === row) drop();
    },
    handleBlur() {
      if (move?.mode === 'keyboard' && !pressOnLiftedHandleMayBlurIt) cancel();
    },
    handlePointerDown(event: PointerEvent<HTMLElement>, row: HTMLElement, label: string) {
      if (event.button !== 0) return;
      if (move) {
        if (move.mode === 'keyboard' && move.handle === event.currentTarget) {
          pressOnLiftedHandleMayBlurIt = true;
          setTimeout(() => {
            pressOnLiftedHandleMayBlurIt = false;
          });
          const current = move;
          const refocusAfterReleaseOffHandle = () => {
            window.removeEventListener('pointerup', refocusAfterReleaseOffHandle, true);
            window.removeEventListener('pointercancel', refocusAfterReleaseOffHandle, true);
            setTimeout(() => {
              if (move === current && document.activeElement !== current.handle)
                current.handle.focus({ preventScroll: true });
            });
          };
          window.addEventListener('pointerup', refocusAfterReleaseOffHandle, true);
          window.addEventListener('pointercancel', refocusAfterReleaseOffHandle, true);
        }
        return;
      }
      ignoreTheClickThatEndsADrag = false;
      const handle = event.currentTarget;
      const current = start(row, handle, label, 'pointer');
      if (!current) return;
      const scroller =
        verticalScrollerOf(row) ?? document.scrollingElement ?? document.documentElement;
      current.pointer = {
        id: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        scroller,
        row,
        startScrolled: scrolledBy(row, 'y'),
        dragging: false,
      };
      capturePointerUnlessAReplayedTouchHasEnded(handle, event.pointerId);
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
        markMovingRowHandleAndList(move);
        say('liftedByPointer', move.label, move.from, move.rows.length);
      }
      followPointer();
      scrollWhileDraggingNearAnEdge();
    },
    handlePointerUp(event: PointerEvent<HTMLElement>) {
      const pointer = move?.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;
      if (pointer.dragging) {
        ignoreTheClickThatEndsADrag = true;
        setTimeout(() => {
          ignoreTheClickThatEndsADrag = false;
        });
        drop();
      } else {
        const aPressLeavesTheLiftToItsClick = true;
        cancel(aPressLeavesTheLiftToItsClick);
      }
    },
    handlePointerCancel(event: PointerEvent<HTMLElement>) {
      const pointer = move?.pointer;
      if (!pointer || event.pointerId !== pointer.id) return;
      cancel(!pointer.dragging);
    },
    rowKeyDown(event: KeyboardEvent<HTMLElement>, row: HTMLElement, label: string) {
      if (move || !isRowMoveKey(event)) return;
      const target = event.target as HTMLElement;
      const { list, onReorder } = read();
      if (!list) return;
      const rows = rowsOf(list);
      const from = rows.indexOf(row);
      const to = from + (event.key === 'ArrowUp' ? -1 : 1);
      if (from === -1) return;
      event.preventDefault();
      if (to < 0 || to >= rows.length) {
        sayCannotMovePastEnd(label, from, rows.length);
        return;
      }
      focusAfterTheApplicationMovesTheRow = target;
      say('moved', label, to, rows.length);
      onReorder?.(from, to);
    },
  };

  return {
    handlers,
    restoreFocus() {
      const element = focusAfterTheApplicationMovesTheRow;
      focusAfterTheApplicationMovesTheRow = null;
      if (element?.isConnected && document.activeElement !== element)
        element.focus({ preventScroll: true });
    },
    dispose() {
      if (move) settle(move, false);
    },
  };
}

export type Reorder = ReturnType<typeof createReorder>;

export type ReorderHandlers = Reorder['handlers'];

function capturePointerUnlessAReplayedTouchHasEnded(handle: HTMLElement, pointerId: number) {
  try {
    handle.setPointerCapture?.(pointerId);
  } catch {
    return;
  }
}
