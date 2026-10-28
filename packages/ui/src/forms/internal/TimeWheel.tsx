'use client';

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { matchTyped } from '../../internal/calendarDays.js';
import { prefersReducedMotion } from '../../internal/reducedMotion.js';
import { isRightToLeft } from '../../internal/direction.js';

// One column of a TimeList: a wheel of hours, minutes or day periods.

/** The part of the time a column chooses. */
export type Part = 'hour' | 'minute' | 'dayPeriod';

export interface Entry {
  /** The hour (of the day, or of its half on a 12-hour clock), the minute, or 0 for AM and 1 for PM. */
  value: number;
  label: string;
  disabled: boolean;
  /** What typing names it: digits, or the start of the day period's name. */
  keys: string[];
}

/** How long typed keys keep adding up for typeahead, in milliseconds. */
const typeaheadTimeout = 1000;
/** Page Up and Page Down step this many entries. */
const pageRows = 5;

interface TimeWheelProps {
  ref: (node: HTMLDivElement | null) => void;
  part: Part;
  label: string;
  entries: Entry[];
  /** The entry in the middle: the chosen one, or the time the list starts at without a value. */
  current: number;
  onChoose: (value: number) => void;
  /** Moves focus to the column before (-1) or after (1). */
  onSideways: (direction: -1 | 1) => void;
}

/** How many times a looping wheel repeats its entries: enough rows to scroll on in both ways. */
function copiesOf(count: number) {
  return Math.max(5, 2 * Math.ceil(30 / count) + 1);
}

/** The nearest entry at or around an index, in a direction or either, that can be chosen. */
function nearestAvailable(entries: Entry[], index: number, loop: boolean, direction: 0 | 1 | -1) {
  const count = entries.length;
  for (let distance = 0; distance < count; distance++) {
    for (const sign of direction ? [direction] : [1, -1]) {
      let candidate = index + sign * distance;
      if (loop) candidate = ((candidate % count) + count) % count;
      if (candidate >= 0 && candidate < count && !entries[candidate]!.disabled) return candidate;
    }
  }
  return -1;
}

/**
 * A wheel event of at least this many pixels is one notch of a mouse wheel, which turns the wheel
 * by one row; smaller ones, from a touchpad, turn it by as far as they scroll.
 */
const notchPixels = 50;
/**
 * How quickly a turn eases into its row: each frame closes the distance left with a time constant of
 * this many ms, so quick notches add up to one turn that glides on and settles calmly.
 */
const turnEasing = 90;

/**
 * One column of a time list: a spinbutton drawn as a wheel whose middle row is its value. Hours and
 * minutes loop endlessly, their entries repeated with the scroll position moved back to the middle
 * copy near either end; the day periods don't. The row that settles in the middle as scrolling
 * ends is chosen, and an unavailable one gives way to the nearest available. A mouse wheel turns it
 * a row a notch, easing into place, rather than as far as a page would scroll.
 */
