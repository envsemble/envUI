'use client';

import { useMemo } from 'react';
import { useFormatters, useResolvedLocale } from '../../internal/provider/useFormatters.js';
import {
  dayParts,
  localeWeekStart,
  parseDay,
  type Weekday,
} from '../../internal/time/calendarDays.js';
import { day as dayMilliseconds } from '../../internal/time/durations.js';
import { localeNames } from './calendarHeatmapModel.js';

interface HeatmapLabelOptions {
  weekStart: Weekday | undefined;
  formatValue: ((value: number) => string) | undefined;
  formatDate: ((date: string) => string) | undefined;
  monthLabels: readonly string[] | undefined;
  weekdayLabels: readonly string[] | undefined;
}

export function useHeatmapLabels({
  weekStart: ownWeekStart,
  formatValue: ownFormatValue,
  formatDate: ownFormatDate,
  monthLabels: ownMonthLabels,
  weekdayLabels: ownWeekdayLabels,
}: HeatmapLabelOptions) {
  const formatters = useFormatters();
  const resolvedLocale = useResolvedLocale();
  const weekStart = useMemo(
    () => ownWeekStart ?? localeWeekStart(resolvedLocale),
    [ownWeekStart, resolvedLocale],
  );
  const names = useMemo(() => localeNames(formatters), [formatters]);
  const monthLabels = ownMonthLabels ?? names.months;
  const weekdayLabels = ownWeekdayLabels ?? names.weekdays;
  const formatValue = useMemo(
    () => ownFormatValue ?? ((value: number) => formatters.number().format(value)),
    [ownFormatValue, formatters],
  );
  const monthOrWeekdayNamesGiven = Boolean(ownMonthLabels || ownWeekdayLabels);
  const formatDate = useMemo(() => {
    if (ownFormatDate) return ownFormatDate;
    if (monthOrWeekdayNamesGiven)
      return (date: string) => {
        const parts = dayParts(parseDayTheModelRead(date));
        return `${weekdayLabels[parts.weekday]} ${parts.date} ${monthLabels[parts.month]} ${parts.year}`;
      };
    const format = formatters.dateTime({
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return (date: string) => format.format(parseDayTheModelRead(date) * dayMilliseconds);
  }, [ownFormatDate, monthOrWeekdayNamesGiven, monthLabels, weekdayLabels, formatters]);
  return { weekStart, monthLabels, weekdayLabels, formatValue, formatDate };
}

function parseDayTheModelRead(date: string) {
  return parseDay(date)!;
}
