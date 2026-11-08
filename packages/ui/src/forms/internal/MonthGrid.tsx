'use client';

import { useId, useMemo } from 'react';
import { Grid, Row } from '../../foundations/Layout.js';
import { IconButton } from '../../actions/Button.js';
import { IconChevronLeft } from '../../icons/ChevronLeft.js';
import { IconChevronRight } from '../../icons/ChevronRight.js';
import {
  clampMonth,
  dateFormat,
  formatMonth,
  monthFirstDay,
  monthOfDay,
  now,
  toUtcDate,
} from '../../internal/calendarDays.js';
import { useActiveCell } from './useActiveCell.js';
import '../../styles/Base.css';
import '../../styles/MonthPicker.css';

/** The month of the grid that holds its tab stop, where focus goes as the popup opens. */
export function monthGridActive(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-month-picker-month[tabindex="0"]') ?? null;
}

/** A year's months in rows of three. */
const columns = 3;

/**
 * The short names of a year's months in the format's locale, of one length where the locale makes
 * nearly all of them that long: a longer name of letters alone is cut to it, such as Sept among
 * en-GB's three-letter months, as long as the names stay distinct. Names with punctuation or digits,
 * and a locale whose names vary in length, keep the locale's own.
 */
function shortMonthNames(format: Intl.DateTimeFormat): string[] {
  const names = Array.from({ length: 12 }, (_, month) => format.format(Date.UTC(2001, month, 1)));
  const length = (name: string) => Array.from(name).length;
  const counts = new Map<number, number>();
  for (const name of names) counts.set(length(name), (counts.get(length(name)) ?? 0) + 1);
  const [common, count] = [...counts].reduce((most, entry) => (entry[1] > most[1] ? entry : most));
  if (count < 9) return names;
  const longer = names.filter((name) => length(name) > common);
  if (!longer.every((name) => /^\p{L}+$/u.test(name))) return names;
  const cut = names.map((name) => Array.from(name).slice(0, common).join(''));
  return new Set(cut).size === names.length ? cut : names;
}

export interface MonthGridProps {
  value: number | undefined;
  onChoose: (month: number) => void;
  min: number | undefined;
  max: number | undefined;
  locale: string | undefined;
  previousYearLabel: string;
  nextYearLabel: string;
}

/**
 * A year of months to choose one from, as Calendar's month of days: the arrow keys move by month
 * and row, on into the next or previous year, Page Up and Page Down by year, Home and End to the
 * row's ends, and Enter or Space chooses.
 */
export function MonthGrid({
  value,
  onChoose,
  min,
  max,
  locale,
  previousYearLabel,
  nextYearLabel,
}: MonthGridProps) {
  const headingId = useId();
  const thisMonth = monthOfDay(now().day);
  const isUnavailable = (month: number) =>
    (min !== undefined && month < min) || (max !== undefined && month > max);
  // The active month is the grid's one tab stop; the year that holds it is shown.
  const { active, grid, moveTo, choose, handleKeyDown, focusCell } = useActiveCell({
    chosen: value,
    initial: () => thisMonth,
    clamp: (month) => clampMonth(month, min, max),
    isUnavailable,
    onChoose,
    moves: (month, _event, rtl) => {
      const column = (month - Math.floor(month / 12) * 12) % columns;
      return {
        ArrowLeft: month + (rtl ? 1 : -1),
        ArrowRight: month + (rtl ? -1 : 1),
        ArrowUp: month - columns,
        ArrowDown: month + columns,
        Home: month - column,
        End: month + columns - 1 - column,
        PageUp: month - 12,
        PageDown: month + 12,
      };
    },
  });
  const year = Math.floor(active / 12);
  const first = year * 12;

  const formats = useMemo(
    () => ({
      year: dateFormat(locale, { year: 'numeric' }),
      short: shortMonthNames(dateFormat(locale, { month: 'short' })),
      long: dateFormat(locale, { month: 'long', year: 'numeric' }),
    }),
    [locale],
  );

  const previousAvailable = min === undefined || first - 1 >= min;
  const nextAvailable = max === undefined || first + 12 <= max;

  return (
    <Grid gap={2} className="env-month-picker-year">
      <Row align="center" gap={1} className="env-month-picker-header">
        <IconButton
          variant="ghost"
          icon={<IconChevronLeft />}
          aria-label={previousYearLabel}
          title={previousYearLabel}
          // Unavailable rather than disabled, so focus stays on the button at the earliest year.
          aria-disabled={!previousAvailable || undefined}
          className="env-month-picker-previous"
          onClick={() => {
            if (previousAvailable) moveTo(active - 12, false);
          }}
        />
        <div className="env-month-picker-title" id={headingId} aria-live="polite">
          {formats.year.format(toUtcDate(monthFirstDay(first)))}
        </div>
        <IconButton
          variant="ghost"
          icon={<IconChevronRight />}
          aria-label={nextYearLabel}
          title={nextYearLabel}
          aria-disabled={!nextAvailable || undefined}
          className="env-month-picker-next"
          onClick={() => {
            if (nextAvailable) moveTo(active + 12, false);
          }}
        />
      </Row>
      <table
        ref={grid}
        role="grid"
        aria-labelledby={headingId}
        className="env-month-picker-grid"
        onKeyDown={handleKeyDown}
      >
        <tbody>
          {Array.from({ length: 12 / columns }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, column) => {
                const month = first + row * columns + column;
                const unavailable = isUnavailable(month);
                const day = toUtcDate(monthFirstDay(month));
                return (
                  <td
                    key={month}
                    className="env-month-picker-month"
                    tabIndex={month === active ? 0 : -1}
                    aria-label={formats.long.format(day)}
                    aria-selected={month === value || undefined}
                    aria-current={month === thisMonth ? 'date' : undefined}
                    aria-disabled={unavailable || undefined}
                    data-month={formatMonth(month)}
                    // A press on an unavailable month leaves focus where it was.
                    onMouseDown={unavailable ? (event) => event.preventDefault() : undefined}
                    onClick={() => choose(month)}
                    onFocus={() => focusCell(month)}
                  >
                    <span className="env-month-picker-month-mark">
                      {formats.short[month - first]}
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
