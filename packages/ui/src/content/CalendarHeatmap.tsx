'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { TooltipPopup } from '../feedback/internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useFormatters, type Formatters } from '../internal/useFormatters.js';
import { calendarHeatmap as calendarHeatmapMessages } from '../foundations/messages/calendarHeatmap.js';
import type { BadgeTone } from './Badge.js';

export interface CalendarHeatmapDay {
  /** The day, as YYYY-MM-DD. */
  date: string;
  /** The day's value, such as a count; it chooses the color step. */
  value: number;
  /** The value in words, such as 4 deployments; replaces formatValue's text for this day. */
  label?: string;
}

/** A day as shown: days without data have the value 0. */
export interface CalendarHeatmapCell extends CalendarHeatmapDay {
  /** The color step, from 0 for an empty day to levels - 1. */
  level: number;
}

interface CalendarHeatmapOptions {
  /** Values by day; days without an entry count as 0. */
  data: readonly CalendarHeatmapDay[];
  /** The first day shown, as YYYY-MM-DD; the earliest day in data by default. */
  startDate?: string;
  /** The last day shown, as YYYY-MM-DD; the latest day in data by default. */
  endDate?: string;
  /** Color steps including the empty step, 2 to 10; 5 by default. */
  levels?: number;
  /** The value that takes the strongest color; the largest value shown by default. */
  maxValue?: number;
  /**
   * The lowest value of each color step above the empty one, in ascending order, such as quantiles
   * of the data to color by rank. Up to nine; they replace levels and maxValue. A day below the
   * first threshold shows as empty, and a first threshold of 0 or less colors days of 0 too.
   */
  thresholds?: readonly number[];
  /** The first day of each week column: 0 for Sunday (default) or 1 for Monday. */
  weekStart?: 0 | 1;
  /** The tone the colors are mixed from: accent by default. */
  tone?: BadgeTone;
  /**
   * Text for a value.
   * @default the number format of EnvUIProvider's locale, or else the browser's
   */
  formatValue?: (value: number) => string;
  /**
   * Text for a day's date, in its accessible name and the default tooltip.
   * @default the weekday, day, month and year in the locale, such as Tue 14 Oct 2025
   */
  formatDate?: (date: string) => string;
  /** Tooltip content for a day; the date and value by default. */
  formatTooltip?: (day: CalendarHeatmapCell) => ReactNode;
  /**
   * Twelve month names above the weeks, from January.
   * @default the locale's short month names, from Intl
   */
  monthLabels?: readonly string[];
  /**
   * Seven weekday names beside the rows, from Sunday.
   * @default the locale's short weekday names, from Intl
   */
  weekdayLabels?: readonly string[];
  /**
   * Legend text before the lightest color. It overrides EnvUIProvider's
   * `messages.calendarHeatmap.less`.
   * @default 'Less'
   */
  lessLabel?: string;
  /**
   * Legend text after the strongest color. It overrides EnvUIProvider's
   * `messages.calendarHeatmap.more`.
   * @default 'More'
   */
  moreLabel?: string;
}

/** The grid of days needs a name: aria-label or aria-labelledby. */
type CalendarHeatmapName =
  | {
      /** Names the grid of days, such as "Deployments in the last year"; this or aria-labelledby. */
      'aria-label': string;
      /** The id of visible text that names the grid of days, such as a heading; this or aria-label. */
      'aria-labelledby'?: string;
    }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type CalendarHeatmapProps = CalendarHeatmapOptions &
  CalendarHeatmapName &
  Omit<
    ComponentPropsWithRef<'div'>,
    keyof CalendarHeatmapOptions | 'children' | 'aria-label' | 'aria-labelledby'
  >;

const dayMilliseconds = 86_400_000;

/** The locale's short month names, from January, and weekday names, from Sunday. */
function localeNames(formatters: Formatters) {
  const month = formatters.dateTime({ month: 'short', timeZone: 'UTC' });
  const weekday = formatters.dateTime({ weekday: 'short', timeZone: 'UTC' });
  return {
    months: Array.from({ length: 12 }, (_, index) => month.format(Date.UTC(2024, index, 1))),
    // 7 January 2024 was a Sunday.
    weekdays: Array.from({ length: 7 }, (_, index) => weekday.format(Date.UTC(2024, 0, 7 + index))),
  };
}
/** Hover waits like Tooltip; moving between days while one is shown switches at once. */
const hoverDelay = 400;

