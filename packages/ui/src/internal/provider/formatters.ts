/**
 * A locale as Intl takes it: a BCP 47 tag, a list of them in order of preference, or undefined for
 * the runtime's.
 */
export type FormatLocale = string | readonly string[] | undefined;

const sharedFormatters = new Map<string, unknown>();

function cached<Formatter>(
  kind: string,
  locale: FormatLocale,
  options: object | undefined,
  create: () => Formatter,
): Formatter {
  const key = `${kind}\u0000${String(locale ?? '')}\u0000${JSON.stringify(options ?? {})}`;
  if (!sharedFormatters.has(key)) sharedFormatters.set(key, create());
  return sharedFormatters.get(key) as Formatter;
}

/** The formatters of one locale. */
export interface Formatters {
  /** The locale they format in; undefined for the runtime's. */
  locale: FormatLocale;
  number(options?: Intl.NumberFormatOptions): Intl.NumberFormat;
  dateTime(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
  relativeTime(options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat;
  plural(options?: Intl.PluralRulesOptions): Intl.PluralRules;
  list(options?: Intl.ListFormatOptions): Intl.ListFormat;
}

/** The Intl formatters of a locale, each made once per locale and options and then shared. */
export function formattersFor(locale: FormatLocale): Formatters {
  const locales = locale as Intl.LocalesArgument;
  return {
    locale,
    number: (options) =>
      cached('number', locale, options, () => new Intl.NumberFormat(locales, options)),
    dateTime: (options) =>
      cached('dateTime', locale, options, () => new Intl.DateTimeFormat(locales, options)),
    relativeTime: (options) =>
      cached('relativeTime', locale, options, () => new Intl.RelativeTimeFormat(locales, options)),
    plural: (options) =>
      cached('plural', locale, options, () => new Intl.PluralRules(locales, options)),
    list: (options) => cached('list', locale, options, () => new Intl.ListFormat(locales, options)),
  };
}
