'use client';

import { useMessages } from '../internal/provider/EnvUIContext.js';
import { monthPicker as monthPickerMessages } from '../foundations/messages/monthPicker.js';
import { IconCalendarMonth } from '../icons/CalendarMonth.js';
import { MonthGrid, monthGridInitialFocus } from './internal/MonthGrid.js';
import { PickerField, type PickerFieldProps } from './internal/PickerField.js';
import {
  usePicker,
  type PickerOpenChangeDetails,
  type PickerOpenChangeReason,
} from './internal/usePicker.js';
import { usePickerFormatter } from './internal/usePickerFormatter.js';
import {
  clampMonth,
  formatMonth,
  inBounds,
  monthFirstDay,
  monthOfDay,
  now,
  parseMonth,
  toUtcDate,
} from '../internal/time/calendarDays.js';
import '../styles/Base.css';
import '../styles/DatePicker.css';

/** Why a month picker's popup asks to open or close: a picker's reasons. */
export type MonthPickerOpenChangeReason = PickerOpenChangeReason;

/** What a month picker's onOpenChange receives beside the requested state: a picker's details. */
export type MonthPickerOpenChangeDetails = PickerOpenChangeDetails;

export interface MonthPickerProps extends PickerFieldProps {
  /** Called with the new state, and why, when the popup opens or closes. */
  onOpenChange?: (open: boolean, details: MonthPickerOpenChangeDetails) => void;
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
  open,
  defaultOpen,
  onOpenChange,
  clearLabel,
  thisMonthLabel,
  previousYearLabel,
  nextYearLabel,
  ...fieldProps
}: MonthPickerProps) {
  const messages = useMessages('monthPicker', monthPickerMessages);
  const picker = usePicker({ value, defaultValue, onValueChange, open, defaultOpen, onOpenChange });
  const current = parseMonth(picker.raw);
  const serialized = current === undefined ? '' : formatMonth(current);
  const minMonth = parseMonth(min);
  const maxMonth = parseMonth(max);

  const { shownLocale, formatter } = usePickerFormatter(locale, formatOptions, {
    month: 'long',
    year: 'numeric',
  });
  const display = current === undefined ? '' : formatter.format(toUtcDate(monthFirstDay(current)));

  function commit(next: number | null) {
    const result = next === null ? null : formatMonth(clampMonth(next, minMonth, maxMonth));
    picker.change(result, serialized);
  }

  function choose(month: number | null) {
    commit(month);
    picker.setOpen(false, month === null ? 'clear-press' : 'item-press');
  }

  const thisMonth = monthOfDay(now().day);
  const thisMonthAvailable = inBounds(thisMonth, minMonth, maxMonth);

  return (
    <PickerField
      {...fieldProps}
      picker={picker}
      serialized={serialized}
      display={display}
      icon={<IconCalendarMonth />}
      rootClassName="env-date-picker env-month-picker"
      popupClassName="env-month-picker-popup"
      initialFocus={monthGridInitialFocus}
      shortcut={{
        label: thisMonthLabel ?? messages.thisMonth,
        available: thisMonthAvailable,
        onPress: () => choose(thisMonth),
      }}
      clearLabel={clearLabel ?? messages.clear}
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
