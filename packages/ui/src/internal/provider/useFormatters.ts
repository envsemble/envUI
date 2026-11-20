'use client';

import { useMemo } from 'react';
import { useResolvedLocale } from './locale.js';

const sharedFormatters = new Map<string, unknown>();

function cached<Formatter>(
  kind: string,
  locale: string | undefined,
  options: object | undefined,
  create: () => Formatter,
): Formatter {
  const key = `${kind}\u0000${locale ?? ''}\u0000${JSON.stringify(options ?? {})}`;
  if (!sharedFormatters.has(key)) sharedFormatters.set(key, create());
  return sharedFormatters.get(key) as Formatter;
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
