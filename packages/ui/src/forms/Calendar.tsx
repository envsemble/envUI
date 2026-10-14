import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { IconButton } from '../actions/Button.js';
import { ChevronLeft } from '../icons/ChevronLeft.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import {
  addMonths,
  clampDay,
  dateFormat,
  dayParts,
  formatDay,
  localeWeekStart,
  monthStart,
  now,
  parseDay,
  toUtcDate,
  type Weekday,
} from './internal/CalendarDays.js';

export type { Weekday } from './internal/CalendarDays.js';

export interface CalendarProps
  extends Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange' | 'children'> {
  /** The chosen day as YYYY-MM-DD, or null for none. */
  value?: string | null;
  defaultValue?: string | null;
  /** Receives the chosen day as YYYY-MM-DD. */
  onValueChange?: (value: string) => void;
  /** The earliest day that can be chosen, as YYYY-MM-DD; earlier days are unavailable. */
  min?: string;
  /** The latest day that can be chosen, as YYYY-MM-DD; later days are unavailable. */
  max?: string;
  /**
   * The first day of each week, from 0 for Sunday to 6 for Saturday: by default the locale's, or
   * Monday where the browser cannot tell.
   */
  weekStart?: Weekday;
  /**
   * The locale of the month and weekday names and the day numbers; the browser's by default. The
   * days are always Gregorian, also in a locale with a calendar of its own.
   */
  locale?: string;
  /** Accessible name of the previous month button; Previous month by default. */
  previousMonthLabel?: string;
  /** Accessible name of the next month button; Next month by default. */
  nextMonthLabel?: string;
}

/** Six weeks always fit a month, so the calendar keeps its height from month to month. */
const weeksShown = 6;

/**
 * A month of days to choose one from, following the WAI-ARIA date picker grid: the arrow keys move
 * by day and week, Page Up and Page Down by month (with Shift, by year), Home and End to the week's
 * ends, and Enter or Space chooses the day.
 */
