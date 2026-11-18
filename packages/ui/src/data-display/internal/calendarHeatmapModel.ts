import type { CSSProperties } from 'react';
import type { Formatters } from '../../internal/provider/useFormatters.js';
import { dayParts, formatDay, parseDay } from '../../internal/time/calendarDays.js';
import type { CalendarHeatmapCell, CalendarHeatmapDay } from '../CalendarHeatmap.js';

const firstSundayOfJanuary2024 = 7;

export function localeNames(formatters: Formatters) {
  const month = formatters.dateTime({ month: 'short', timeZone: 'UTC' });
  const weekday = formatters.dateTime({ weekday: 'short', timeZone: 'UTC' });
  return {
    months: Array.from({ length: 12 }, (_, index) => month.format(Date.UTC(2024, index, 1))),
    weekdays: Array.from({ length: 7 }, (_, index) =>
      weekday.format(Date.UTC(2024, 0, firstSundayOfJanuary2024 + index)),
    ),
  };
}

interface DayModel extends CalendarHeatmapCell {
  day: number;
  name: string;
}

export interface CalendarHeatmapModel {
  invalid: string[];
  start: number;
  end: number;
  first: number;
  weeks: number;
  levelCount: number;
  days: Map<number, DayModel>;
  months: { column: number; span: number; label: string }[];
}

const weakestStepTonePercent = 40;

function levelTonePercent(level: number, levelCount: number) {
  const onlyOneStepAboveEmpty = levelCount <= 2;
  if (onlyOneStepAboveEmpty) return '100%';
  const strongerSteps = 100 - weakestStepTonePercent;
  return `${weakestStepTonePercent + (strongerSteps * (level - 1)) / (levelCount - 2)}%`;
}

export function levelStyle(level: number, levelCount: number): CSSProperties | undefined {
  return level > 0 ? { '--_calendar-heatmap-mix': levelTonePercent(level, levelCount) } : undefined;
}

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
  thresholdsKey: string | undefined;
  weekStart: number;
  formatValue: (value: number) => string;
  formatDate: (date: string) => string;
  monthLabels: readonly string[];
}

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
  const monthByLabelColumn = new Map<number, number>([[0, dayParts(start).month]]);
  for (let day = start; day <= end; day += 1) {
    const entry = values.get(day);
    const value = entry?.value ?? 0;
    const level = steps?.length
      ? levelFromThresholdsAlone(steps, value)
      : levelScaledToTop(value, top, levelCount);
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
    if (parts.date === 1) monthByLabelColumn.set(Math.floor((day - first) / 7), parts.month);
  }
  const columns = [...monthByLabelColumn].sort(([a], [b]) => a - b);
  const months = columns.map(([column, month], index) => ({
    column,
    span: (columns[index + 1]?.[0] ?? weeks) - column,
    label: monthLabels[month] ?? '',
  }));
  return { invalid, start, end, first, weeks, levelCount, days, months };
}

function levelFromThresholdsAlone(steps: readonly number[], value: number) {
  return steps.filter((step) => value >= step).length;
}

function levelScaledToTop(value: number, top: number, levelCount: number) {
  const hasValueAndTop = value > 0 && top > 0;
  if (!hasValueAndTop) return 0;
  return Math.min(levelCount - 1, Math.max(1, Math.ceil((value / top) * (levelCount - 1))));
}
