'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { setRef } from '../internal/setRef.js';
import { useHydrated } from '../internal/useHydrated.js';
import { useDirection } from '../internal/useDirection.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useResolvedLocale } from '../internal/useFormatters.js';
import { PopupSurface } from '../internal/PopupSurface.js';
import { type ControlSize } from '../foundations/Theme.js';
import { datePicker as datePickerMessages } from '../foundations/messages/datePicker.js';
import { Button, IconButton } from '../actions/Button.js';
import { CalendarClock } from '../icons/CalendarClock.js';
import { CalendarMonth } from '../icons/CalendarMonth.js';
import { Close } from '../icons/Close.js';
import { Calendar, calendarActiveDay } from './Calendar.js';
import { TextField } from './TextField.js';
import { FieldFrame, type FieldControlBoxProps, type FieldProps } from './internal/FieldFrame.js';
import {
  clampDay,
  dateFormat,
  formatDateTime,
  formatDay,
  formatTime,
  fromMoment,
  momentOf,
  now,
  parseDateTime,
  parseDay,
  parseTime,
  toUtcDate,
  type Weekday,
} from './internal/CalendarDays.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';
import { useFieldMetadata } from './internal/useFieldMetadata.js';

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
   * YYYY-MM-DDTHH:mm, chosen in a time field under the calendar.
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
   * With the minute granularity, the button that closes the calendar.
   * @default 'Done', or EnvUIProvider's messages.datePicker.done
   */
  doneLabel?: string;
  /**
   * With the minute granularity, the label of the time field.
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

function remPixels(element: Element | null) {
  if (!element) return 16;
  return Number.parseFloat(getComputedStyle(element.ownerDocument.documentElement).fontSize) || 16;
}

const popupParts = {
  Portal: BasePopover.Portal,
  Positioner: BasePopover.Positioner,
  Popup: BasePopover.Popup,
};

function ignoreChange() {
  // The visually hidden input only carries the value for native forms.
}

/**
 * A field for a date, or a date and time, that shows the value in the reader's locale and opens a
 * calendar to choose it, with keyboard access following the WAI-ARIA date picker.
 */
