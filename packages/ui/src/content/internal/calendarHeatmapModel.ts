import type { CSSProperties } from 'react';
import type { Formatters } from '../../internal/useFormatters.js';
import { dayParts, formatDay, parseDay } from '../../internal/calendarDays.js';
import type { CalendarHeatmapCell, CalendarHeatmapDay } from '../CalendarHeatmap.js';

/** The locale's short month names, from January, and weekday names, from Sunday. */
export function localeNames(formatters: Formatters) {
  const month = formatters.dateTime({ month: 'short', timeZone: 'UTC' });
  const weekday = formatters.dateTime({ weekday: 'short', timeZone: 'UTC' });
  return {
    months: Array.from({ length: 12 }, (_, index) => month.format(Date.UTC(2024, index, 1))),
    // 7 January 2024 was a Sunday.
    weekdays: Array.from({ length: 7 }, (_, index) => weekday.format(Date.UTC(2024, 0, 7 + index))),
  };
}

interface DayModel extends CalendarHeatmapCell {
  day: number;
  name: string;
}

export interface CalendarHeatmapModel {
  /** The dates the model couldn't read, such as 2026-02-31, which it leaves out. */
  invalid: string[];
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
export function levelMix(level: number, levelCount: number) {
  if (levelCount <= 2) return '100%';
  return `${30 + (70 * (level - 1)) / (levelCount - 2)}%`;
}

/** A color step's custom property: its strength, on every step above the empty one. */
export function levelStyle(level: number, levelCount: number): CSSProperties | undefined {
  return level > 0
    ? ({ '--env-calendar-heatmap-mix': levelMix(level, levelCount) } as CSSProperties)
    : undefined;
}

/**
 * The day a key moves to from `active`, or undefined for a key the grid doesn't take. As in a grid,
 * Home and End move along the row, the same weekday in the first and the last week; Page Up and
 * Page Down along the column, to the week's first and last day; and Ctrl+Home and Ctrl+End to the
 * first and the last day. Left and Right follow the text direction.
 */
export function heatmapKeyTarget(
  model: CalendarHeatmapModel,
  active: number,
  { key, ctrlKey }: { key: string; ctrlKey: boolean },
  rtl: boolean,
): number | undefined {
  const week = rtl ? -7 : 7;
  const row = (active - model.first) % 7;
  const weekStartDay = active - row;
  const firstOfRow = model.first + row;
  const lastOfRow = model.first + (model.weeks - 1) * 7 + row;
  const moves: Record<string, number> = ctrlKey
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
  return moves[key];
}

interface ModelOptions {
  data: readonly CalendarHeatmapDay[];
  startDate: string | undefined;
  endDate: string | undefined;
  levels: number;
  maxValue: number | undefined;
  /** The thresholds joined by spaces, so that a new array with the same steps keeps the model. */
  thresholdsKey: string | undefined;
  weekStart: number;
  formatValue: (value: number) => string;
  formatDate: (date: string) => string;
  monthLabels: readonly string[];
}

/** The days a CalendarHeatmap shows, each with its level and name, and the months above them. */
export function calendarHeatmapModel({
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
}: ModelOptions): CalendarHeatmapModel {
  const steps = thresholdsKey
    ?.split(' ')
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite)
    .sort((first, second) => first - second)
    .slice(0, 9);
  const values = new Map<number, CalendarHeatmapDay>();
  const invalid: string[] = [];
  for (const entry of data) {
    const day = parseDay(entry.date);
    if (day !== undefined) values.set(day, entry);
    else invalid.push(entry.date);
  }
  let earliest: number | undefined;
  let latest: number | undefined;
  for (const day of values.keys()) {
    if (earliest === undefined || day < earliest) earliest = day;
    if (latest === undefined || day > latest) latest = day;
  }
  const start = parseDay(startDate) ?? earliest;
  const end = parseDay(endDate) ?? latest;
  for (const date of [startDate, endDate])
    if (date !== undefined && parseDay(date) === undefined) invalid.push(date);
  const levelCount = steps?.length
    ? steps.length + 1
    : Math.min(10, Math.max(2, Math.round(levels)));
  if (start === undefined || end === undefined || end < start)
    return {
      invalid,
      start: 0,
      end: -1,
      first: 0,
      weeks: 0,
      levelCount,
      days: new Map(),
      months: [],
    };
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
    const date = formatDay(day);
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
  return { invalid, start, end, first, weeks, levelCount, days, months };
}
