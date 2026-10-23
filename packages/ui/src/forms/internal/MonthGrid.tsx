'use client';

import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Grid, Row } from '../../foundations/Layout.js';
import { IconButton } from '../../actions/Button.js';
import { ChevronLeft } from '../../icons/ChevronLeft.js';
import { ChevronRight } from '../../icons/ChevronRight.js';
import {
  clampMonth,
  dateFormat,
  formatMonth,
  monthFirstDay,
  monthOfDay,
  now,
  toUtcDate,
} from './CalendarDays.js';

/** The month of the grid that holds its tab stop, where focus goes as the popup opens. */
export function monthGridActive(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-month-picker-month[tabindex="0"]') ?? null;
}

/** A year's months in rows of three. */
const columns = 3;

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
  const grid = useRef<HTMLTableElement>(null);
  const focusActive = useRef(false);
  const thisMonth = monthOfDay(now().day);
  // The active month is the grid's one tab stop; the year that holds it is shown. It follows the
  // chosen month when that changes.
  const [activeState, setActiveState] = useState(() => value ?? thisMonth);
  const [trackedValue, setTrackedValue] = useState(value);
  if (trackedValue !== value) {
    setTrackedValue(value);
    if (value !== undefined) setActiveState(value);
  }
  const active = clampMonth(activeState, min, max);
  const year = Math.floor(active / 12);
  const first = year * 12;

  const formats = useMemo(
    () => ({
      year: dateFormat(locale, { year: 'numeric' }),
      short: dateFormat(locale, { month: 'short' }),
      long: dateFormat(locale, { month: 'long', year: 'numeric' }),
    }),
    [locale],
  );

  useLayoutEffect(() => {
    if (!focusActive.current) return;
    focusActive.current = false;
    monthGridActive(grid.current)?.focus();
  });

  const isUnavailable = (month: number) =>
    (min !== undefined && month < min) || (max !== undefined && month > max);

  function moveTo(month: number, focus: boolean) {
    const next = clampMonth(month, min, max);
    // A key that keeps the month leaves no request behind that would take focus back later.
    if (next === active) return;
    focusActive.current = focus;
    setActiveState(next);
  }

  function choose(month: number) {
    if (isUnavailable(month)) return;
    setActiveState(month);
    onChoose(month);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const column = (active - first) % columns;
    const moves: Record<string, number> = {
      ArrowLeft: active + (rtl ? 1 : -1),
      ArrowRight: active + (rtl ? -1 : 1),
      ArrowUp: active - columns,
      ArrowDown: active + columns,
      Home: active - column,
      End: active + columns - 1 - column,
      PageUp: active - 12,
      PageDown: active + 12,
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

  const previousAvailable = min === undefined || first - 1 >= min;
  const nextAvailable = max === undefined || first + 12 <= max;

  return (
    <Grid gap={2} className="env-month-picker-year">
      <Row align="center" gap={1} className="env-month-picker-header">
        <IconButton
          variant="ghost"
          icon={<ChevronLeft />}
          aria-label={previousYearLabel}
          title={previousYearLabel}
          // Unavailable rather than disabled, so focus stays on the button at the earliest year.
          aria-disabled={!previousAvailable || undefined}
          className="env-month-picker-previous"
          onClick={() => {
            if (previousAvailable) moveTo(active - 12, false);
          }}
        />
        <div className="env-month-picker-heading" id={headingId} aria-live="polite">
          {formats.year.format(toUtcDate(monthFirstDay(first)))}
        </div>
        <IconButton
          variant="ghost"
          icon={<ChevronRight />}
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
                    onFocus={() => {
                      if (month !== active) setActiveState(month);
                    }}
                  >
                    <span className="env-month-picker-month-mark">{formats.short.format(day)}</span>
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