export function DatePicker({
  ref,
  value,
  defaultValue = null,
  onValueChange,
  granularity = 'day',
  min,
  max,
  defaultTime = '00:00',
  locale,
  weekStart,
  formatOptions,
  name,
  form,
  required = false,
  disabled = false,
  readOnly = false,
  placeholder,
  variant = 'outline',
  size,
  showLabel,
  clearable = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  clearLabel,
  todayLabel,
  nowLabel,
  doneLabel,
  timeLabel,
  previousMonthLabel,
  nextMonthLabel,
  label,
  description,
  error,
  id: suppliedId,
  className,
  style,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  onKeyDown,
  ...triggerProps
}: DatePickerProps) {
  const withTime = granularity === 'minute';
  const messages = useMessages('datePicker', datePickerMessages);
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const { id } = metadata;
  const labelId = `${id}-label`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  // Whether the calendar was open when a press on the label began, which closes it.
  const labelPressOpen = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  // Read as the calendar opens, which takes the field's direction into its portal.
  const [direction] = useDirection(triggerRef, open);
  const defaultMinutes = parseTime(defaultTime) ?? 0;
  // The field and its popup take the application's own aria-labelledby, else the label, else the
  // aria-label.
  const accessibleName = {
    'aria-labelledby': labelledBy ?? (label != null ? labelId : undefined),
    'aria-label': labelledBy == null && label == null ? ariaLabel : undefined,
  };

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
  // The time field shows what is typed until it loses focus, then the value it was kept within.
  const [timeDraft, setTimeDraft] = useState<string | null>(null);

  const minMoment = boundMoment(min, 'start');
  const maxMoment = boundMoment(max, 'end');
  const minDay = minMoment === undefined ? undefined : fromMoment(minMoment).day;
  const maxDay = maxMoment === undefined ? undefined : fromMoment(maxMoment).day;

  // On the server, and while its output hydrates, a field without a locale shows the value as every
  // browser shows it, then in the reader's language.
  const hydrated = useHydrated();
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

  useEffect(
    function subscribeToFormReset() {
      const input = nativeRef.current;
      const ownerForm = input?.form;
      if (!input || !ownerForm) return;
      return subscribeFormReset(ownerForm, function applyReset() {
        if (value === undefined) setUncontrolledValue(defaultValue);
      });
    },
    [value, defaultValue, form],
  );

  function setOpen(next: boolean) {
    if (next && (disabled || readOnly)) return;
    if (!next) setTimeDraft(null);
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

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

  function changeTime(text: string) {
    setTimeDraft(text);
    const minutes = parseTime(text);
    if (minutes === undefined) return;
    commit({ day: current?.day ?? clampDay(now().day, minDay, maxDay), minutes });
  }

  function chooseNow() {
    const moment = now();
    commit(withTime ? moment : { day: moment.day, minutes: 0 });
    setTimeDraft(null);
    if (!withTime) setOpen(false);
  }

  function clear() {
    commit(null);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || readOnly) return;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !open) {
      event.preventDefault();
      setOpen(true);
    } else if (clearable && serialized && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      commit(null);
    }
  }

  const reference = now();
  const nowAvailable = withTime
    ? (minMoment === undefined || momentOf(reference.day, reference.minutes) >= minMoment) &&
      (maxMoment === undefined || momentOf(reference.day, reference.minutes) <= maxMoment)
    : (minDay === undefined || reference.day >= minDay) &&
      (maxDay === undefined || reference.day <= maxDay);
  const showClear = clearable && Boolean(serialized) && !disabled && !readOnly;
  const labelFloats = Boolean(serialized) || open;

  function renderControlBox(boxProps: FieldControlBoxProps) {
    return (
      <div
        {...boxProps}
        className={`${boxProps.className} env-date-picker-control`}
        data-label-floating={labelFloats || undefined}
        data-actions={showClear ? '2' : '1'}
      />
    );
  }

  return (
    <BasePopover.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <FieldFrame
        id={id}
        label={
          label != null ? (
            <label
              htmlFor={id}
              id={labelId}
              onPointerDown={() => {
                labelPressOpen.current = open;
              }}
              onClick={(event) => {
                // A press on the label closes the open calendar, as a press outside it does;
                // the click that follows would open it again, as it opens a closed one.
                if (!labelPressOpen.current) return;
                labelPressOpen.current = false;
                event.preventDefault();
                triggerRef.current?.focus();
              }}
            >
              {label}
            </label>
          ) : null
        }
        description={description}
        error={error}
        floatingLabel
        variant={variant}
        size={size}
        showLabel={showLabel}
        className={className ? `env-date-picker ${className}` : 'env-date-picker'}
        style={style}
        renderControlBox={renderControlBox}
      >
        <BasePopover.Trigger
          {...triggerProps}
          ref={(node: HTMLButtonElement | null) => {
            triggerRef.current = node;
            setRef(ref, node);
          }}
          id={id}
          role="combobox"
          {...accessibleName}
          aria-describedby={metadata['aria-describedby']}
          aria-invalid={metadata['aria-invalid']}
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          disabled={disabled}
          className="env-text-field-input env-date-picker-trigger"
          onKeyDown={handleKeyDown}
        >
          {display ? (
            // As in RelativeTime: should the browser format the hydrated value differently from
            // the server, the server's text stays until hydration ends, then the browser's
            // replaces it, without a mismatch error.
            <span className="env-date-picker-value" suppressHydrationWarning>
              {hydrated ? display : [display]}
            </span>
          ) : (
            <span className="env-date-picker-placeholder">{placeholder}</span>
          )}
        </BasePopover.Trigger>
        <span className="env-text-field-end env-date-picker-end">
          {showClear && (
            <IconButton
              variant="ghost"
              icon={<Close />}
              aria-label={clearLabel ?? messages.clear}
              title={clearLabel ?? messages.clear}
              className="env-date-picker-clear"
              onClick={() => {
                commit(null);
                triggerRef.current?.focus();
              }}
            />
          )}
          <span className="env-icon env-date-picker-icon" aria-hidden="true">
            {withTime ? <CalendarClock /> : <CalendarMonth />}
          </span>
        </span>
        <input
          ref={nativeRef}
          className="env-date-picker-native"
          name={name}
          form={form}
          value={serialized}
          required={required}
          disabled={disabled}
          // Like a read-only input, a read-only field is not validated, so an empty required one
          // never keeps its form from submitting.
          readOnly={readOnly}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          onChange={ignoreChange}
          // The browser focuses an invalid required field on submit; the field takes it instead.
          onFocus={() => triggerRef.current?.focus()}
        />
      </FieldFrame>
      <PopupSurface
        parts={popupParts}
        side="bottom"
        align="start"
        sideOffset={() => remPixels(triggerRef.current) * 0.25}
        // The portal leaves the field's text direction behind; the calendar keeps it.
        dir={direction}
        className="env-date-picker-popup"
        popupProps={{ ref: popupRef, ...accessibleName }}
        initialFocus={() => calendarActiveDay(popupRef.current) ?? true}
      >
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
        {withTime && (
          <TextField
            type="time"
            label={timeLabel ?? messages.time}
            value={timeDraft ?? (current ? formatTime(current.minutes) : '')}
            onChange={(event) => changeTime(event.currentTarget.value)}
            onBlur={() => setTimeDraft(null)}
          />
        )}
        <div className="env-date-picker-actions">
          <Button
            variant="text"
            aria-disabled={!nowAvailable || undefined}
            onClick={() => {
              if (nowAvailable) chooseNow();
            }}
          >
            {withTime ? (nowLabel ?? messages.now) : (todayLabel ?? messages.today)}
          </Button>
          <span className="env-date-picker-actions-end">
            {clearable && serialized && (
              <Button variant="text" onClick={clear}>
                {clearLabel ?? messages.clear}
              </Button>
            )}
            {withTime && (
              <Button variant="secondary" onClick={() => setOpen(false)}>
                {doneLabel ?? messages.done}
              </Button>
            )}
          </span>
        </div>
      </PopupSurface>
    </BasePopover.Root>
  );
}