/** Days count from 1970-01-01 in UTC, so daylight saving never shifts a week. */
function parseDay(date: string | undefined) {
  const match = date === undefined ? null : /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return undefined;
  return Math.floor(Date.UTC(+match[1]!, +match[2]! - 1, +match[3]!) / dayMilliseconds);
}

function dayParts(day: number) {
  const date = new Date(day * dayMilliseconds);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    date: date.getUTCDate(),
    weekday: date.getUTCDay(),
  };
}

function dayKey(day: number) {
  const { year, month, date } = dayParts(day);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

interface DayModel extends CalendarHeatmapCell {
  day: number;
  name: string;
}

interface CalendarHeatmapModel {
  start: number;
  end: number;
  /** The first day of the first week column. */
  first: number;
  weeks: number;
  levelCount: number;
  days: Map<number, DayModel>;
  months: { column: number; span: number; label: string }[];
}

/**
 * The strength of each color step, from 30% of the tone over the canvas to the full tone at the
 * strongest step; with a single step above the empty one, that step is the tone.
 */
function levelMix(level: number, levelCount: number) {
  if (levelCount <= 2) return '100%';
  return `${30 + (70 * (level - 1)) / (levelCount - 2)}%`;
}

/**
 * A calendar of daily values with weeks as columns and weekdays as rows, colored in steps of a tone.
 * Each day names its date and value, shows them in a tooltip on hover and focus, and the grid is
 * one tab stop that the arrow keys move through.
 */
export function CalendarHeatmap({
  data,
  startDate,
  endDate,
  levels = 5,
  maxValue,
  thresholds,
  weekStart = 0,
  tone = 'accent',
  formatValue: ownFormatValue,
  formatDate: ownFormatDate,
  formatTooltip,
  monthLabels: ownMonthLabels,
  weekdayLabels: ownWeekdayLabels,
  lessLabel: ownLessLabel,
  moreLabel: ownMoreLabel,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  className,
  style,
  ...props
}: CalendarHeatmapProps) {
  // A prop wins over the provider's messages and locale, which win over English and the runtime's.
  const messages = useMessages('calendarHeatmap', calendarHeatmapMessages);
  const lessLabel = ownLessLabel ?? messages.less;
  const moreLabel = ownMoreLabel ?? messages.more;
  const formatters = useFormatters();
  const names = useMemo(() => localeNames(formatters), [formatters]);
  const monthLabels = ownMonthLabels ?? names.months;
  const weekdayLabels = ownWeekdayLabels ?? names.weekdays;
  const formatValue = useMemo(
    () => ownFormatValue ?? ((value: number) => formatters.number().format(value)),
    [ownFormatValue, formatters],
  );
  const formatDate = useMemo(() => {
    if (ownFormatDate) return ownFormatDate;
    // Names given as props make the date from them; else the locale writes the whole date.
    if (ownMonthLabels || ownWeekdayLabels)
      return (date: string) => {
        const parts = dayParts(parseDay(date)!);
        return `${weekdayLabels[parts.weekday]} ${parts.date} ${monthLabels[parts.month]} ${parts.year}`;
      };
    const format = formatters.dateTime({
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return (date: string) => format.format(parseDay(date)! * dayMilliseconds);
  }, [ownFormatDate, ownMonthLabels, ownWeekdayLabels, monthLabels, weekdayLabels, formatters]);
  // Thresholds compare by value, so a new array with the same steps keeps the model.
  const thresholdsKey = thresholds?.join(' ');
  const model = useMemo<CalendarHeatmapModel>(() => {
    const steps = thresholdsKey
      ?.split(' ')
      .filter(Boolean)
      .map(Number)
      .filter(Number.isFinite)
      .sort((first, second) => first - second)
      .slice(0, 9);
    const values = new Map<number, CalendarHeatmapDay>();
    for (const entry of data) {
      const day = parseDay(entry.date);
      if (day !== undefined) values.set(day, entry);
    }
    let earliest: number | undefined;
    let latest: number | undefined;
    for (const day of values.keys()) {
      if (earliest === undefined || day < earliest) earliest = day;
      if (latest === undefined || day > latest) latest = day;
    }
    const start = parseDay(startDate) ?? earliest;
    const end = parseDay(endDate) ?? latest;
    const levelCount = steps?.length
      ? steps.length + 1
      : Math.min(10, Math.max(2, Math.round(levels)));
    if (start === undefined || end === undefined || end < start)
      return { start: 0, end: -1, first: 0, weeks: 0, levelCount, days: new Map(), months: [] };
    const offset = (day: number) => (dayParts(day).weekday - weekStart + 7) % 7;
    const first = start - offset(start);
    const weeks = (end - offset(end) - first) / 7 + 1;
    let top = maxValue ?? 0;
    if (maxValue === undefined)
      for (const [day, entry] of values)
        if (day >= start && day <= end) top = Math.max(top, entry.value);
    const days = new Map<number, DayModel>();
    // Each month is labelled above the week holding its first day, or above the first week.
    const monthColumns = new Map<number, number>([[0, dayParts(start).month]]);
    for (let day = start; day <= end; day += 1) {
      const entry = values.get(day);
      const value = entry?.value ?? 0;
      // Explicit thresholds decide alone, also for values of 0 and below.
      const level = steps?.length
        ? steps.filter((step) => value >= step).length
        : value > 0 && top > 0
          ? Math.min(levelCount - 1, Math.max(1, Math.ceil((value / top) * (levelCount - 1))))
          : 0;
      const date = dayKey(day);
      const valueText = entry?.label ?? formatValue(value);
      days.set(day, {
        day,
        date,
        value,
        label: entry?.label,
        level,
        name: `${formatDate(date)}: ${valueText}`,
      });
      const parts = dayParts(day);
      if (parts.date === 1) monthColumns.set(Math.floor((day - first) / 7), parts.month);
    }
    const columns = [...monthColumns.keys()].sort((a, b) => a - b);
    const months = columns.map((column, index) => ({
      column,
      span: (columns[index + 1] ?? weeks) - column,
      label: monthLabels[monthColumns.get(column)!] ?? '',
    }));
    return { start, end, first, weeks, levelCount, days, months };
  }, [
    data,
    startDate,
    endDate,
    levels,
    maxValue,
    thresholdsKey,
    weekStart,
    formatValue,
    formatDate,
    monthLabels,
  ]);

  const [activeDay, setActiveDay] = useState<number>();
  const active =
    activeDay !== undefined && activeDay >= model.start && activeDay <= model.end
      ? activeDay
      : model.end;
  // One tooltip serves every day: it follows the hovered or focused day and leaves no portal at rest.
  // A closing tooltip keeps its day and anchor while it fades.
  const [tip, setTip] = useState<{
    day: number;
    anchor: HTMLElement;
    open: boolean;
    /** Shown for the focused day rather than the hovered one. */
    focused: boolean;
    /** The gap between days, which the tooltip keeps from its day. */
    offset: number;
  } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const popup = useRef<HTMLDivElement>(null);
  // A mouse press focuses its day as a hover would, so that tooltip takes the pointer too; keyboard
  // focus and taps open one that takes none.
  const mousePress = useRef(false);
  const grid = useRef<HTMLTableElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // Narrow containers scroll inside the heatmap, starting at the most recent weeks. It stays there
  // as the weeks settle, such as when the web font loads, until the person scrolls it.
  const pinned = useRef(true);
  useLayoutEffect(() => {
    const element = scroller.current;
    const table = grid.current;
    if (!element || !table) return;
    pinned.current = true;
    const toEnd = () => {
      if (!pinned.current) return;
      const rtl = getComputedStyle(element).direction === 'rtl';
      element.scrollLeft = rtl ? -element.scrollWidth : element.scrollWidth;
    };
    toEnd();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(toEnd);
    observer.observe(element);
    observer.observe(table);
    return () => observer.disconnect();
  }, [model.end]);

  function unpin() {
    pinned.current = false;
  }

  function cellFrom(target: EventTarget | null) {
    return target instanceof Element ? target.closest<HTMLElement>('td[data-day]') : null;
  }

  function show(cell: HTMLElement, focused = false) {
    clearTimeout(hoverTimer.current);
    // The tooltip meets its day across the gap between days, so the pointer reaches it from the
    // day without crossing another day. It reaches a pixel into the gap, so rounding its position
    // never leaves a sliver of the next day showing.
    const table = grid.current;
    const gap = table ? Number.parseFloat(getComputedStyle(table).borderSpacing) || 0 : 0;
    const offset = Math.max(0, gap - 1);
    setTip({ day: Number(cell.dataset.day), anchor: cell, open: true, focused, offset });
  }

  /** Whether the pointer moved onto the tooltip, which keeps it open on its day. */
  function intoTooltip(target: EventTarget | null) {
    return target instanceof Node && Boolean(popup.current?.contains(target));
  }

  function hide() {
    clearTimeout(hoverTimer.current);
    setTip((current) => current && { ...current, open: false });
  }

  // A tooltip opened by focus closes once the pointer moves away from the days, so it never stays
  // over what people reach for next. Moves of a few pixels, or none, as when the page scrolls under
  // a resting pointer, keep it.
  const focusTipOpen = Boolean(tip?.open && tip.focused);
  useEffect(() => {
    if (!focusTipOpen) return;
    const document = grid.current?.ownerDocument;
    let origin: { x: number; y: number } | undefined;
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse' || grid.current?.contains(event.target as Node)) return;
      origin ??= { x: event.clientX, y: event.clientY };
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 4) hide();
    };
    document?.addEventListener('pointermove', move);
    return () => document?.removeEventListener('pointermove', move);
  }, [focusTipOpen]);

  // Escape hides an open tooltip wherever focus is, such as on a dialog's close button while the
  // pointer rests on the tooltip, and goes no further, so an enclosing dialog stays open. With Ctrl,
  // Alt or Meta it leaves the tooltip and goes on, so an enclosing dialog closes.
  const tipOpen = Boolean(tip?.open);
  useEffect(() => {
    if (!tipOpen) return;
    const view = grid.current?.ownerDocument.defaultView;
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      // Escape with a modifier belongs to whatever handles it.
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      hide();
    };
    view?.addEventListener('keydown', escape, true);
    return () => view?.removeEventListener('keydown', escape, true);
  }, [tipOpen]);

  // A press ends wherever its pointer is released, also outside the grid, or when it is cancelled.
  useEffect(() => {
    const page = grid.current?.ownerDocument;
    const release = () => {
      mousePress.current = false;
    };
    page?.addEventListener('pointerup', release, true);
    page?.addEventListener('pointercancel', release, true);
    return () => {
      page?.removeEventListener('pointerup', release, true);
      page?.removeEventListener('pointercancel', release, true);
    };
  }, []);

  function handlePointerOver(event: PointerEvent<HTMLTableElement>) {
    if (event.pointerType === 'touch') return;
    const cell = cellFrom(event.target);
    if (!cell) return;
    clearTimeout(hoverTimer.current);
    if (tip?.open) show(cell);
    else hoverTimer.current = setTimeout(() => show(cell), hoverDelay);
  }

  function handleFocus(event: FocusEvent<HTMLTableElement>) {
    // A tap focuses its day too, so touch shows the value on tap.
    const cell = cellFrom(event.target);
    const byMouse = mousePress.current;
    mousePress.current = false;
    if (!cell) return;
    setActiveDay(Number(cell.dataset.day));
    show(cell, !byMouse);
  }

  function handleBlur(event: FocusEvent<HTMLTableElement>) {
    if (grid.current?.contains(event.relatedTarget as Node | null)) return;
    // A tooltip the pointer rests on stays, on the days or on the tooltip itself.
    if (!grid.current?.matches(':hover') && !popup.current?.matches(':hover')) hide();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.altKey || event.metaKey) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const week = rtl ? -7 : 7;
    // As in a grid, Home and End move along the row, the same weekday in the first and the last
    // week; Page Up and Page Down along the column, to the week's first and last day; and Ctrl+Home
    // and Ctrl+End to the first and the last day.
    const row = (active - model.first) % 7;
    const weekStartDay = active - row;
    const firstOfRow = model.first + row;
    const lastOfRow = model.first + (model.weeks - 1) * 7 + row;
    const moves: Record<string, number> = event.ctrlKey
      ? { Home: model.start, End: model.end }
      : {
          ArrowUp: active - 1,
          ArrowDown: active + 1,
          ArrowLeft: active - week,
          ArrowRight: active + week,
          Home: firstOfRow < model.start ? firstOfRow + 7 : firstOfRow,
          End: lastOfRow > model.end ? lastOfRow - 7 : lastOfRow,
          PageUp: Math.max(model.start, weekStartDay),
          PageDown: Math.min(model.end, weekStartDay + 6),
        };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    if (next < model.start || next > model.end) return;
    grid.current?.querySelector<HTMLElement>(`td[data-day="${next}"]`)?.focus();
  }

  const shown = tip ? model.days.get(tip.day) : undefined;
  const legendLevels = Array.from({ length: model.levelCount }, (_, level) => level);
  return (
    <div
      {...props}
      className={classNames('env-calendar-heatmap', className)}
      style={style}
      data-tone={tone}
    >
      <div
        className="env-calendar-heatmap-scroll"
        ref={scroller}
        onPointerDown={unpin}
        onWheel={unpin}
        onKeyDown={unpin}
      >
        <table
          ref={grid}
          role="grid"
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-readonly="true"
          className="env-calendar-heatmap-grid"
          onPointerOver={handlePointerOver}
          onPointerDown={(event) => {
            mousePress.current = event.pointerType === 'mouse';
          }}
          onPointerLeave={(event) => {
            if (!intoTooltip(event.relatedTarget)) hide();
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          <CalendarHeatmapDays
            model={model}
            active={active}
            weekStart={weekStart}
            weekdayLabels={weekdayLabels}
          />
        </table>
      </div>
      <div className="env-calendar-heatmap-legend" aria-hidden="true">
        <span>{lessLabel}</span>
        {legendLevels.map((level) => (
          <span
            key={level}
            className="env-calendar-heatmap-swatch"
            data-level={level}
            style={
              level > 0
                ? ({
                    '--env-calendar-heatmap-mix': levelMix(level, model.levelCount),
                  } as CSSProperties)
                : undefined
            }
          />
        ))}
        <span>{moreLabel}</span>
      </div>
      <BaseTooltip.Root
        open={tip?.open ?? false}
        onOpenChange={(open, details) => {
          // Escape with a modifier belongs to whatever handles it.
          const key = details.reason === 'escape-key' ? details.event : undefined;
          if (key && (key.ctrlKey || key.altKey || key.metaKey)) {
            details.cancel();
            details.allowPropagation();
            return;
          }
          // Presses on the days move the tooltip rather than closing it.
          if (open || (details.event && cellFrom(details.event.target))) return;
          hide();
        }}
      >
        <TooltipPopup
          side="top"
          anchor={tip?.anchor}
          sideOffset={tip?.offset ?? 0}
          positionerClassName="env-calendar-heatmap-tooltip-positioner"
          popupProps={{
            ref: popup,
            className: 'env-calendar-heatmap-tooltip',
            'data-focus-opened': tip?.focused ? '' : undefined,
            onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
              // Back on the days, the day under the pointer takes the tooltip.
              if (!grid.current?.contains(event.relatedTarget as Node | null)) hide();
            },
          }}
          content={
            shown &&
            (formatTooltip
              ? formatTooltip({
                  date: shown.date,
                  value: shown.value,
                  label: shown.label,
                  level: shown.level,
                })
              : shown.name)
          }
        />
      </BaseTooltip.Root>
    </div>
  );
}

