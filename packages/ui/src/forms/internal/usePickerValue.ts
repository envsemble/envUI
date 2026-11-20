'use client';

import { useMemo } from 'react';
import { dateFormat, withHourCycle } from './calendarDays.js';
import { useResolvedLocale } from '../../internal/provider/useFormatters.js';
import { useControllableState } from '../../internal/react/useControllableState.js';

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

export function usePickerFormatter(
  locale: string | undefined,
  formatOptions: Intl.DateTimeFormatOptions | undefined,
  fallback: Intl.DateTimeFormatOptions,
  hourCycle?: 'h12' | 'h23',
) {
  const shownLocale = useResolvedLocale(locale);
  const optionsKeyStableAcrossInlineObjects = JSON.stringify(formatOptions ?? fallback);
  const formatter = useMemo(
    () =>
      dateFormat(
        shownLocale,
        withHourCycle(
          JSON.parse(optionsKeyStableAcrossInlineObjects) as Intl.DateTimeFormatOptions,
          hourCycle,
        ),
      ),
    [shownLocale, optionsKeyStableAcrossInlineObjects, hourCycle],
  );
  return { shownLocale, formatter };
}
