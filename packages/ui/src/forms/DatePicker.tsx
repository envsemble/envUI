'use client';

import {
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type Ref,
} from 'react';
import { useMessages } from '../internal/EnvUIContext.js';
import { useResolvedLocale } from '../internal/useFormatters.js';
import { type ControlSize } from '../foundations/Theme.js';
import { datePicker as datePickerMessages } from '../foundations/messages/datePicker.js';
import { Button } from '../actions/Button.js';
import { Grid, Row } from '../foundations/Layout.js';
import { CalendarClock } from '../icons/CalendarClock.js';
import { CalendarMonth } from '../icons/CalendarMonth.js';
import { Calendar, calendarActiveDay } from './Calendar.js';
import { type FieldProps } from './internal/FieldFrame.js';
import { PickerField, usePickerOpen } from './internal/PickerField.js';
import { TimeList } from './internal/TimeList.js';
import {
  clampDay,
  dateFormat,
  formatDateTime,
  formatDay,
  fromMoment,
  momentOf,
  now,
  parseDateTime,
  parseDay,
  parseTime,
  toUtcDate,
  type Weekday,
} from './internal/calendarDays.js';

export interface DatePickerProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps {
  /** The field's button, which shows the value and opens the calendar. */
  ref?: Ref<HTMLButtonElement>;
  /** The field's class, on its root element, beside env-field and env-date-picker. */
  className?: string;
  /** Styles of the field's root element. */
  style?: CSSProperties;
  /**
   * The value: a day as YYYY-MM-DD, or with the minute granularity a local date and time as
   * YYYY-MM-DDTHH:mm. null, or an empty string, for none.
   */
  value?: string | null;
  /** The value an uncontrolled field starts with, and that a form reset restores; none by default. */
  defaultValue?: string | null;
  /** Receives the new value, or null once the field is cleared. */
  onValueChange?: (value: string | null) => void;
  /**
   * What the value holds: day, a date as YYYY-MM-DD, or minute, a date and a time as
   * YYYY-MM-DDTHH:mm, chosen in a list of times beside the calendar.
   * @default 'day'
   */
  granularity?: 'day' | 'minute';
  /** The earliest value, as YYYY-MM-DD or YYYY-MM-DDTHH:mm; earlier days are unavailable. */
  min?: string;
  /** The latest value, as YYYY-MM-DD or YYYY-MM-DDTHH:mm; later days are unavailable. */
  max?: string;
  /** The time a newly chosen day starts with, as HH:mm; 00:00 by default. */
  defaultTime?: string;
  /**
   * With the minute granularity, the minutes between the times the list offers, from 1 to 60. A
   * value between them still shows in the list, in its place.
   * @default 15
   */
  minuteStep?: number;
  /**
   * The locale of the shown value and the calendar's names and numbers: EnvUIProvider's, else the
   * browser's. Dates are Gregorian, also in a locale with a calendar of its own.
   */
  locale?: string;
  /** The calendar's first day of the week, from 0 for Sunday to 6 for Saturday; see Calendar. */
  weekStart?: Weekday;
  /**
   * How the field shows the value: Intl.DateTimeFormat options, by default the medium date style
   * and, with the minute granularity, the short time style, in the Gregorian calendar unless they
   * name another.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** The name the value is submitted under with a form, as YYYY-MM-DD or YYYY-MM-DDTHH:mm. */
  name?: string;
  /** A value is needed: an empty field keeps its form from submitting and takes focus. */
  required?: boolean;
  /** The value can be read and focused but not changed. */
  readOnly?: boolean;
  /** Shown while the field is empty and its label floats or is hidden. */
  placeholder?: string;
  /**
   * The field's look, as TextField's: outline, at the control height, or floating, 3.5 rem tall
   * with room for its label, for long forms on a page.
   * @default 'outline'
   */
  variant?: 'outline' | 'floating';
  /**
   * The field's height, as on every control: sm, md or lg in the current scale. Without it, the
   * field takes the control height of its container, md unless the container sets another.
   */
  size?: ControlSize;
  /**
   * Show the label inside the field, where it floats into the outline while the field has a value,
   * focus or its calendar open. Set false for a field whose purpose is clear without it.
   * @default true
   */
  showLabel?: boolean;
  /** A clear button in the field and in the calendar removes the value. */
  clearable?: boolean;
  /** Whether the calendar is open; with `onOpenChange` it controls it. */
  open?: boolean;
  /** Whether an uncontrolled calendar starts open; closed by default. */
  defaultOpen?: boolean;
  /** Called with the new state when the calendar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Accessible name of the field's clear button and text of the calendar's.
   * @default 'Clear', or EnvUIProvider's messages.datePicker.clear
   */
  clearLabel?: string;
  /**
   * The calendar's shortcut to today.
   * @default 'Today', or EnvUIProvider's messages.datePicker.today
   */
  todayLabel?: string;
  /**
   * With the minute granularity, the calendar's shortcut to the current date and time.
   * @default 'Now', or EnvUIProvider's messages.datePicker.now
   */
  nowLabel?: string;
  /**
   * With the minute granularity, the heading and accessible name of the list of times.
   * @default 'Time', or EnvUIProvider's messages.datePicker.time
   */
  timeLabel?: string;
  /**
   * Accessible name of the calendar's previous month button.
   * @default 'Previous month', or EnvUIProvider's messages.calendar.previousMonth
   */
  previousMonthLabel?: string;
  /**
   * Accessible name of the calendar's next month button.
   * @default 'Next month', or EnvUIProvider's messages.calendar.nextMonth
   */
  nextMonthLabel?: string;
}

