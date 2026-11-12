'use client';

import { useMemo } from 'react';
import { dateFormat, withHourCycle } from '../../internal/time/calendarDays.js';
import { useResolvedLocale } from '../../internal/provider/useFormatters.js';
import { useControllableState } from '../../internal/react/useControllableState.js';

/**
 * The value of a date, time or month picker as its owner holds it: the one it is given, or one it
 * keeps itself. Returns the value as text, a function that sets it, which reports it unless it is
 * already `serialized`, the value the field holds, and one that restores the default after a form
 * reset.
 */
export function usePickerValue({
  value,
  defaultValue,
  onValueChange,
}: {
  value: string | null | undefined;
  defaultValue: string | null;
  onValueChange: ((value: string | null) => void) | undefined;
}) {
  const [raw, report, keepOwn] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  return {
    raw,
    change(next: string | null, serialized: string) {
      if ((next ?? '') !== serialized) report(next);
    },
    reset() {
      keepOwn(defaultValue);
    },
  };
}

/**
 * The formatter that shows a picker's value: its formatOptions, else the picker's own, with the
 * hour cycle where one is given. On the server, and while its output hydrates, a field without a
 * locale shows the value as every browser shows it, then in the reader's language. Values are
 * wall-clock dates and times, which the formatter takes in UTC, so no zone shifts them.
 */
export function usePickerFormatter(
  locale: string | undefined,
  formatOptions: Intl.DateTimeFormatOptions | undefined,
  fallback: Intl.DateTimeFormatOptions,
  hourCycle?: 'h12' | 'h23',
) {
  const shownLocale = useResolvedLocale(locale);
  // Keys, so options written inline in each render don't make a new formatter.
  const optionsKey = JSON.stringify(formatOptions ?? fallback);
  const formatter = useMemo(
    () =>
      dateFormat(
        shownLocale,
        withHourCycle(JSON.parse(optionsKey) as Intl.DateTimeFormatOptions, hourCycle),
      ),
    [shownLocale, optionsKey, hourCycle],
  );
  return { shownLocale, formatter };
}
