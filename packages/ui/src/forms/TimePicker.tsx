'use client';

import { useMemo, useState } from 'react';
import { useMessages } from '../internal/EnvUIContext.js';
import { useResolvedLocale } from '../internal/useFormatters.js';
import { timePicker as timePickerMessages } from '../foundations/messages/timePicker.js';
import { Button } from '../actions/Button.js';
import { Schedule } from '../icons/Schedule.js';
import { PickerField, usePickerOpen, type PickerFieldProps } from './internal/PickerField.js';
import { TimeList, timeListFirstColumn } from './internal/TimeList.js';
import { dateFormat, formatTime, now, parseTime, toUtcDate } from '../internal/calendarDays.js';
import '../styles/Base.css';
import '../styles/DatePicker.css';
import '../styles/TimePicker.css';

export interface TimePickerProps extends PickerFieldProps {
  /** The value: a time of day as HH:mm on the 24-hour clock. null, or an empty string, for none. */
  value?: string | null;
  /** The value an uncontrolled field starts with, and that a form reset restores; none by default. */
  defaultValue?: string | null;
  /** Receives the new value as HH:mm, or null once the field is cleared. */
  onValueChange?: (value: string | null) => void;
  /** The earliest time, as HH:mm; earlier times are unavailable. */
  min?: string;
  /** The latest time, as HH:mm; later times are unavailable. */
  max?: string;
  /**
   * The minutes between the times the list offers, from 1 to 60. A value between them still shows
   * in the list, in its place.
   * @default 15
   */
  minuteStep?: number;
  /**
   * The locale of the shown value and the list's times, with its own 12- or 24-hour clock:
   * EnvUIProvider's, else the browser's.
   */
  locale?: string;
  /**
   * How the field shows the value: Intl.DateTimeFormat options, by default the short time style.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  /**
   * Accessible name of the field's clear button and text of the popup's.
   * @default 'Clear', or EnvUIProvider's messages.timePicker.clear
   */
  clearLabel?: string;
  /**
   * The popup's shortcut to the current time.
   * @default 'Now', or EnvUIProvider's messages.timePicker.now
   */
  nowLabel?: string;
}

/**
 * A field for a time of day that shows the value in the reader's locale and opens wheels of its
 * hours, minutes every `minuteStep` and, on a 12-hour clock, the day's halves to choose it.
 */
export function TimePicker({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  minuteStep,
  locale,
  formatOptions,
  disabled = false,
  readOnly = false,
  clearable = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  clearLabel,
  nowLabel,
  ...fieldProps
}: TimePickerProps) {
  const messages = useMessages('timePicker', timePickerMessages);
  const [open, setOpen] = usePickerOpen({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
  });
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const current = parseTime(value === undefined ? uncontrolledValue : value);
  const serialized = current === undefined ? '' : formatTime(current);
  const minMinutes = parseTime(min);
  const maxMinutes = parseTime(max);

  // On the server, and while its output hydrates, a field without a locale shows the value as every
  // browser shows it, then in the reader's language.
  const shownLocale = useResolvedLocale(locale);
  const formatOptionsKey = JSON.stringify(formatOptions ?? null);
  const formatter = useMemo(
    () =>
      // Values are wall-clock times, formatted in UTC so no zone shifts them.
      dateFormat(
        shownLocale,
        (JSON.parse(formatOptionsKey) as Intl.DateTimeFormatOptions | null) ?? {
          timeStyle: 'short',
        },
      ),
    [shownLocale, formatOptionsKey],
  );
  const display = current === undefined ? '' : formatter.format(toUtcDate(0, current));

  function commit(next: number | null) {
    let result: string | null = null;
    if (next !== null) {
      let kept = next;
      if (minMinutes !== undefined) kept = Math.max(kept, minMinutes);
      if (maxMinutes !== undefined) kept = Math.min(kept, maxMinutes);
      result = formatTime(kept);
    }
    if ((result ?? '') === serialized) return;
    if (value === undefined) setUncontrolledValue(result);
    onValueChange?.(result);
  }

  function clear() {
    commit(null);
    setOpen(false);
  }

  const reference = now().minutes;
  const nowAvailable =
    (minMinutes === undefined || reference >= minMinutes) &&
    (maxMinutes === undefined || reference <= maxMinutes);

  return (
    <PickerField
      {...fieldProps}
      serialized={serialized}
      display={display}
      icon={<Schedule />}
      rootClassName="env-date-picker env-time-picker"
      popupClassName="env-time-picker-popup"
      initialFocus={timeListFirstColumn}
      popupStart={
        <Button
          variant="text"
          aria-disabled={!nowAvailable || undefined}
          onClick={() => {
            if (nowAvailable) commit(now().minutes);
          }}
        >
          {nowLabel ?? messages.now}
        </Button>
      }
      popupEnd={
        clearable &&
        serialized && (
          <Button variant="text" onClick={clear}>
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
      {(name) => (
        <TimeList
          {...name}
          value={current}
          onValueChange={commit}
          minuteStep={minuteStep}
          min={minMinutes}
          max={maxMinutes}
          locale={locale}
        />
      )}
    </PickerField>
  );
}
