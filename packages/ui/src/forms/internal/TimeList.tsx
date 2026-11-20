'use client';

import { useMemo, useRef, useState, type ComponentPropsWithRef } from 'react';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { useResolvedLocale } from '../../internal/provider/locale.js';
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
  value: number | undefined;
  onValueChange: (minutes: number) => void;
  minuteStep?: number;
  min?: number;
  max?: number;
  start?: number;
  locale?: string;
  hourCycle?: 'h12' | 'h23';
}

export function timeListFirstColumn(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-time-list-column') ?? null;
}

const firstHourOfEachHalf = [60, 13 * 60];

const pad = (number: number) => String(number).padStart(2, '0');

function anyMinuteWithinBounds(
  from: number,
  to: number,
  min: number | undefined,
  max: number | undefined,
) {
  return (min === undefined || to >= min) && (max === undefined || from <= max);
}

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
      periodLabels: firstHourOfEachHalf.map((minutes) => partOf(minutes, 'dayPeriod')),
      cycle,
    };
  }, [shownLocale, hourCycle]);

  const [nowOnTheStep] = useState(() => roundToStep(now().minutes, step));
  const timeAChoiceCompletes = value ?? start ?? nowOnTheStep;
  const [baseHour, baseMinute] = [Math.floor(timeAChoiceCompletes / 60), timeAChoiceCompletes % 60];
  const basePeriod = baseHour < 12 ? 0 : 1;

  const hours = clock.hour12
    ? Array.from({ length: 12 }, (_, hour): Entry => {
        const hour24 = basePeriod * 12 + hour;
        const shown = clock.cycle === 'h11' ? hour : hour || 12;
        return {
          value: hour,
          label: clock.hourLabel(hour24),
          disabled: !anyMinuteWithinBounds(hour24 * 60, hour24 * 60 + 59, min, max),
          keys: [String(shown), pad(shown)],
        };
      })
    : Array.from({ length: 24 }, (_, hour): Entry => ({
        value: hour,
        label: clock.hourLabel(hour),
        disabled: !anyMinuteWithinBounds(hour * 60, hour * 60 + 59, min, max),
        keys: [pad(hour), String(hour)],
      }));
  const minutes = minuteSteps(step, value === undefined ? undefined : baseMinute).map(
    (minute): Entry => ({
      value: minute,
      label: clock.minuteLabel(minute),
      disabled: !anyMinuteWithinBounds(baseHour * 60 + minute, baseHour * 60 + minute, min, max),
      keys: [pad(minute)],
    }),
  );
  const periods = [0, 1].map((period): Entry => ({
    value: period,
    label: clock.periodLabels[period],
    disabled: !anyMinuteWithinBounds(period * 720, period * 720 + 719, min, max),
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
              const settledOnTheTimeShownWithoutValue =
                value === undefined && chosen === column.current;
              if (!settledOnTheTimeShownWithoutValue) onValueChange(column.compose(chosen));
            }}
            onSideways={(direction) => focusColumn(index + direction)}
          />
        );
      })}
    </div>
  );
}
