'use client';

import { useId, useMemo, type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react';
import { Slot } from '../internal/layout/Slot.js';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../layout/Layout.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { useHydrated } from '../internal/react/useHydrated.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { useResolvedLocale } from '../internal/provider/locale.js';
import { calendar as calendarMessages } from '../foundations/messages/calendar.js';
import { IconButton } from '../actions/Button.js';
import { IconChevronLeft } from '../icons/ChevronLeft.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
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
} from '../internal/time/calendarDays.js';
import { useActiveCell } from './internal/useActiveCell.js';
import { useRowControlNaming } from '../internal/field/rowControl.js';
import '../styles/Base.css';
import '../styles/Calendar.css';

export type { Weekday } from '../internal/time/calendarDays.js';

/** What a calendar's renderDay receives about the day beside its date. */
export interface CalendarDayState {
  /** The day's number as the calendar shows it, in the locale's digits, such as 14. */
  number: string;
  /** The day is the chosen one. */
  selected: boolean;
  /** The day is today. */
  today: boolean;
  /** The day can't be chosen, from min, max or isDateUnavailable. */
  unavailable: boolean;
}

export interface CalendarProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange' | 'children'
> {
  /** The chosen day as YYYY-MM-DD, or null for none. */
  value?: string | null;
  /** The day an uncontrolled calendar starts with; none by default, which shows today's month. */
  defaultValue?: string | null;
  /** Receives the chosen day as YYYY-MM-DD. */
  onValueChange?: (value: string) => void;
  /** The earliest day that can be chosen, as YYYY-MM-DD; earlier days are unavailable. */
  min?: string;
  /** The latest day that can be chosen, as YYYY-MM-DD; later days are unavailable. */
  max?: string;
  /**
   * Whether a day, as YYYY-MM-DD, can't be chosen, such as a weekend, a holiday or a booked day; it
   * shows dimmed and reports aria-disabled, as days outside min and max do, and the keyboard still
   * moves onto it.
   */
  isDateUnavailable?: (day: string) => boolean;
  /**
   * The content of a day's mark in place of its number, such as the number with a dot under it
   * for a day with events, or a price; it receives the day as YYYY-MM-DD and its state. The cell
   * keeps its role, its name, the full date, and its keyboard handling.
   * @default the day's number
   */
  renderDay?: (day: string, state: CalendarDayState) => ReactNode;
  /**
   * The first day of each week, from 0 for Sunday to 6 for Saturday.
   * @default the locale's, or Monday where the browser cannot tell
   */
  weekStart?: Weekday;
  /**
   * The locale of the month and weekday names and the day numbers: EnvUIProvider's, else the
   * browser's. The days are always Gregorian, also in a locale with a calendar of its own.
   */
  locale?: string;
  /**
   * Accessible name of the previous month button.
   * @default 'Previous month', or EnvUIProvider's messages.calendar.previousMonth
   */
  previousMonthLabel?: string;
  /**
   * Accessible name of the next month button.
   * @default 'Next month', or EnvUIProvider's messages.calendar.nextMonth
   */
  nextMonthLabel?: string;
}

/**
 * The day of a calendar that holds its tab stop, the day focus goes to as the calendar opens in a
 * popup, such as DatePicker's.
 */
export function calendarActiveDay(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-calendar-day[tabindex="0"]') ?? null;
}

const weeksThatFitAnyMonth = 6;

const firstSundayAfterEpoch = 3;

function unavailableButFocusable(available: boolean) {
  return !available || undefined;
}

function keepFocusWhereItWas(event: MouseEvent) {
  event.preventDefault();
}

function firstGraphemes(text: string, count: number) {
  const Segmenter = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  const graphemes = Segmenter
    ? Array.from(
        new Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
        (part) => part.segment,
      )
    : Array.from(text);
  return graphemes.slice(0, count).join('');
}

function shortestDistinctWeekdayNames(short: string[], narrow: string[]) {
  const distinct = (names: string[]) => new Set(names).size === names.length;
  const twoLetters = short.map((name) => firstGraphemes(name.replace(/\.$/, ''), 2));
  if (distinct(twoLetters)) return twoLetters;
  if (distinct(narrow)) return narrow;
  return short;
}

/**
 * A month of days to choose one from, following the WAI-ARIA date picker grid: the arrow keys move
 * by day and week, Page Up and Page Down by month (with Shift, by year), Home and End to the week's
 * ends, and Enter or Space chooses the day. Named with aria-label or aria-labelledby, or by the
 * List.Item whose control it is, it is a group around the month's grid.
 */