/** The month row and the seven weekday rows; hovering and the tooltip do not render them again. */
const CalendarHeatmapDays = memo(function CalendarHeatmapDays({
  model,
  active,
  weekStart,
  weekdayLabels,
}: {
  model: CalendarHeatmapModel;
  active: number;
  weekStart: 0 | 1;
  weekdayLabels: readonly string[];
}) {
  const weeks = Array.from({ length: model.weeks }, (_, week) => week);
  return (
    <>
      <thead aria-hidden="true">
        <tr>
          <th className="env-calendar-heatmap-corner" />
          {model.months.map(({ column, span, label }) => (
            <th key={column} colSpan={span} className="env-calendar-heatmap-month">
              {/* A month shorter than two weeks leaves its name out, so names never overlap. */}
              {span >= 2 && <span>{label}</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 7 }, (_, row) => {
          const weekday = (weekStart + row) % 7;
          return (
            <tr key={row}>
              <th className="env-calendar-heatmap-weekday" aria-hidden="true">
                {weekday % 2 === 1 && <span>{weekdayLabels[weekday]}</span>}
              </th>
              {weeks.map((week) => {
                const day = model.first + week * 7 + row;
                const entry = model.days.get(day);
                // Keyed by day, so the tooltip's anchor stays with its day when the range changes.
                if (!entry)
                  return <td key={day} className="env-calendar-heatmap-pad" aria-hidden="true" />;
                return (
                  <td
                    key={day}
                    role="gridcell"
                    tabIndex={day === active ? 0 : -1}
                    aria-label={entry.name}
                    className="env-calendar-heatmap-day"
                    data-day={day}
                    data-date={entry.date}
                    data-level={entry.level}
                    style={
                      entry.level > 0
                        ? ({
                            '--env-calendar-heatmap-mix': levelMix(entry.level, model.levelCount),
                          } as CSSProperties)
                        : undefined
                    }
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </>
  );
});
