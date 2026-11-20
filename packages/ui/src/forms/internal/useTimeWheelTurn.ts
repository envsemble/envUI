'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../../internal/motion/reducedMotion.js';
import { useLatest } from '../../internal/useLatest.js';
import {
  centredRow,
  nearestAvailable,
  topOf,
  wheelMetrics,
  wrapIndex,
  type TimeWheelEntry,
} from './timeWheelRows.js';

const turnEasingTimeConstantMs = 90;
const longestEasedFrameMs = 64;
const settleWithoutScrollendAfterMs = 200;
const rowsFromEndsThatRecentreAFling = 3;

function holdSnappingOffWhileEasing(wheel: HTMLElement) {
  wheel.dataset.turning = '';
}

export function useTimeWheelTurn({
  wheelRef,
  dragRef,
  entries,
  currentIndex,
  onChoose,
  loop,
  copies,
}: {
  wheelRef: RefObject<HTMLDivElement | null>;
  dragRef: RefObject<{ moved: boolean } | null>;
  entries: readonly TimeWheelEntry[];
  currentIndex: number;
  onChoose: (value: number) => void;
  loop: boolean;
  copies: number;
}) {
  const count = entries.length;
  const middleCopy = Math.floor(copies / 2);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shown = useRef<{ current: number; count: number } | null>(null);
  const ownTurnTarget = useRef<number | null>(null);
  const easingTurn = useRef<{ position: number; frame: number; time: number } | null>(null);
  const [centred, setCentred] = useState(middleCopy * count + currentIndex);
  const latestRender = useLatest({ entries, currentIndex, onChoose });
  const chosenButNotYetShown = useRef<number | null>(null);
  useLayoutEffect(() => {
    chosenButNotYetShown.current = null;
  });

  function stopTurn(wheel: HTMLDivElement | null) {
    if (!easingTurn.current) return;
    cancelAnimationFrame(easingTurn.current.frame);
    easingTurn.current = null;
    if (wheel) delete wheel.dataset.turning;
  }

  function turnFrame(time: number) {
    const wheel = wheelRef.current;
    const state = easingTurn.current;
    if (!wheel || !state || ownTurnTarget.current === null) {
      stopTurn(wheel);
      return;
    }
    const goal = topOf(wheel, ownTurnTarget.current, loop);
    const elapsed = Math.min(Math.max(time - state.time, 0), longestEasedFrameMs);
    state.time = time;
    state.position += (goal - state.position) * (1 - Math.exp(-elapsed / turnEasingTimeConstantMs));
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
    ownTurnTarget.current = rowIndex;
    chosenButNotYetShown.current = null;
    setCentred(rowIndex);
    if (!smooth || prefersReducedMotion()) {
      stopTurn(wheel);
      wheel.scrollTo({ top: topOf(wheel, rowIndex, loop), behavior: 'instant' });
      return;
    }
    const turnUnderWayHeadsThereFromWhereItIs = easingTurn.current !== null;
    if (turnUnderWayHeadsThereFromWhereItIs) return;
    holdSnappingOffWhileEasing(wheel);
    easingTurn.current = {
      position: wheel.scrollTop,
      time: performance.now(),
      frame: requestAnimationFrame(turnFrame),
    };
  }

  function heading(wheel: HTMLDivElement) {
    return ownTurnTarget.current ?? centredRow(wheel, loop);
  }

  function nearestRow(index: number) {
    const wheel = wheelRef.current;
    if (!loop || !wheel) return index;
    const at = heading(wheel);
    const base = at - wrapIndex(at, count);
    return [base - count, base, base + count]
      .map((start) => start + index)
      .reduce((best, candidate) =>
        Math.abs(candidate - at) < Math.abs(best - at) ? candidate : best,
      );
  }

  useLayoutEffect(
    function bringTheCurrentEntryToTheMiddle() {
      const previous = shown.current;
      shown.current = { current: currentIndex, count };
      const sameEntriesSoTurnRatherThanJump = previous !== null && previous.count === count;
      if (sameEntriesSoTurnRatherThanJump) {
        const wheel = wheelRef.current;
        const at = wheel ? heading(wheel) : undefined;
        if (at !== undefined && wrapIndex(at, count) === currentIndex) return;
        scrollToRow(nearestRow(currentIndex), true);
      } else scrollToRow(middleCopy * count + currentIndex, false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, count],
  );

  useEffect(
    () => () => {
      clearTimeout(settleTimer.current);
      if (easingTurn.current) cancelAnimationFrame(easingTurn.current.frame);
    },
    [],
  );

  function shiftRows(wheel: HTMLDivElement, rows: number) {
    const pixels = rows * wheelMetrics(wheel).row;
    wheel.scrollTop += pixels;
    if (easingTurn.current) easingTurn.current.position += pixels;
    if (ownTurnTarget.current !== null) ownTurnTarget.current += rows;
    setCentred((row) => row + rows);
  }

  function nearEnds(row: number) {
    return row < count || row >= (copies - 1) * count;
  }

  function recentre(wheel: HTMLDivElement, at: number) {
    if (!loop || !nearEnds(at)) return at;
    const moved = middleCopy * count + wrapIndex(at, count);
    shiftRows(wheel, moved - at);
    return moved;
  }

  function settle() {
    const wheel = wheelRef.current;
    const settlesWhenTurnOrDragEnds = easingTurn.current !== null || dragRef.current?.moved;
    if (!wheel || settlesWhenTurnOrDragEnds) return;
    clearTimeout(settleTimer.current);
    const turnCutShortByAnother =
      ownTurnTarget.current !== null && centredRow(wheel, loop) !== ownTurnTarget.current;
    if (turnCutShortByAnother) return;
    ownTurnTarget.current = null;
    const { entries: rows, currentIndex: chosen, onChoose: choose } = latestRender.current;
    const at = recentre(wheel, centredRow(wheel, loop));
    const index = loop ? wrapIndex(at, count) : Math.min(Math.max(at, 0), count - 1);
    const available = nearestAvailable(rows, index, loop, 0);
    if (available === -1) return;
    if (available !== index) {
      scrollToRow(loop ? at + (available - index) : available, true);
      return;
    }
    if (index !== chosen && chosenButNotYetShown.current !== index) {
      chosenButNotYetShown.current = index;
      choose(rows[index].value);
    }
  }

  function handleScroll() {
    const wheel = wheelRef.current;
    if (!wheel) return;
    let at = centredRow(wheel, loop);
    const flingReachesTheEnds =
      at < rowsFromEndsThatRecentreAFling ||
      at > copies * count - rowsFromEndsThatRecentreAFling - 1;
    if (loop && flingReachesTheEnds) at = recentre(wheel, at);
    const scrollingByHand = ownTurnTarget.current === null;
    if (scrollingByHand && at !== centred) setCentred(at);
    clearTimeout(settleTimer.current);
    if (!easingTurn.current && !dragRef.current?.moved)
      settleTimer.current = setTimeout(settle, settleWithoutScrollendAfterMs);
  }

  function turnTo(wheel: HTMLDivElement, next: number) {
    if (!loop) next = Math.min(Math.max(next, 0), count - 1);
    else if (nearEnds(next)) {
      const shift = middleCopy * count + wrapIndex(next, count) - next;
      shiftRows(wheel, shift);
      next += shift;
    }
    clearTimeout(settleTimer.current);
    scrollToRow(next, true);
  }

  return {
    centred,
    scrollToRow,
    turnTo,
    heading,
    settle,
    handleScroll,
    interrupt: (wheel: HTMLDivElement) => {
      stopTurn(wheel);
      ownTurnTarget.current = null;
    },
    holdSettling: () => clearTimeout(settleTimer.current),
  };
}
