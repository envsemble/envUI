'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../../internal/reducedMotion.js';
import { useLatest } from '../../internal/useLatest.js';
import type { Entry } from './TimeWheel.js';
import { centredRow, nearestAvailable, topOf, wheelMetrics, wrap } from './wheelRows.js';

/**
 * How quickly a turn eases into its row: each frame closes the distance left with a time constant of
 * this many ms, so quick notches add up to one turn that glides on and settles calmly.
 */
const turnEasing = 90;
/** The longest frame a turn eases through, in ms, so a turn after a stall doesn't jump. */
const longestFrame = 64;
/** A browser without scrollend, or one that misses it after snapping, settles after this pause, in ms. */
const settlePause = 200;
/** A long fling that comes within this many rows of a looping wheel's ends goes on from the middle copy. */
const endRows = 3;

/**
 * How a time wheel turns and settles: it turns to a row by itself, easing there, and the row that
 * settles in the middle as scrolling ends is chosen, an unavailable one giving way to the nearest
 * available. A looping wheel moves back to its middle copy, unseen, so it scrolls on in both ways.
 */
export function useWheelTurn({
  wheelRef,
  dragRef,
  entries,
  currentIndex,
  onChoose,
  loop,
  copies,
}: {
  wheelRef: RefObject<HTMLDivElement | null>;
  /** A mouse dragging the wheel, which settles once it is let go. */
  dragRef: RefObject<{ moved: boolean } | null>;
  entries: readonly Entry[];
  /** The index of the entry in the middle. */
  currentIndex: number;
  onChoose: (value: number) => void;
  loop: boolean;
  /** How many times the wheel repeats its entries. */
  copies: number;
}) {
  const count = entries.length;
  const middleCopy = Math.floor(copies / 2);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shown = useRef<{ current: number; count: number } | null>(null);
  // The row a turn the wheel makes itself is heading for, until it comes to rest.
  const target = useRef<number | null>(null);
  // A turn the wheel is easing through: its scroll position, kept unrounded, and its next frame.
  const turn = useRef<{ position: number; frame: number; time: number } | null>(null);
  // The row that takes the middle row's look: the one a turn is heading for, or else the one in the
  // middle while it scrolls.
  const [centred, setCentred] = useState(middleCopy * count + currentIndex);
  // What a wheel settling later, after a pause or a turn, chooses from: the latest render's entries
  // and choice, never those of the render that started it, so a choice made on another wheel in
  // the meantime, such as AM or PM, stays.
  const latest = useLatest({ entries, currentIndex, onChoose });
  // The row this wheel chose that the value doesn't show yet: the end of a turn and the end of its
  // scrolling both settle it, and it chooses once.
  const chosenAt = useRef<number | null>(null);
  useLayoutEffect(() => {
    chosenAt.current = null;
  });

  function stopTurn(wheel: HTMLDivElement | null) {
    if (!turn.current) return;
    cancelAnimationFrame(turn.current.frame);
    turn.current = null;
    if (wheel) delete wheel.dataset.turning;
  }

  /** Eases the wheel towards the target row, a frame at a time, and settles once it is there. */
  function turnFrame(time: number) {
    const wheel = wheelRef.current;
    const state = turn.current;
    if (!wheel || !state || target.current === null) {
      stopTurn(wheel);
      return;
    }
    const goal = topOf(wheel, target.current, loop);
    const elapsed = Math.min(Math.max(time - state.time, 0), longestFrame);
    state.time = time;
    state.position += (goal - state.position) * (1 - Math.exp(-elapsed / turnEasing));
    if (Math.abs(goal - state.position) < 0.5) {
      wheel.scrollTop = goal;
      stopTurn(wheel);
      settle();
      return;
    }
    wheel.scrollTop = state.position;
    state.frame = requestAnimationFrame(turnFrame);
  }

  function scrollToRow(rowIndex: number, smooth: boolean) {
    const wheel = wheelRef.current;
    if (!wheel) return;
    target.current = rowIndex;
    chosenAt.current = null;
    setCentred(rowIndex);
    if (!smooth || prefersReducedMotion()) {
      stopTurn(wheel);
      wheel.scrollTo({ top: topOf(wheel, rowIndex, loop), behavior: 'instant' });
      return;
    }
    // A turn under way heads for the new row from where it is.
    if (turn.current) return;
    // Snapping stays off while the wheel eases, as it would pull each frame back to a row.
    wheel.dataset.turning = '';
    turn.current = {
      position: wheel.scrollTop,
      time: performance.now(),
      frame: requestAnimationFrame(turnFrame),
    };
  }

  /** The row a turn the wheel makes itself is heading for, or else the one in the middle. */
  function heading(wheel: HTMLDivElement) {
    return target.current ?? centredRow(wheel, loop);
  }

  /** The row of an entry nearest the middle row, so the wheel turns the short way. */
  function nearestRow(index: number) {
    const wheel = wheelRef.current;
    if (!loop || !wheel) return index;
    const at = heading(wheel);
    const base = at - wrap(at, count);
    return [base - count, base, base + count]
      .map((start) => start + index)
      .reduce((best, candidate) =>
        Math.abs(candidate - at) < Math.abs(best - at) ? candidate : best,
      );
  }

  // The current entry turns to the middle as the wheel appears and whenever it changes; it jumps
  // there as the wheel appears or its entries change, and turns there otherwise.
  useLayoutEffect(() => {
    const previous = shown.current;
    shown.current = { current: currentIndex, count };
    if (previous && previous.count === count) {
      const wheel = wheelRef.current;
      const at = wheel ? heading(wheel) : undefined;
      if (at !== undefined && wrap(at, count) === currentIndex) return;
      scrollToRow(nearestRow(currentIndex), true);
    } else scrollToRow(middleCopy * count + currentIndex, false);
    // The rows' positions depend on nothing else.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, count]);

  useEffect(
    () => () => {
      clearTimeout(settleTimer.current);
      if (turn.current) cancelAnimationFrame(turn.current.frame);
    },
    [],
  );

  /**
   * Moves a looping wheel by whole copies of its entries, onto the same rows, unseen, with the turn
   * it is making and the row it is heading for.
   */
  function shiftRows(wheel: HTMLDivElement, rows: number) {
    const pixels = rows * wheelMetrics(wheel).row;
    wheel.scrollTop += pixels;
    if (turn.current) turn.current.position += pixels;
    if (target.current !== null) target.current += rows;
    setCentred((row) => row + rows);
  }

  /** Whether a row lies in a looping wheel's first or last copy, far from the middle one. */
  function nearEnds(row: number) {
    return row < count || row >= (copies - 1) * count;
  }

  /** Moves a looping wheel back to its middle copy, onto the same rows, unseen. */
  function recentre(wheel: HTMLDivElement, at: number) {
    if (!loop || !nearEnds(at)) return at;
    const moved = middleCopy * count + wrap(at, count);
    shiftRows(wheel, moved - at);
    return moved;
  }

  /** Chooses the entry that settled in the middle, or turns to the nearest available one. */
  function settle() {
    const wheel = wheelRef.current;
    // A turn the wheel is easing through settles once it ends, and a drag once it is let go.
    if (!wheel || turn.current || dragRef.current?.moved) return;
    clearTimeout(settleTimer.current);
    // A turn the wheel makes itself that another one cut short settles nothing; the last settles.
    if (target.current !== null && centredRow(wheel, loop) !== target.current) return;
    target.current = null;
    const { entries: rows, currentIndex: chosen, onChoose: choose } = latest.current;
    const at = recentre(wheel, centredRow(wheel, loop));
    const index = loop ? wrap(at, count) : Math.min(Math.max(at, 0), count - 1);
    const available = nearestAvailable(rows, index, loop, 0);
    if (available === -1) return;
    if (available !== index) {
      scrollToRow(loop ? at + (available - index) : available, true);
      return;
    }
    if (index !== chosen && chosenAt.current !== index) {
      chosenAt.current = index;
      choose(rows[index]!.value);
    }
  }

  function handleScroll() {
    const wheel = wheelRef.current;
    if (!wheel) return;
    let at = centredRow(wheel, loop);
    // A long fling that reaches the last rows goes on from the middle copy rather than stopping.
    if (loop && (at < endRows || at > copies * count - endRows - 1)) at = recentre(wheel, at);
    // A turn the wheel makes itself keeps the middle row's look on the row it is heading for, so the
    // look doesn't flicker between the rows it passes; scrolling by hand moves it row by row.
    if (target.current === null && at !== centred) setCentred(at);
    clearTimeout(settleTimer.current);
    if (!turn.current && !dragRef.current?.moved)
      settleTimer.current = setTimeout(settle, settlePause);
  }

  /**
   * Turns the wheel to a row, easing there, within the ends of a wheel that doesn't loop; on one
   * that does, a row far from the middle copy moves back to it first, so a long spin never ends.
   */
  function turnTo(wheel: HTMLDivElement, next: number) {
    if (!loop) next = Math.min(Math.max(next, 0), count - 1);
    else if (nearEnds(next)) {
      const shift = middleCopy * count + wrap(next, count) - next;
      shiftRows(wheel, shift);
      next += shift;
    }
    clearTimeout(settleTimer.current);
    scrollToRow(next, true);
  }

  return {
    /** The row that takes the middle row's look. */
    centred,
    scrollToRow,
    turnTo,
    heading,
    settle,
    handleScroll,
    /** Someone dragging the wheel, or pressing a row, takes over from a turn it makes itself. */
    interrupt: (wheel: HTMLDivElement) => {
      stopTurn(wheel);
      target.current = null;
    },
    /** Holds off settling after a pause, as while a drag moves the rows. */
    holdSettling: () => clearTimeout(settleTimer.current),
  };
}
