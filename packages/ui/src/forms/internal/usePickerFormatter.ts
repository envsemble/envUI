'use client';

import { useMemo } from 'react';
import { dateFormat, withHourCycle } from './calendarDays.js';
import { useResolvedLocale } from '../../internal/provider/locale.js';

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
