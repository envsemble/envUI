'use client';

import { useMemo } from 'react';
import { useLocale } from './EnvUIContext.js';
import { defaultServerLocale } from './locale.js';
import { useHydrated } from '../react/useHydrated.js';

/** Intl formatters, cached per locale and options, so components share them. */
const cache = new Map<string, unknown>();

function cached<Formatter>(
  kind: string,
  locale: string | undefined,
  options: object | undefined,
  create: () => Formatter,
): Formatter {
  const key = `${kind}\u0000${locale ?? ''}\u0000${JSON.stringify(options ?? {})}`;
  if (!cache.has(key)) cache.set(key, create());
  // The key says what create made, set on the line above.
  return cache.get(key) as Formatter;
}

/** The formatters of one locale. */
export interface Formatters {
  /** The locale they format in; undefined for the runtime's. */
  locale: string | undefined;
  number(options?: Intl.NumberFormatOptions): Intl.NumberFormat;
  dateTime(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
  relativeTime(options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat;
  plural(options?: Intl.PluralRulesOptions): Intl.PluralRules;
  list(options?: Intl.ListFormatOptions): Intl.ListFormat;
}

/** The formatters of a locale, undefined for the runtime's, created once per locale and options. */
function formattersFor(locale: string | undefined): Formatters {
  return {
    locale,
    number: (options) =>
      cached('number', locale, options, () => new Intl.NumberFormat(locale, options)),
    dateTime: (options) =>
      cached('dateTime', locale, options, () => new Intl.DateTimeFormat(locale, options)),
    relativeTime: (options) =>
      cached('relativeTime', locale, options, () => new Intl.RelativeTimeFormat(locale, options)),
    plural: (options) =>
      cached('plural', locale, options, () => new Intl.PluralRules(locale, options)),
    list: (options) => cached('list', locale, options, () => new Intl.ListFormat(locale, options)),
  };
}

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
