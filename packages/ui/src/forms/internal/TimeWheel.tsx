'use client';

import { useRef, type KeyboardEvent } from 'react';
import { matchTyped } from '../../internal/time/calendarDays.js';
import { typeaheadTimeout } from '../../internal/typeahead.js';
import { isRightToLeft } from '../../internal/dom/direction.js';
import { flag } from '../../internal/flag.js';
import { useTimeWheelGestures, type TimeWheelDrag } from './useTimeWheelGestures.js';
import { useTimeWheelTurn } from './useTimeWheelTurn.js';
import {
  copiesOf,
  nearestAvailable,
  shownRows,
  wrap,
  type Entry,
  type Part,
} from './timeWheelRows.js';
import '../../styles/Base.css';
import '../../styles/TimeList.css';

// One column of a TimeList: a wheel of hours, minutes or day periods.

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

/**
 * One column of a time list: a spinbutton drawn as a wheel whose middle row is its value. Hours and
 * minutes loop endlessly, their entries repeated with the scroll position moved back to the middle
 * copy near either end; the day periods don't, nor minutes with fewer values than the wheel shows
 * rows, such as every 15 minutes, which would show a value twice. The keys still wrap around them.
 * The row that settles in the middle as scrolling ends is chosen, and an unavailable one gives way
 * to the nearest available. A mouse wheel turns it a row a notch, easing into place, rather than as
 * far as a page would scroll, and a mouse drags it as a finger does.
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
  const dragRef = useRef<TimeWheelDrag | null>(null);
  const typed = useRef({ text: '', at: 0 });
  const count = entries.length;
  // Hours and minutes wrap around under the keys; they loop on the wheel where they fill it.
  const wraps = part !== 'dayPeriod';
  const loop = wraps && count >= shownRows;
  const copies = loop ? copiesOf(count) : 1;
  const currentIndex = Math.max(
    0,
    entries.findIndex((entry) => entry.value === current),
  );
  const turning = useTimeWheelTurn({
    wheelRef,
    dragRef,
    entries,
    currentIndex,
    onChoose,
    loop,
    copies,
  });
  const gestures = useTimeWheelGestures({
    wheelRef,
    dragRef,
    turning,
    loop,
    count,
    copies,
  });
  const { centred, scrollToRow } = turning;

  function step(index: number, direction: 1 | -1) {
    const next = wraps ? wrap(index, count) : Math.min(Math.max(index, 0), count - 1);
    const available = nearestAvailable(entries, next, wraps, direction);
    // An index nearestAvailable found, so an entry.
    if (available !== -1 && available !== currentIndex) onChoose(entries[available].value);
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
      // An index matchTyped found, so an entry.
      if (index !== -1 && index !== currentIndex) onChoose(entries[index].value);
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
    // Hours and minutes wrap around; Page keys stop at the ends of the day periods.
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
      data-part={part === 'dayPeriod' ? 'day-period' : part}
      data-value={entry?.value}
      data-loop={flag(loop)}
      onKeyDown={handleKeyDown}
      onScroll={turning.handleScroll}
      onScrollEnd={turning.settle}
      {...gestures}
      onTouchStart={(event) => turning.interrupt(event.currentTarget)}
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
              data-centered={flag(rowIndex === centred)}
              data-disabled={flag(item.disabled)}
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
