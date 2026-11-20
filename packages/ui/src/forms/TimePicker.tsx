'use client';

import { useMessages } from '../internal/provider/EnvUIContext.js';
import { timePicker as timePickerMessages } from '../foundations/messages/timePicker.js';
import { IconSchedule } from '../icons/Schedule.js';
import { PickerField, type PickerFieldProps } from './internal/PickerField.js';
import {
  usePicker,
  type PickerOpenChangeDetails,
  type PickerOpenChangeReason,
} from './internal/usePicker.js';
import { TimeList, timeListInitialFocus } from './internal/TimeList.js';
import { usePickerFormatter } from './internal/usePickerFormatter.js';
import { formatTime, inBounds, now, parseTime, toUtcDate } from '../internal/time/calendarDays.js';
import '../styles/Base.css';
import '../styles/DatePicker.css';
import '../styles/TimePicker.css';

/** Why a time picker's popup asks to open or close: a picker's reasons. */
export type TimePickerOpenChangeReason = PickerOpenChangeReason;

/** What a time picker's onOpenChange receives beside the requested state: a picker's details. */
export type TimePickerOpenChangeDetails = PickerOpenChangeDetails;

export interface TimePickerProps extends PickerFieldProps {
  /** Called with the new state, and why, when the popup opens or closes. */
  onOpenChange?: (open: boolean, details: TimePickerOpenChangeDetails) => void;
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
   * The locale of the shown value and the list's times, with its own 12- or 24-hour clock unless
   * `hourCycle` sets one: EnvUIProvider's, else the browser's.
   */
  locale?: string;
  /**
   * The clock of the shown value and the wheels, whatever the locale's: h23 for 18:00, with no
   * AM/PM wheel, or h12 for 6:00 PM. The value stays HH:mm on the 24-hour clock.
   * @default the locale's
   */
  hourCycle?: 'h12' | 'h23';
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
  hourCycle,
  formatOptions,
  open,
  defaultOpen,
  onOpenChange,
  clearLabel,
  nowLabel,
  ...fieldProps
}: TimePickerProps) {
  const messages = useMessages('timePicker', timePickerMessages);
  const picker = usePicker({ value, defaultValue, onValueChange, open, defaultOpen, onOpenChange });
  const current = parseTime(picker.raw);
  const serialized = current === undefined ? '' : formatTime(current);
  const minMinutes = parseTime(min);
  const maxMinutes = parseTime(max);

  const { formatter } = usePickerFormatter(
    locale,
    formatOptions,
    { timeStyle: 'short' },
    hourCycle,
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
    picker.change(result, serialized);
  }

  const reference = now().minutes;
  const nowAvailable = inBounds(reference, minMinutes, maxMinutes);

  return (
    <PickerField
      {...fieldProps}
      picker={picker}
      serialized={serialized}
      display={display}
      icon={<IconSchedule />}
      rootClassName="env-date-picker env-time-picker"
      popupClassName="env-time-picker-popup"
      initialFocus={timeListInitialFocus}
      shortcut={{
        label: nowLabel ?? messages.now,
        available: nowAvailable,
        onPress: () => commit(now().minutes),
      }}
      clearLabel={clearLabel ?? messages.clear}
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
          hourCycle={hourCycle}
        />
      )}
    </PickerField>
  );
}
