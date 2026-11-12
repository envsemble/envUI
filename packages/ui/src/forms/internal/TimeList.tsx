'use client';

import { useMemo, useRef, useState, type ComponentPropsWithRef } from 'react';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { useResolvedLocale } from '../../internal/provider/useFormatters.js';
import { timePicker as timePickerMessages } from '../../foundations/messages/timePicker.js';
import {
  dateFormat,
  minuteStepOf,
  minuteSteps,
  now,
  roundToStep,
  toUtcDate,
  withHourCycle,
} from '../../internal/time/calendarDays.js';
import { TimeWheel } from './TimeWheel.js';
import type { Entry, Part } from './timeWheelRows.js';
import '../../styles/Base.css';
import '../../styles/TimeList.css';
import '../../styles/DatePicker.css';

export interface TimeListProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange'
> {
  /** The chosen time as minutes after midnight, or undefined for none. */
  value: number | undefined;
  /** Receives the chosen time as minutes after midnight. */
  onValueChange: (minutes: number) => void;
  /** The minutes between the minute column's entries, from 1 to 60; 15 by default. */
  minuteStep?: number;
  /** The earliest time that can be chosen, as minutes after midnight. */
  min?: number;
  /** The latest time that can be chosen, as minutes after midnight. */
  max?: number;
  /**
   * The time a choice in one column completes while there is no value, as minutes after midnight;
   * the current time on the minute step by default.
   */
  start?: number;
  /** The locale the times are written in, with its own 12- or 24-hour clock. */
  locale?: string;
  /** The clock, h12 or h23, whatever the locale's; the locale's by default. */
  hourCycle?: 'h12' | 'h23';
}

/** The first column of a time list, where focus goes as a popup with the list opens. */
export function timeListFirstColumn(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-time-list-column') ?? null;
}

const pad = (number: number) => String(number).padStart(2, '0');

/** Whether any minute from `from` through `to` lies within min and max. */
function overlaps(from: number, to: number, min: number | undefined, max: number | undefined) {
  return (min === undefined || to >= min) && (max === undefined || from <= max);
}

/**
 * A time of day to choose on wheels side by side, each a spinbutton: the hours, the minutes every
 * `minuteStep`, and on a 12-hour clock the day's halves, in the order the locale writes them. The
 * middle rows, each on its own fill, read as the time, and turning any wheel chooses the whole time.
 * On a wheel the arrow keys step by one, wrapping around, Page Up and Page Down by five, Home and
 * End to its ends, and digits or a day period's first letter to the entry they name; Left and Right
 * move between the wheels. Name the group with aria-label or aria-labelledby.
 */
export function TimeList({
  value,
  onValueChange,
  minuteStep,
  min,
  max,
  start,
  locale,
  hourCycle,
  className,
  ...props
}: TimeListProps) {
  const messages = useMessages('timePicker', timePickerMessages);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const shownLocale = useResolvedLocale(locale);
  const step = minuteStepOf(minuteStep);
  // Times are wall-clock minutes, formatted in UTC so no zone shifts them, on the locale's clock
  // unless hourCycle sets one.
  const clock = useMemo(() => {
    const format = dateFormat(shownLocale, withHourCycle({ timeStyle: 'short' }, hourCycle));
    const cycle = format.resolvedOptions().hourCycle;
    const partOf = (minutes: number, type: Part) =>
      format.formatToParts(toUtcDate(0, minutes)).find((part) => part.type === type)?.value ?? '';
    const hour12 = cycle === 'h11' || cycle === 'h12';
    const order = [
      ...new Set(
        format
          .formatToParts(toUtcDate(0, 13 * 60))
          .map((part) => part.type)
          .filter((type): type is Part => ['hour', 'minute', 'dayPeriod'].includes(type)),
      ),
    ];
    return {
      hour12,
      order: hour12 ? order : order.filter((part) => part !== 'dayPeriod'),
      hourLabel: (hour: number) => partOf(hour * 60, 'hour'),
      minuteLabel: (minute: number) => partOf(minute, 'minute'),
      // The first hour of each half, so a locale that names parts of the day names the halves.
      periodLabels: [partOf(60, 'dayPeriod'), partOf(13 * 60, 'dayPeriod')],
      cycle,
    };
  }, [shownLocale, hourCycle]);

  // Without a value, a choice in one column completes the time the others show.
  const [startState] = useState(() => roundToStep(now().minutes, step));
  const base = value ?? start ?? startState;
  const [baseHour, baseMinute] = [Math.floor(base / 60), base % 60];
  const basePeriod = baseHour < 12 ? 0 : 1;

  const hours = clock.hour12
    ? Array.from({ length: 12 }, (_, hour): Entry => {
        const hour24 = basePeriod * 12 + hour;
        const shown = clock.cycle === 'h11' ? hour : hour || 12;
        return {
          value: hour,
          label: clock.hourLabel(hour24),
          disabled: !overlaps(hour24 * 60, hour24 * 60 + 59, min, max),
          keys: [String(shown), pad(shown)],
        };
      })
    : Array.from({ length: 24 }, (_, hour): Entry => ({
        value: hour,
        label: clock.hourLabel(hour),
        disabled: !overlaps(hour * 60, hour * 60 + 59, min, max),
        keys: [pad(hour), String(hour)],
      }));
  const minutes = minuteSteps(step, value === undefined ? undefined : baseMinute).map(
    (minute): Entry => ({
      value: minute,
      label: clock.minuteLabel(minute),
      disabled: !overlaps(baseHour * 60 + minute, baseHour * 60 + minute, min, max),
      keys: [pad(minute)],
    }),
  );
  const periods = [0, 1].map((period): Entry => ({
    value: period,
    label: clock.periodLabels[period],
    disabled: !overlaps(period * 720, period * 720 + 719, min, max),
    keys: [clock.periodLabels[period].toLocaleLowerCase(shownLocale), period ? 'p' : 'a'],
  }));

  const columns: Record<
    Part,
    { label: string; entries: Entry[]; current: number; compose: (v: number) => number }
  > = {
    hour: {
      label: messages.hours,
      entries: hours,
      current: clock.hour12 ? baseHour % 12 : baseHour,
      compose: (hour) => (clock.hour12 ? basePeriod * 12 + hour : hour) * 60 + baseMinute,
    },
    minute: {
      label: messages.minutes,
      entries: minutes,
      current: baseMinute,
      compose: (minute) => baseHour * 60 + minute,
    },
    dayPeriod: {
      label: messages.dayPeriod,
      entries: periods,
      current: basePeriod,
      compose: (period) => (period * 12 + (baseHour % 12)) * 60 + baseMinute,
    },
  };

  function focusColumn(index: number) {
    columnsRef.current[index]?.focus();
  }

  return (
    <div
      role="group"
      {...props}
      className={classNames('env-time-list', className)}
      data-columns={clock.order.length}
    >
      {clock.order.map((part, index) => {
        const column = columns[part];
        return (
          <TimeWheel
            key={part}
            ref={(node) => {
              columnsRef.current[index] = node;
            }}
            part={part}
            label={column.label}
            entries={column.entries}
            current={column.current}
            onChoose={(chosen) => {
              // A wheel that settles on the time already shown leaves the value as it is.
              if (value !== undefined || chosen !== column.current)
                onValueChange(column.compose(chosen));
            }}
            onSideways={(direction) => focusColumn(index + direction)}
          />
        );
      })}
    </div>
  );
}
