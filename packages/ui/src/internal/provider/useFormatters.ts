'use client';

import { useMemo } from 'react';
import { useResolvedLocale } from './locale.js';
import { formattersFor, type Formatters } from './formatters.js';

/**
 * Cached Intl formatters in the component's locale (see useResolvedLocale), for numbers, dates and
 * times, relative times, plural rules and lists.
 *
 *   const format = useFormatters();
 *   format.number({ maximumFractionDigits: 1 }).format(4.25);
 */
export function useFormatters(own?: string): Formatters {
  const locale = useResolvedLocale(own);
  return useMemo(() => formattersFor(locale), [locale]);
}
