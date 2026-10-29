'use client';

import { useMemo, useState } from 'react';
import { useMessages } from '../internal/EnvUIContext.js';
import { useResolvedLocale } from '../internal/useFormatters.js';
import { monthPicker as monthPickerMessages } from '../foundations/messages/monthPicker.js';
import { Button } from '../actions/Button.js';
import { IconCalendarMonth } from '../icons/CalendarMonth.js';
import { MonthGrid, monthGridActive } from './internal/MonthGrid.js';
import { PickerField, usePickerOpen, type PickerFieldProps } from './internal/PickerField.js';
import {
  clampMonth,
  dateFormat,
  formatMonth,
  monthFirstDay,
  monthOfDay,
  now,
  parseMonth,
  toUtcDate,
} from '../internal/calendarDays.js';
import '../styles/Base.css';
import '../styles/DatePicker.css';

export interface MonthPickerProps extends PickerFieldProps {
  /** The value: a month as YYYY-MM. null, or an empty string, for none. */
  value?: string | null;
  /** The value an uncontrolled field starts with, and that a form reset restores; none by default. */
  defaultValue?: string | null;
  /** Receives the new value as YYYY-MM, or null once the field is cleared. */
  onValueChange?: (value: string | null) => void;
  /** The earliest month, as YYYY-MM; earlier months are unavailable. */
  min?: string;
  /** The latest month, as YYYY-MM; later months are unavailable. */
  max?: string;
  /**
   * The locale of the shown value and the month names: EnvUIProvider's, else the browser's. Months
   * are Gregorian, also in a locale with a calendar of its own.
   */
  locale?: string;
  /**
   * How the field shows the value: Intl.DateTimeFormat options, by default the long month and the
   * year, in the Gregorian calendar unless they name another.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  /**
   * Accessible name of the field's clear button and text of the popup's.
   * @default 'Clear', or EnvUIProvider's messages.monthPicker.clear
   */
  clearLabel?: string;
  /**
   * The popup's shortcut to the current month.
   * @default 'This month', or EnvUIProvider's messages.monthPicker.thisMonth
   */
  thisMonthLabel?: string;
  /**
   * Accessible name of the popup's previous year button.
   * @default 'Previous year', or EnvUIProvider's messages.monthPicker.previousYear
   */
  previousYearLabel?: string;
  /**
   * Accessible name of the popup's next year button.
   * @default 'Next year', or EnvUIProvider's messages.monthPicker.nextYear
   */
  nextYearLabel?: string;
}

/**
 * A field for a month of a year that shows the value in the reader's locale and opens a year of
 * months to choose it from, with keyboard access like Calendar's.
 */
export function MonthPicker({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  locale,
  formatOptions,
  disabled = false,
  readOnly = false,
  clearable = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  clearLabel,
  thisMonthLabel,
  previousYearLabel,
  nextYearLabel,
  ...fieldProps
}: MonthPickerProps) {
  const messages = useMessages('monthPicker', monthPickerMessages);
  const [open, setOpen] = usePickerOpen({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
  });
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const current = parseMonth(value === undefined ? uncontrolledValue : value);
  const serialized = current === undefined ? '' : formatMonth(current);
  const minMonth = parseMonth(min);
  const maxMonth = parseMonth(max);

  // On the server, and while its output hydrates, a field without a locale shows the value as every
  // browser shows it, then in the reader's language.
  const shownLocale = useResolvedLocale(locale);
  const formatOptionsKey = JSON.stringify(formatOptions ?? null);
  const formatter = useMemo(
    () =>
      // Months are wall-clock dates, formatted in UTC so no zone shifts them.
      dateFormat(
        shownLocale,
        (JSON.parse(formatOptionsKey) as Intl.DateTimeFormatOptions | null) ?? {
          month: 'long',
          year: 'numeric',
        },
      ),
    [shownLocale, formatOptionsKey],
  );
  const display = current === undefined ? '' : formatter.format(toUtcDate(monthFirstDay(current)));

  function commit(next: number | null) {
    const result = next === null ? null : formatMonth(clampMonth(next, minMonth, maxMonth));
    if ((result ?? '') === serialized) return;
    if (value === undefined) setUncontrolledValue(result);
    onValueChange?.(result);
  }

  function choose(month: number | null) {
    commit(month);
    setOpen(false, month === null ? 'clear-press' : 'item-press');
  }

  const thisMonth = monthOfDay(now().day);
  const thisMonthAvailable =
    (minMonth === undefined || thisMonth >= minMonth) &&
    (maxMonth === undefined || thisMonth <= maxMonth);

  return (
    <PickerField
      {...fieldProps}
      serialized={serialized}
      display={display}
      icon={<IconCalendarMonth />}
      rootClassName="env-date-picker env-month-picker"
      popupClassName="env-month-picker-popup"
      initialFocus={monthGridActive}
      popupStart={
        <Button
          variant="text"
          aria-disabled={!thisMonthAvailable || undefined}
          onClick={() => {
            if (thisMonthAvailable) choose(thisMonth);
          }}
        >
          {thisMonthLabel ?? messages.thisMonth}
        </Button>
      }
      popupEnd={
        clearable &&
        serialized && (
          <Button variant="text" onClick={() => choose(null)}>
            {clearLabel ?? messages.clear}
          </Button>
        )
      }
      clearLabel={clearLabel ?? messages.clear}
      onClear={() => commit(null)}
      onFormReset={() => {
        if (value === undefined) setUncontrolledValue(defaultValue);
      }}
      open={open}
      setOpen={setOpen}
      disabled={disabled}
      readOnly={readOnly}
      clearable={clearable}
    >
      <MonthGrid
        value={current}
        onChoose={choose}
        min={minMonth}
        max={maxMonth}
        locale={shownLocale}
        previousYearLabel={previousYearLabel ?? messages.previousYear}
        nextYearLabel={nextYearLabel ?? messages.nextYear}
      />
    </PickerField>
  );
}
