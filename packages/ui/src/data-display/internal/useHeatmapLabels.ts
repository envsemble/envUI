'use client';

import { useMemo } from 'react';
import { useFormatters, useResolvedLocale } from '../../internal/useFormatters.js';
import { dayParts, localeWeekStart, parseDay, type Weekday } from '../../internal/calendarDays.js';
import { day as dayMilliseconds } from '../../internal/durations.js';
import { localeNames } from './calendarHeatmapModel.js';

interface HeatmapLabelOptions {
  weekStart: Weekday | undefined;
  formatValue: ((value: number) => string) | undefined;
  formatDate: ((date: string) => string) | undefined;
  monthLabels: readonly string[] | undefined;
  weekdayLabels: readonly string[] | undefined;
}

/**
 * A CalendarHeatmap's week start, names of months and weekdays, and how it writes values and dates:
 * a prop wins over the provider's locale, which wins over the runtime's.
 */
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
  const namesGiven = Boolean(ownMonthLabels || ownWeekdayLabels);
  // The model formats only the days it could read, so parseDay finds each date it is given.
  const formatDate = useMemo(() => {
    if (ownFormatDate) return ownFormatDate;
    // Names given as props make the date from them; else the locale writes the whole date.
    if (namesGiven)
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
  }, [ownFormatDate, namesGiven, monthLabels, weekdayLabels, formatters]);
  return { weekStart, monthLabels, weekdayLabels, formatValue, formatDate };
}
