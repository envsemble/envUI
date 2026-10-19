'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { useResolvedLocale } from '../../internal/useFormatters.js';
import { timePicker as timePickerMessages } from '../../foundations/messages/timePicker.js';
import {
  dateFormat,
  matchTyped,
  minuteStepOf,
  minuteSteps,
  now,
  roundToStep,
  toUtcDate,
} from './CalendarDays.js';

export interface TimeListProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'onChange'> {
  /** The chosen time as minutes after midnight, or undefined for none. */
  value: number | undefined;
  /** Receives the chosen time as minutes after midnight. */
  onValueChange: (minutes: number) => void;
  /** The minutes between the minute column's entries, from 1 to 60; 15 by default. */
  minuteStep?: number;
  /** The earliest time that can be chosen, as minutes after midnight. */
  min?: number;
  /** The latest time that can be chosen, as minutes after midnight. */
  max?: number;
  /**
   * The time a choice in one column completes while there is no value, as minutes after midnight;
   * the current time on the minute step by default.
   */
  start?: number;
  /** The locale the times are written in, with its own 12- or 24-hour clock. */
  locale?: string;
}

type Part = 'hour' | 'minute' | 'dayPeriod';

interface Entry {
  /** The hour (of the day, or of its half on a 12-hour clock), the minute, or 0 for AM and 1 for PM. */
  value: number;
  label: string;
  disabled: boolean;
  /** What typing names it: digits, or the start of the day period's name. */
  keys: string[];
}

/** Typed keys run together while each follows the last within this many ms. */
const typingPause = 1000;
/** Page Up and Page Down step this many entries. */
const pageRows = 5;

/** The first column of a time list, where focus goes as a popup with the list opens. */
export function timeListFirstColumn(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-time-list-column') ?? null;
}

const pad = (number: number) => String(number).padStart(2, '0');

/** Whether any minute from `from` through `to` lies within min and max. */
function overlaps(from: number, to: number, min: number | undefined, max: number | undefined) {
  return (min === undefined || to >= min) && (max === undefined || from <= max);
}

/**
 * A time of day to choose on wheels side by side, each a spinbutton: the hours, the minutes every
 * `minuteStep`, and on a 12-hour clock the day's halves, in the order the locale writes them. The
 * middle rows, each on its own fill, read as the time, and turning any wheel chooses the whole time.
 * On a wheel the arrow keys step by one, wrapping around, Page Up and Page Down by five, Home and
 * End to its ends, and digits or a day period's first letter to the entry they name; Left and Right
 * move between the wheels. Name the group with aria-label or aria-labelledby.
 */
export function TimeList({
  value,
  onValueChange,
  minuteStep,
  min,
  max,
  start,
  locale,
  className,
  ...props
}: TimeListProps) {
  const messages = useMessages('timePicker', timePickerMessages);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const shownLocale = useResolvedLocale(locale);
  const step = minuteStepOf(minuteStep);
  // Times are wall-clock minutes, formatted in UTC so no zone shifts them, on the locale's clock.
  const clock = useMemo(() => {
    const format = dateFormat(shownLocale, { timeStyle: 'short' });
    const cycle = format.resolvedOptions().hourCycle;
    const partOf = (minutes: number, type: Part) =>
      format.formatToParts(toUtcDate(0, minutes)).find((part) => part.type === type)?.value ?? '';
    const hour12 = cycle === 'h11' || cycle === 'h12';
    const order = [
      ...new Set(
        format
          .formatToParts(toUtcDate(0, 13 * 60))
          .map((part) => part.type)
          .filter((type): type is Part => ['hour', 'minute', 'dayPeriod'].includes(type)),
      ),
    ];
    return {
      hour12,
      order: hour12 ? order : order.filter((part) => part !== 'dayPeriod'),
      hourLabel: (hour: number) => partOf(hour * 60, 'hour'),
      minuteLabel: (minute: number) => partOf(minute, 'minute'),
      // The first hour of each half, so a locale that names parts of the day names the halves.
      periodLabels: [partOf(60, 'dayPeriod'), partOf(13 * 60, 'dayPeriod')],
      cycle,
    };
  }, [shownLocale]);

  // Without a value, a choice in one column completes the time the others show.
  const [startState] = useState(() => roundToStep(now().minutes, step));
  const base = value ?? start ?? startState;
  const [baseHour, baseMinute] = [Math.floor(base / 60), base % 60];
  const basePeriod = baseHour < 12 ? 0 : 1;

  const hours = clock.hour12
    ? Array.from({ length: 12 }, (_, hour): Entry => {
        const hour24 = basePeriod * 12 + hour;
        const shown = clock.cycle === 'h11' ? hour : hour || 12;
        return {
          value: hour,
          label: clock.hourLabel(hour24),
          disabled: !overlaps(hour24 * 60, hour24 * 60 + 59, min, max),
          keys: [String(shown), pad(shown)],
        };
      })
    : Array.from(
        { length: 24 },
        (_, hour): Entry => ({
          value: hour,
          label: clock.hourLabel(hour),
          disabled: !overlaps(hour * 60, hour * 60 + 59, min, max),
          keys: [pad(hour), String(hour)],
        }),
      );
  const minutes = minuteSteps(step, value === undefined ? undefined : baseMinute).map(
    (minute): Entry => ({
      value: minute,
      label: clock.minuteLabel(minute),
      disabled: !overlaps(baseHour * 60 + minute, baseHour * 60 + minute, min, max),
      keys: [pad(minute)],
    }),
  );
  const periods = [0, 1].map(
    (period): Entry => ({
      value: period,
      label: clock.periodLabels[period]!,
      disabled: !overlaps(period * 720, period * 720 + 719, min, max),
      keys: [clock.periodLabels[period]!.toLocaleLowerCase(shownLocale), period ? 'p' : 'a'],
    }),
  );

  const columns: Record<
    Part,
    { label: string; entries: Entry[]; current: number; compose: (v: number) => number }
  > = {
    hour: {
      label: messages.hours,
      entries: hours,
      current: clock.hour12 ? baseHour % 12 : baseHour,
      compose: (hour) => (clock.hour12 ? basePeriod * 12 + hour : hour) * 60 + baseMinute,
    },
    minute: {
      label: messages.minutes,
      entries: minutes,
      current: baseMinute,
      compose: (minute) => baseHour * 60 + minute,
    },
    dayPeriod: {
      label: messages.dayPeriod,
      entries: periods,
      current: basePeriod,
      compose: (period) => (period * 12 + (baseHour % 12)) * 60 + baseMinute,
    },
  };

  function focusColumn(index: number) {
    columnsRef.current[index]?.focus();
  }

  return (
    <div
      role="group"
      {...props}
      className={classNames('env-time-list', className)}
      data-columns={clock.order.length}
    >
      {clock.order.map((part, index) => {
        const column = columns[part];
        return (
          <TimeWheel
            key={part}
            ref={(node) => {
              columnsRef.current[index] = node;
            }}
            part={part}
            label={column.label}
            entries={column.entries}
            current={column.current}
            onChoose={(chosen) => {
              // A wheel that settles on the time already shown leaves the value as it is.
              if (value !== undefined || chosen !== column.current)
                onValueChange(column.compose(chosen));
            }}
            onSideways={(direction) => focusColumn(index + direction)}
          />
        );
      })}
    </div>
  );
}

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

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * One column of a time list: a spinbutton drawn as a wheel whose middle row is its value. Hours and
 * minutes loop endlessly, their entries repeated with the scroll position moved back to the middle
 * copy near either end; the day periods don't. The row that settles in the middle as scrolling
 * ends is chosen, and an unavailable one gives way to the nearest available.
 */