interface DateTimeValue {
  day: number;
  minutes: number;
}

const minutesPerDay = 24 * 60;

function parseValue(value: string | null | undefined, withTime: boolean, defaultMinutes: number) {
  const dateTime = parseDateTime(value);
  const day = dateTime?.day ?? parseDay(value);
  if (day === undefined) return undefined;
  return { day, minutes: withTime ? (dateTime?.minutes ?? defaultMinutes) : 0 };
}

/** A bound as a moment: a day alone starts at its first minute as min and ends at its last as max. */
function boundMoment(value: string | undefined, edge: 'start' | 'end') {
  const dateTime = parseDateTime(value);
  if (dateTime) return momentOf(dateTime.day, dateTime.minutes);
  const day = parseDay(value);
  if (day === undefined) return undefined;
  return momentOf(day, edge === 'start' ? 0 : minutesPerDay - 1);
}

/** A bound's time of day where it falls on the given day, for the list of times. */
function boundMinutes(moment: number | undefined, day: number) {
  if (moment === undefined) return undefined;
  const bound = fromMoment(moment);
  return bound.day === day ? bound.minutes : undefined;
}

/**
 * A field for a date, or a date and time, that shows the value in the reader's locale and opens a
 * calendar to choose it, with keyboard access following the WAI-ARIA date picker.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  granularity = 'day',
  min,
  max,
  defaultTime,
  minuteStep,
  locale,
  weekStart,
  formatOptions,
  disabled = false,
  readOnly = false,
  clearable = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  clearLabel,
  todayLabel,
  nowLabel,
  timeLabel,
  previousMonthLabel,
  nextMonthLabel,
  ...fieldProps
}: DatePickerProps) {
  const withTime = granularity === 'minute';
  const messages = useMessages('datePicker', datePickerMessages);
  const timeHeadingId = useId();
  const [open, setOpen] = usePickerOpen({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
  });
  const defaultMinutes = parseTime(defaultTime) ?? 0;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const current = parseValue(
    value === undefined ? uncontrolledValue : value,
    withTime,
    defaultMinutes,
  );
  const serialized = current
    ? withTime
      ? formatDateTime(current.day, current.minutes)
      : formatDay(current.day)
    : '';

  const minMoment = boundMoment(min, 'start');
  const maxMoment = boundMoment(max, 'end');
  const minDay = minMoment === undefined ? undefined : fromMoment(minMoment).day;
  const maxDay = maxMoment === undefined ? undefined : fromMoment(maxMoment).day;

  // On the server, and while its output hydrates, a field without a locale shows the value as every
  // browser shows it, then in the reader's language.
  const shownLocale = useResolvedLocale(locale);
  const formatOptionsKey = JSON.stringify(formatOptions ?? null);
  const formatter = useMemo(
    () =>
      // Values are wall-clock dates and times, formatted in UTC so no zone shifts them.
      dateFormat(
        shownLocale,
        (JSON.parse(formatOptionsKey) as Intl.DateTimeFormatOptions | null) ??
          (withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }),
      ),
    [shownLocale, withTime, formatOptionsKey],
  );
  const display = current ? formatter.format(toUtcDate(current.day, current.minutes)) : '';

  function commit(next: DateTimeValue | null) {
    let result: string | null = null;
    if (next) {
      if (withTime) {
        let moment = momentOf(next.day, next.minutes);
        if (minMoment !== undefined) moment = Math.max(moment, minMoment);
        if (maxMoment !== undefined) moment = Math.min(moment, maxMoment);
        const kept = fromMoment(moment);
        result = formatDateTime(kept.day, kept.minutes);
      } else {
        result = formatDay(clampDay(next.day, minDay, maxDay));
      }
    }
    if ((result ?? '') === serialized) return;
    if (value === undefined) setUncontrolledValue(result);
    onValueChange?.(result);
  }

  function chooseDay(day: string) {
    const chosen = parseDay(day);
    if (chosen === undefined) return;
    commit({ day: chosen, minutes: current?.minutes ?? defaultMinutes });
    if (!withTime) setOpen(false);
  }

  // Without a value, a chosen time goes with today, kept within min and max.
  const timeDay = current?.day ?? clampDay(now().day, minDay, maxDay);

  function chooseNow() {
    const moment = now();
    commit(withTime ? moment : { day: moment.day, minutes: 0 });
    if (!withTime) setOpen(false);
  }

  function clear() {
    commit(null);
    setOpen(false);
  }

  const reference = now();
  const nowAvailable = withTime
    ? (minMoment === undefined || momentOf(reference.day, reference.minutes) >= minMoment) &&
      (maxMoment === undefined || momentOf(reference.day, reference.minutes) <= maxMoment)
    : (minDay === undefined || reference.day >= minDay) &&
      (maxDay === undefined || reference.day <= maxDay);

  const calendar = (
    <Calendar
      value={current ? formatDay(current.day) : null}
      onValueChange={chooseDay}
      min={minDay === undefined ? undefined : formatDay(minDay)}
      max={maxDay === undefined ? undefined : formatDay(maxDay)}
      weekStart={weekStart}
      locale={locale}
      previousMonthLabel={previousMonthLabel}
      nextMonthLabel={nextMonthLabel}
    />
  );

  return (
    <PickerField
      {...fieldProps}
      serialized={serialized}
      display={display}
      icon={withTime ? <CalendarClock /> : <CalendarMonth />}
      rootClassName="env-date-picker"
      initialFocus={calendarActiveDay}
      popupStart={
        <Button
          variant="text"
          aria-disabled={!nowAvailable || undefined}
          onClick={() => {
            if (nowAvailable) chooseNow();
          }}
        >
          {withTime ? (nowLabel ?? messages.now) : (todayLabel ?? messages.today)}
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
      {withTime ? (
        // The times stand beside the days, as tall as the calendar; the chosen day's share of min
        // and max limits them.
        <Grid gap={3} className="env-date-picker-panes">
          {calendar}
          <Grid gap={2} className="env-date-picker-time">
            <Row align="center" className="env-date-picker-time-heading" id={timeHeadingId}>
              {timeLabel ?? messages.time}
            </Row>
            <TimeList
              aria-labelledby={timeHeadingId}
              value={current?.minutes}
              onValueChange={(minutes) => commit({ day: timeDay, minutes })}
              minuteStep={minuteStep}
              start={defaultTime === undefined ? undefined : defaultMinutes}
              min={boundMinutes(minMoment, timeDay)}
              max={boundMinutes(maxMoment, timeDay)}
              locale={locale}
            />
          </Grid>
        </Grid>
      ) : (
        calendar
      )}
    </PickerField>
  );
}
