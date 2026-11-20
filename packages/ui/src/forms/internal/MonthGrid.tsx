'use client';

import { useId, useMemo } from 'react';
import { Grid, Row } from '../../layout/Layout.js';
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
} from './calendarDays.js';
import { useActiveCell } from './useActiveCell.js';
import '../../styles/Base.css';
import '../../styles/MonthPicker.css';

export function monthGridActive(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-month-picker-month[tabindex="0"]') ?? null;
}

const monthsPerRow = 3;

const keepFocusWhereItWas = (event: { preventDefault: () => void }) => event.preventDefault();

function shortMonthNames(format: Intl.DateTimeFormat): string[] {
  const names = Array.from({ length: 12 }, (_, month) => format.format(Date.UTC(2001, month, 1)));
  const length = (name: string) => Array.from(name).length;
  const counts = new Map<number, number>();
  for (const name of names) counts.set(length(name), (counts.get(length(name)) ?? 0) + 1);
  const [common, count] = [...counts].reduce((most, entry) => (entry[1] > most[1] ? entry : most));
  const nearlyAllShareOneLength = count >= 9;
  if (!nearlyAllShareOneLength) return names;
  const longer = names.filter((name) => length(name) > common);
  const longerAreLettersAlone = longer.every((name) => /^\p{L}+$/u.test(name));
  if (!longerAreLettersAlone) return names;
  const cut = names.map((name) => Array.from(name).slice(0, common).join(''));
  const cutNamesStayDistinct = new Set(cut).size === names.length;
  return cutNamesStayDistinct ? cut : names;
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
  const { active, grid, moveTo, choose, handleKeyDown, focusCell } = useActiveCell({
    chosen: value,
    initial: () => thisMonth,
    clamp: (month) => clampMonth(month, min, max),
    isUnavailable,
    onChoose,
    moves: (month, _event, rtl) => {
      const column = (month - Math.floor(month / 12) * 12) % monthsPerRow;
      return {
        ArrowLeft: month + (rtl ? 1 : -1),
        ArrowRight: month + (rtl ? -1 : 1),
        ArrowUp: month - monthsPerRow,
        ArrowDown: month + monthsPerRow,
        Home: month - column,
        End: month + monthsPerRow - 1 - column,
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
          {Array.from({ length: 12 / monthsPerRow }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: monthsPerRow }, (_, column) => {
                const month = first + row * monthsPerRow + column;
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
                    onMouseDown={unavailable ? keepFocusWhereItWas : undefined}
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