export function Calendar({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  weekStart,
  locale,
  previousMonthLabel = 'Previous month',
  nextMonthLabel = 'Next month',
  className,
  ...props
}: CalendarProps) {
  const headingId = useId();
  const grid = useRef<HTMLTableElement>(null);
  const focusActive = useRef(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selectedDay = parseDay(value === undefined ? uncontrolledValue : value);
  const minDay = parseDay(min);
  const maxDay = parseDay(max);
  const today = now().day;
  const localeStart = useMemo(() => localeWeekStart(locale), [locale]);
  const firstWeekday = weekStart ?? localeStart;

  // The active day is the grid's one tab stop; the month that holds it is shown. It follows the
  // chosen day when that changes.
  const [activeState, setActiveState] = useState(() => selectedDay ?? today);
  const [trackedDay, setTrackedDay] = useState(selectedDay);
  if (trackedDay !== selectedDay) {
    setTrackedDay(selectedDay);
    if (selectedDay !== undefined) setActiveState(selectedDay);
  }
  const active = clampDay(activeState, minDay, maxDay);

  const formats = useMemo(
    () => ({
      day: dateFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      month: dateFormat(locale, { month: 'long', year: 'numeric' }),
      weekday: dateFormat(locale, { weekday: 'short' }),
      weekdayName: dateFormat(locale, { weekday: 'long' }),
      number: new Intl.NumberFormat(locale, { useGrouping: false }),
    }),
    [locale],
  );

  useLayoutEffect(() => {
    if (!focusActive.current) return;
    focusActive.current = false;
    grid.current?.querySelector<HTMLElement>('td[tabindex="0"]')?.focus();
  });

  const isUnavailable = (day: number) =>
    (minDay !== undefined && day < minDay) || (maxDay !== undefined && day > maxDay);

  function moveTo(day: number, focus: boolean) {
    const next = clampDay(day, minDay, maxDay);
    // A key that keeps the day, such as Home on the week's first day, has nothing to render, so it
    // leaves no request behind that would take focus back at some later render.
    if (next === active) return;
    focusActive.current = focus;
    setActiveState(next);
  }

  function choose(day: number) {
    if (isUnavailable(day)) return;
    setActiveState(day);
    const chosen = formatDay(day);
    if (value === undefined) setUncontrolledValue(chosen);
    onValueChange?.(chosen);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const column = (dayParts(active).weekday - firstWeekday + 7) % 7;
    const moves: Record<string, number> = {
      ArrowLeft: active + (rtl ? 1 : -1),
      ArrowRight: active + (rtl ? -1 : 1),
      ArrowUp: active - 7,
      ArrowDown: active + 7,
      Home: active - column,
      End: active + 6 - column,
      PageUp: addMonths(active, event.shiftKey ? -12 : -1),
      PageDown: addMonths(active, event.shiftKey ? 12 : 1),
    };
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(active);
      return;
    }
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    moveTo(next, true);
  }

  const first = monthStart(active);
  const shownMonth = dayParts(first).month;
  const gridStart = first - ((dayParts(first).weekday - firstWeekday + 7) % 7);
  const previousAvailable = minDay === undefined || first - 1 >= minDay;
  const nextMonth = addMonths(first, 1);
  const nextAvailable = maxDay === undefined || nextMonth <= maxDay;
  const weekdays = Array.from({ length: 7 }, (_, column) => {
    // 1970-01-04, day 3, was a Sunday.
    const sample = toUtcDate(3 + ((firstWeekday + column) % 7));
    return { short: formats.weekday.format(sample), long: formats.weekdayName.format(sample) };
  });

  return (
    <div {...props} className={classNames('env-calendar', className)}>
      <div className="env-calendar-header">
        <IconButton
          variant="text"
          icon={<ChevronLeft />}
          aria-label={previousMonthLabel}
          title={previousMonthLabel}
          // Unavailable rather than disabled, so focus stays on the button at the earliest month.
          aria-disabled={!previousAvailable || undefined}
          className="env-calendar-previous"
          onClick={() => {
            if (previousAvailable) moveTo(addMonths(active, -1), false);
          }}
        />
        <div className="env-calendar-heading" id={headingId} aria-live="polite">
          {formats.month.format(toUtcDate(first))}
        </div>
        <IconButton
          variant="text"
          icon={<ChevronRight />}
          aria-label={nextMonthLabel}
          title={nextMonthLabel}
          aria-disabled={!nextAvailable || undefined}
          className="env-calendar-next"
          onClick={() => {
            if (nextAvailable) moveTo(addMonths(active, 1), false);
          }}
        />
      </div>
      <table
        ref={grid}
        role="grid"
        aria-labelledby={headingId}
        className="env-calendar-grid"
        onKeyDown={handleKeyDown}
      >
        <thead>
          <tr>
            {weekdays.map(({ short, long }) => (
              <th key={long} scope="col" abbr={long}>
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: weeksShown }, (_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }, (_, column) => {
                const day = gridStart + week * 7 + column;
                if (dayParts(day).month !== shownMonth)
                  return <td key={day} className="env-calendar-pad" aria-hidden="true" />;
                const unavailable = isUnavailable(day);
                return (
                  <td
                    key={day}
                    className="env-calendar-day"
                    tabIndex={day === active ? 0 : -1}
                    aria-label={formats.day.format(toUtcDate(day))}
                    aria-selected={day === selectedDay || undefined}
                    aria-current={day === today ? 'date' : undefined}
                    aria-disabled={unavailable || undefined}
                    data-date={formatDay(day)}
                    // A press on an unavailable day leaves focus where it was.
                    onMouseDown={unavailable ? (event) => event.preventDefault() : undefined}
                    onClick={() => {
                      if (unavailable) return;
                      choose(day);
                    }}
                    onFocus={() => {
                      if (day !== active) setActiveState(day);
                    }}
                  >
                    <span className="env-calendar-day-mark">
                      {formats.number.format(dayParts(day).date)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