function TimeWheel({ ref, part, label, entries, current, onChoose, onSideways }: TimeWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shown = useRef<{ current: number; count: number } | null>(null);
  // The row a turn the wheel makes itself is heading for, until it comes to rest.
  const target = useRef<number | null>(null);
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

  /** The row height, and the offset of the middle row from the wheel's top. */
  function metrics(wheel: HTMLDivElement) {
    const row = wheel.querySelector<HTMLElement>('.env-time-list-row')?.offsetHeight || 1;
    return { row, offset: (wheel.clientHeight - row) / 2 };
  }

  /** The row whose middle is at the wheel's middle. */
  function centredRow(wheel: HTMLDivElement) {
    const { row, offset } = metrics(wheel);
    const padding = loop ? 0 : offset;
    return Math.round((wheel.scrollTop + offset - padding) / row);
  }

  function scrollToRow(rowIndex: number, smooth: boolean) {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const { row, offset } = metrics(wheel);
    const padding = loop ? 0 : offset;
    target.current = rowIndex;
    wheel.scrollTo({
      top: rowIndex * row + padding - offset,
      behavior: smooth && !reducedMotion() ? 'smooth' : 'instant',
    });
    setCentred(rowIndex);
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

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  /** Chooses the entry that settled in the middle, or turns to the nearest available one. */
  /**
   * Moves a looping wheel back to its middle copy, onto the same rows, unseen. It waits for the
   * wheel to come to rest, as moving it mid-turn would stop a smooth turn short.
   */
  function recentre(wheel: HTMLDivElement, at: number) {
    if (!loop || (at >= count && at < (copies - 1) * count)) return at;
    const moved = middleCopy * count + (((at % count) + count) % count);
    wheel.scrollTop += (moved - at) * metrics(wheel).row;
    setCentred(moved);
    return moved;
  }

  function settle() {
    const wheel = wheelRef.current;
    if (!wheel) return;
    clearTimeout(settleTimer.current);
    // A turn the wheel makes itself that another one cut short settles nothing; the last settles.
    if (target.current !== null && centredRow(wheel) !== target.current) return;
    target.current = null;
    const at = recentre(wheel, centredRow(wheel));
    const index = loop ? ((at % count) + count) % count : Math.min(Math.max(at, 0), count - 1);
    const available = nearestAvailable(entries, index, loop, 0);
    if (available === -1) return;
    if (available !== index) {
      scrollToRow(loop ? at + (available - index) : available, true);
      return;
    }
    if (index !== currentIndex) onChoose(entries[index]!.value);
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
    settleTimer.current = setTimeout(settle, 200);
  }

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
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      onSideways((event.key === 'ArrowRight') !== rtl ? 1 : -1);
      return;
    }
    const typeable = part === 'dayPeriod' ? /^\p{L}$/u : /^\d$/;
    if (typeable.test(event.key)) {
      event.preventDefault();
      const key = event.key.toLocaleLowerCase();
      const at = event.timeStamp;
      const text = at - typed.current.at < typingPause ? typed.current.text + key : key;
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
      // Someone turning the wheel takes over from a turn it makes itself.
      onWheel={() => {
        target.current = null;
      }}
      onPointerDown={() => {
        target.current = null;
      }}
      onTouchStart={() => {
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