export function Calendar({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  isDateUnavailable,
  renderDay,
  weekStart,
  locale,
  previousMonthLabel,
  nextMonthLabel,
  className,
  ...props
}: CalendarProps) {
  const messages = useMessages('calendar', calendarMessages);
  const previousName = previousMonthLabel ?? messages.previousMonth;
  const nextName = nextMonthLabel ?? messages.nextMonth;
  const headingId = useId();
  const [selectedValue, chooseValue] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const selectedDay = parseDay(selectedValue);
  const minDay = parseDay(min);
  const maxDay = parseDay(max);
  const hydrated = useHydrated();
  const shownLocale = useResolvedLocale(locale);
  const today = hydrated ? now().day : undefined;
  const localeStart = useMemo(() => localeWeekStart(shownLocale), [shownLocale]);
  const firstWeekday = weekStart ?? localeStart;

  const isUnavailable = (day: number) =>
    (minDay !== undefined && day < minDay) ||
    (maxDay !== undefined && day > maxDay) ||
    isDateUnavailable?.(formatDay(day)) === true;
  const { active, grid, moveTo, choose, handleKeyDown, focusCell } = useActiveCell({
    chosen: selectedDay,
    initial: () => now().day,
    clamp: (day) => clampDay(day, minDay, maxDay),
    isUnavailable,
    onChoose: (day) => chooseValue(formatDay(day)),
    moves: (day, event, rtl) => {
      const column = (dayParts(day).weekday - firstWeekday + 7) % 7;
      return {
        ArrowLeft: day + (rtl ? 1 : -1),
        ArrowRight: day + (rtl ? -1 : 1),
        ArrowUp: day - 7,
        ArrowDown: day + 7,
        Home: day - column,
        End: day + 6 - column,
        PageUp: addMonths(day, event.shiftKey ? -12 : -1),
        PageDown: addMonths(day, event.shiftKey ? 12 : 1),
      };
    },
  });
  const monthKnownWithoutClock = selectedDay !== undefined;
  const daysShown = hydrated || monthKnownWithoutClock;

  const formats = useMemo(
    () => ({
      day: dateFormat(shownLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      month: dateFormat(shownLocale, { month: 'long', year: 'numeric' }),
      weekday: dateFormat(shownLocale, { weekday: 'short' }),
      weekdayNarrow: dateFormat(shownLocale, { weekday: 'narrow' }),
      weekdayName: dateFormat(shownLocale, { weekday: 'long' }),
      number: new Intl.NumberFormat(shownLocale, { useGrouping: false }),
    }),
    [shownLocale],
  );

  const first = monthStart(active);
  const shownMonth = dayParts(first).month;
  const gridStart = first - ((dayParts(first).weekday - firstWeekday + 7) % 7);
  const previousAvailable = !daysShown || minDay === undefined || first - 1 >= minDay;
  const nextMonth = addMonths(first, 1);
  const nextAvailable = !daysShown || maxDay === undefined || nextMonth <= maxDay;
  const weekdays = useMemo(() => {
    const samples = Array.from({ length: 7 }, (_, column) =>
      toUtcDate(firstSundayAfterEpoch + ((firstWeekday + column) % 7)),
    );
    const names = shortestDistinctWeekdayNames(
      samples.map((sample) => formats.weekday.format(sample)),
      samples.map((sample) => formats.weekdayNarrow.format(sample)),
    );
    return samples.map((sample, column) => ({
      name: names[column],
      long: formats.weekdayName.format(sample),
    }));
  }, [formats, firstWeekday]);
  const naming = useRowControlNaming(props);
  const named =
    props['aria-label'] != null ||
    props['aria-labelledby'] != null ||
    naming['aria-labelledby'] != null;

  return (
    <Grid
      gap={2}
      role={named ? 'group' : undefined}
      {...props}
      {...naming}
      className={classNames('env-calendar', className)}
    >
      <Row align="center" gap={1} className="env-calendar-header">
        <IconButton
          variant="ghost"
          icon={<IconChevronLeft />}
          aria-label={previousName}
          title={previousName}
          aria-disabled={unavailableButFocusable(previousAvailable)}
          className="env-calendar-previous"
          onClick={() => {
            if (previousAvailable) moveTo(addMonths(active, -1), false);
          }}
        />
        <div
          className="env-calendar-title"
          id={headingId}
          aria-live={daysShown ? 'polite' : undefined}
        >
          {daysShown ? formats.month.format(toUtcDate(first)) : null}
        </div>
        <IconButton
          variant="ghost"
          icon={<IconChevronRight />}
          aria-label={nextName}
          title={nextName}
          aria-disabled={unavailableButFocusable(nextAvailable)}
          className="env-calendar-next"
          onClick={() => {
            if (nextAvailable) moveTo(addMonths(active, 1), false);
          }}
        />
      </Row>
      <table
        ref={grid}
        role="grid"
        aria-labelledby={headingId}
        className="env-calendar-grid"
        onKeyDown={handleKeyDown}
      >
        <thead>
          <tr>
            {weekdays.map(({ name, long }) => (
              <th key={long} scope="col" abbr={long}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: weeksThatFitAnyMonth }, (_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }, (_, column) => {
                const day = gridStart + week * 7 + column;
                const outsideShownMonth = !daysShown || dayParts(day).month !== shownMonth;
                if (outsideShownMonth) return <td key={day} className="env-calendar-pad" />;
                const unavailable = isUnavailable(day);
                const number = formats.number.format(dayParts(day).date);
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
                    onMouseDown={unavailable ? keepFocusWhereItWas : undefined}
                    onClick={() => choose(day)}
                    onFocus={() => focusCell(day)}
                  >
                    <span className="env-calendar-day-mark">
                      {renderDay ? (
                        <Slot className="env-calendar-day-content" element="span">
                          {renderDay(formatDay(day), {
                            number,
                            selected: day === selectedDay,
                            today: day === today,
                            unavailable,
                          })}
                        </Slot>
                      ) : (
                        number
                      )}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Grid>
  );
}
