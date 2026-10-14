import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Popover as BasePopover } from '@base-ui/react/popover';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import { Button, IconButton } from '../actions/Button.js';
import { CalendarClock } from '../icons/CalendarClock.js';
import { CalendarMonth } from '../icons/CalendarMonth.js';
import { Close } from '../icons/Close.js';
import { Calendar } from './Calendar.js';
import { Input } from './Input.js';
import { FieldFrame, type FieldProps, type FieldWellProps } from './internal/FieldFrame.js';
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
import { useTextDirection } from './internal/useTextDirection.js';

export interface DateTimeFieldProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'value' | 'defaultValue' | 'onChange' | 'children' | 'name' | 'type'
    >,
    FieldProps {
  ref?: Ref<HTMLButtonElement>;
  /**
   * The value: a day as YYYY-MM-DD, or with withTime a local date and time as YYYY-MM-DDTHH:mm.
   * null, or an empty string, for none.
   */
  value?: string | null;
  defaultValue?: string | null;
  /** Receives the new value, or null once the field is cleared. */
  onValueChange?: (value: string | null) => void;
  /** Choose a time as well: the value becomes YYYY-MM-DDTHH:mm. */
  withTime?: boolean;
  /** The earliest value, as YYYY-MM-DD or YYYY-MM-DDTHH:mm; earlier days are unavailable. */
  min?: string;
  /** The latest value, as YYYY-MM-DD or YYYY-MM-DDTHH:mm; later days are unavailable. */
  max?: string;
  /** The time a newly chosen day starts with, as HH:mm; 00:00 by default. */
  defaultTime?: string;
  /**
   * The locale of the shown value and the calendar's names and numbers; the browser's by default.
   * Dates are Gregorian, also in a locale with a calendar of its own.
   */
  locale?: string;
  /** The calendar's first day of the week, from 0 for Sunday to 6 for Saturday; see Calendar. */
  weekStart?: Weekday;
  /**
   * How the field shows the value: Intl.DateTimeFormat options, by default the medium date style
   * and, with withTime, the short time style, in the Gregorian calendar unless they name another.
   */
  formatOptions?: Intl.DateTimeFormatOptions;
  name?: string;
  required?: boolean;
  /** The value can be read and focused but not changed. */
  readOnly?: boolean;
  /** Shown while the field is empty and its label floats or is hidden. */
  placeholder?: string;
  /** standard (default) is the text field of forms; compact takes the compact control height. */
  density?: 'standard' | 'compact';
  /**
   * Show the label inside the field, where it floats into the outline while the field has a value,
   * focus or its calendar open. Defaults to true, and to false for compact fields.
   */
  showLabel?: boolean;
  /** A clear button in the field and in the calendar removes the value. */
  clearable?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the field's clear button and text of the calendar's; Clear by default. */
  clearLabel?: string;
  /** The calendar's shortcut to today; Today by default. */
  todayLabel?: string;
  /** With withTime, the calendar's shortcut to the current date and time; Now by default. */
  nowLabel?: string;
  /** With withTime, the button that closes the calendar; Done by default. */
  doneLabel?: string;
  /** With withTime, the label of the time field; Time by default. */
  timeLabel?: string;
  previousMonthLabel?: string;
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

function ignoreChange() {
  // The visually hidden input only carries the value for native forms.
}

/**
 * A field for a date, or a date and time, that shows the value in the reader's locale and opens a
 * calendar to choose it, with keyboard access following the WAI-ARIA date picker.
 */
export function DateTimeField({
  ref,
  value,
  defaultValue = null,
  onValueChange,
  withTime = false,
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
  density = 'standard',
  showLabel,
  clearable = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  clearLabel = 'Clear',
  todayLabel = 'Today',
  nowLabel = 'Now',
  doneLabel = 'Done',
  timeLabel = 'Time',
  previousMonthLabel,
  nextMonthLabel,
  label,
  hint,
  error,
  id: suppliedId,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  onKeyDown,
  ...triggerProps
}: DateTimeFieldProps) {
  const metadata = useFieldMetadata(suppliedId, hint, error, describedBy, invalid);
  const { id } = metadata;
  const labelId = `${id}-label`;
  const compact = density === 'compact';
  const theme = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const direction = useTextDirection(triggerRef);
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
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  // The time field shows what is typed until it loses focus, then the value it was kept within.
  const [timeDraft, setTimeDraft] = useState<string | null>(null);

  const minMoment = boundMoment(min, 'start');
  const maxMoment = boundMoment(max, 'end');
  const minDay = minMoment === undefined ? undefined : fromMoment(minMoment).day;
  const maxDay = maxMoment === undefined ? undefined : fromMoment(maxMoment).day;

  const formatOptionsKey = JSON.stringify(formatOptions ?? null);
  const formatter = useMemo(
    () =>
      // Values are wall-clock dates and times, formatted in UTC so no zone shifts them.
      dateFormat(
        locale,
        (JSON.parse(formatOptionsKey) as Intl.DateTimeFormatOptions | null) ??
          (withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }),
      ),
    [locale, withTime, formatOptionsKey],
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

  function renderWell(wellProps: FieldWellProps) {
    return (
      <div
        {...wellProps}
        className={classNames(wellProps.className, 'env-date-time-well')}
        data-label-floating={labelFloats || undefined}
        data-actions={showClear ? '2' : '1'}
      />
    );
  }

  return (
    <DirectionProvider direction={direction}>
      <BasePopover.Root open={open} onOpenChange={(next) => setOpen(next)}>
        <FieldFrame
          id={id}
          label={
            label != null ? (
              <label htmlFor={id} id={labelId}>
                {label}
              </label>
            ) : null
          }
          hint={hint}
          error={error}
          floatingLabel
          compact={compact}
          showLabel={showLabel}
          className="env-date-time-field"
          renderWell={renderWell}
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
            className={classNames('env-text-input', 'env-date-time-trigger', className)}
            onKeyDown={handleKeyDown}
          >
            {display ? (
              <span className="env-date-time-value">{display}</span>
            ) : (
              <span className="env-date-time-placeholder">{placeholder}</span>
            )}
          </BasePopover.Trigger>
          <span className="env-text-field-end env-date-time-end">
            {showClear && (
              <IconButton
                variant="text"
                icon={<Close />}
                aria-label={clearLabel}
                title={clearLabel}
                onClick={() => {
                  commit(null);
                  triggerRef.current?.focus();
                }}
              />
            )}
            <span className="env-symbol env-date-time-icon" aria-hidden="true">
              {withTime ? <CalendarClock /> : <CalendarMonth />}
            </span>
          </span>
          <input
            ref={nativeRef}
            className="env-date-time-native"
            name={name}
            form={form}
            value={serialized}
            required={required}
            disabled={disabled}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            onChange={ignoreChange}
            // The browser focuses an invalid required field on submit; the field takes it instead.
            onFocus={() => triggerRef.current?.focus()}
          />
        </FieldFrame>
        <BasePopover.Portal>
          <Theme theme={theme} className="env-popover-theme">
            <BasePopover.Positioner
              side="bottom"
              align="start"
              sideOffset={() => remPixels(triggerRef.current) * (compact ? 0.25 : 0.5)}
              collisionPadding={8}
              className="env-popover-positioner"
            >
              <BasePopover.Popup
                ref={popupRef}
                className="env-popover env-date-time-popup"
                data-density={compact ? 'compact' : undefined}
                {...accessibleName}
                initialFocus={() =>
                  popupRef.current?.querySelector<HTMLElement>('.env-calendar-day[tabindex="0"]') ??
                  true
                }
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
                  <Input
                    type="time"
                    compact
                    showLabel
                    label={timeLabel}
                    value={timeDraft ?? (current ? formatTime(current.minutes) : '')}
                    onChange={(event) => changeTime(event.currentTarget.value)}
                    onBlur={() => setTimeDraft(null)}
                  />
                )}
                <div className="env-date-time-actions">
                  <Button
                    variant="text"
                    aria-disabled={!nowAvailable || undefined}
                    onClick={() => {
                      if (nowAvailable) chooseNow();
                    }}
                  >
                    {withTime ? nowLabel : todayLabel}
                  </Button>
                  <span className="env-date-time-actions-end">
                    {clearable && serialized && (
                      <Button variant="text" onClick={clear}>
                        {clearLabel}
                      </Button>
                    )}
                    {withTime && (
                      <Button variant="secondary" onClick={() => setOpen(false)}>
                        {doneLabel}
                      </Button>
                    )}
                  </span>
                </div>
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </Theme>
        </BasePopover.Portal>
      </BasePopover.Root>
    </DirectionProvider>
  );
}
