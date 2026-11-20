'use client';

import { useMemo } from 'react';
import { useLocale } from './EnvUIContext.js';
import { defaultServerLocale } from './locale.js';
import { useHydrated } from '../react/useHydrated.js';
import { formattersFor, type Formatters } from './formatters.js';

/**
 * The locale a component formats in: the `locale` it is given, else the nearest EnvUIProvider's,
 * else the runtime's once hydrated. Until then, the server and the first client render use
 * defaultServerLocale, so their markup is equal.
 */
export function useResolvedLocale(own?: string): string | undefined {
  const provided = useLocale();
  const hydrated = useHydrated();
  return own ?? provided ?? (hydrated ? undefined : defaultServerLocale);
}

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