export function TimeWheel({
  ref,
  part,
  label,
  entries,
  current,
  onChoose,
  onSideways,
}: TimeWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shown = useRef<{ current: number; count: number } | null>(null);
  // The row a turn the wheel makes itself is heading for, until it comes to rest.
  const target = useRef<number | null>(null);
  // A turn the wheel is easing through: its scroll position, kept unrounded, and its next frame.
  const turn = useRef<{ position: number; frame: number; time: number } | null>(null);
  // A touchpad's scrolling not yet turned into a whole row, in pixels.
  const wheelRest = useRef(0);
  const loop = part !== 'dayPeriod';
  const count = entries.length;
  const copies = loop ? copiesOf(count) : 1;
  const middleCopy = Math.floor(copies / 2);
  const currentIndex = Math.max(
    0,
    entries.findIndex((entry) => entry.value === current),
  );
  // The row in the middle while it scrolls, which takes the middle row's look.
  const [centred, setCentred] = useState(middleCopy * count + currentIndex);
  // What a wheel settling later, after a pause or a turn, chooses from: the latest render's entries
  // and choice, never those of the render that started it, so a choice made on another wheel in
  // the meantime, such as AM or PM, stays.
  const latest = useRef({ entries, currentIndex, onChoose });
  // The row this wheel chose that the value doesn't show yet: the end of a turn and the end of its
  // scrolling both settle it, and it chooses once.
  const chosenAt = useRef<number | null>(null);
  useLayoutEffect(() => {
    latest.current = { entries, currentIndex, onChoose };
    chosenAt.current = null;
  });

  /** The row height, and the offset of the middle row from the wheel's top. */
  function metrics(wheel: HTMLDivElement) {
    const row = wheel.querySelector<HTMLElement>('.env-time-list-row')?.offsetHeight || 1;
    return { row, offset: (wheel.clientHeight - row) / 2 };
  }

  /** The scroll position that puts a row in the middle. */
  function topOf(wheel: HTMLDivElement, rowIndex: number) {
    const { row, offset } = metrics(wheel);
    return rowIndex * row + (loop ? 0 : offset) - offset;
  }

  /** The row whose middle is at the wheel's middle. */
  function centredRow(wheel: HTMLDivElement) {
    const { row, offset } = metrics(wheel);
    const padding = loop ? 0 : offset;
    return Math.round((wheel.scrollTop + offset - padding) / row);
  }

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
    const goal = topOf(wheel, target.current);
    const elapsed = Math.min(Math.max(time - state.time, 0), 64);
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
      wheel.scrollTo({ top: topOf(wheel, rowIndex), behavior: 'instant' });
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

  /** The row of an entry nearest the middle row, so the wheel turns the short way. */
  function nearestRow(index: number) {
    const wheel = wheelRef.current;
    if (!loop || !wheel) return index;
    const at = target.current ?? centredRow(wheel);
    const base = at - (((at % count) + count) % count);
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
      const at = wheel ? (target.current ?? centredRow(wheel)) : undefined;
      if (at !== undefined && ((at % count) + count) % count === currentIndex) return;
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
    const pixels = rows * metrics(wheel).row;
    wheel.scrollTop += pixels;
    if (turn.current) turn.current.position += pixels;
    if (target.current !== null) target.current += rows;
    setCentred((row) => row + rows);
  }

  /** Moves a looping wheel back to its middle copy, onto the same rows, unseen. */
  function recentre(wheel: HTMLDivElement, at: number) {
    if (!loop || (at >= count && at < (copies - 1) * count)) return at;
    const moved = middleCopy * count + (((at % count) + count) % count);
    shiftRows(wheel, moved - at);
    return moved;
  }

  /** Chooses the entry that settled in the middle, or turns to the nearest available one. */
  function settle() {
    const wheel = wheelRef.current;
    // A turn the wheel is easing through settles once it ends.
    if (!wheel || turn.current) return;
    clearTimeout(settleTimer.current);
    // A turn the wheel makes itself that another one cut short settles nothing; the last settles.
    if (target.current !== null && centredRow(wheel) !== target.current) return;
    target.current = null;
    const { entries: rows, currentIndex: chosen, onChoose: choose } = latest.current;
    const at = recentre(wheel, centredRow(wheel));
    const index = loop ? ((at % count) + count) % count : Math.min(Math.max(at, 0), count - 1);
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
    let at = centredRow(wheel);
    // A long fling that reaches the last rows goes on from the middle copy rather than stopping.
    if (loop && (at < 3 || at > copies * count - 4)) at = recentre(wheel, at);
    if (at !== centred) setCentred(at);
    clearTimeout(settleTimer.current);
    // A browser without scrollend, or one that misses it after snapping, settles on a pause.
    if (!turn.current) settleTimer.current = setTimeout(settle, 200);
  }

  // A mouse wheel turns the wheel a row a notch, and a touchpad as far as it scrolls, easing into
  // place rather than scrolling as fast as a page. The listener is added outside React, whose wheel
  // listeners are passive and can't keep the browser from scrolling on its own.
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    function handleWheel(event: WheelEvent) {
      // Zooming, and scrolling sideways, are left to the browser.
      if (!wheel || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      const { row } = metrics(wheel);
      let rows: number;
      if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
        // Lines or pages: a notch is three lines, as Firefox reports one.
        rows = Math.sign(event.deltaY) * Math.max(1, Math.round(Math.abs(event.deltaY) / 3));
        wheelRest.current = 0;
      } else if (Math.abs(event.deltaY) >= notchPixels) {
        rows = Math.sign(event.deltaY);
        wheelRest.current = 0;
      } else {
        wheelRest.current += event.deltaY;
        rows = Math.trunc(wheelRest.current / row);
        wheelRest.current -= rows * row;
      }
      if (!rows) return;
      let next = (target.current ?? centredRow(wheel)) + rows;
      if (!loop) next = Math.min(Math.max(next, 0), count - 1);
      else if (next < count || next >= (copies - 1) * count) {
        // Far from the middle copy, the wheel moves back to it first, so a long spin never ends.
        const shift = middleCopy * count + (((next % count) + count) % count) - next;
        shiftRows(wheel, shift);
        next += shift;
      }
      clearTimeout(settleTimer.current);
      scrollToRow(next, true);
    }
    wheel.addEventListener('wheel', handleWheel, { passive: false });
    return () => wheel.removeEventListener('wheel', handleWheel);
    // The handler measures the wheel as it runs; it needs adding again only for other rows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, copies]);

  function step(index: number, direction: 1 | -1) {
    let next = index;
    if (loop) next = ((next % count) + count) % count;
    else next = Math.min(Math.max(next, 0), count - 1);
    const available = nearestAvailable(entries, next, loop, direction);
    if (available !== -1 && available !== currentIndex) onChoose(entries[available]!.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const rtl = isRightToLeft(event.currentTarget);
      onSideways((event.key === 'ArrowRight') !== rtl ? 1 : -1);
      return;
    }
    const typeable = part === 'dayPeriod' ? /^\p{L}$/u : /^\d$/;
    if (typeable.test(event.key)) {
      event.preventDefault();
      const key = event.key.toLocaleLowerCase();
      const at = event.timeStamp;
      const text = at - typed.current.at < typeaheadTimeout ? typed.current.text + key : key;
      let index = matchTyped(text, entries);
      let kept = text;
      // Keys that name nothing start over from the last one.
      if (index === -1 && text.length > 1) {
        index = matchTyped(key, entries);
        kept = key;
      }
      typed.current = { text: kept, at };
      if (index !== -1 && index !== currentIndex) onChoose(entries[index]!.value);
      return;
    }
    const moves: Record<string, [number, 1 | -1]> = {
      ArrowDown: [currentIndex + 1, 1],
      ArrowUp: [currentIndex - 1, -1],
      PageDown: [currentIndex + pageRows, 1],
      PageUp: [currentIndex - pageRows, -1],
    };
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      step(event.key === 'Home' ? 0 : count - 1, event.key === 'Home' ? 1 : -1);
      return;
    }
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    // Hours and minutes wrap around; Page keys stop at the ends of a column that doesn't loop.
    step(move[0], move[1]);
  }

  const entry = entries[currentIndex];
  return (
    <div
      ref={(node: HTMLDivElement | null) => {
        wheelRef.current = node;
        ref(node);
      }}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={entry?.value}
      aria-valuemin={entries[0]?.value}
      aria-valuemax={entries[count - 1]?.value}
      aria-valuetext={entry?.label}
      className="env-time-list-column"
      data-part={part}
      data-value={entry?.value}
      data-loop={loop || undefined}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
      onScrollEnd={settle}
      // Someone dragging the wheel, or pressing a row, takes over from a turn it makes itself.
      onPointerDown={(event) => {
        stopTurn(event.currentTarget);
        target.current = null;
      }}
      onTouchStart={(event) => {
        stopTurn(event.currentTarget);
        target.current = null;
      }}
    >
      {Array.from({ length: copies }, (_, copy) =>
        entries.map((item, index) => {
          const rowIndex = copy * count + index;
          return (
            <div
              key={rowIndex}
              // The spinbutton names its value; the rows only draw it.
              aria-hidden="true"
              className="env-time-list-row"
              data-value={item.value}
              data-centred={rowIndex === centred || undefined}
              data-disabled={item.disabled || undefined}
              onClick={() => {
                if (!item.disabled) scrollToRow(rowIndex, true);
              }}
            >
              {item.label}
            </div>
          );
        }),
      )}
    </div>
  );
}
