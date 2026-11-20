import { relativeTime as relativeTimeMessages } from '../foundations/messages/relativeTime.js';
import { day, hour, minute, second } from '../internal/time/durations.js';
import { formattersFor } from '../internal/provider/formatters.js';

/** A moment: a Date, milliseconds since 1970 or a date string such as an ISO 8601 timestamp. */
export type RelativeTimeValue = Date | number | string;

export interface RelativeTimeOptions {
  /**
   * The moment to compare with, as a Date or milliseconds since 1970; the current time by default,
   * also in place of an invalid one.
   */
  now?: Date | number;
  /**
   * The language of the text, and of the date and time in RelativeTime's tooltip, as a BCP 47
   * tag such as "en-GB" or "de", or a list of them in order of preference.
   * @default EnvUIProvider's locale for RelativeTime, else the runtime's language: the browser's,
   * or the server's while rendering there
   */
  locale?: string | readonly string[];
  /**
   * How long the words are, from Intl.RelativeTimeFormat: long "3 hours ago", short "3 hr. ago" or
   * narrow "3h ago", in the locale's own wording.
   * @default 'long'
   */
  format?: 'long' | 'short' | 'narrow';
  /**
   * Text for a moment less than 45 seconds away, past or coming, such as "moments ago". English
   * says "just now" of a past moment and "now" of a coming one; other languages the locale's word.
   * RelativeTime takes EnvUIProvider's `messages.relativeTime.now` without it.
   * @default 'just now' or 'now' in English, the locale's word for now elsewhere
   */
  nowLabel?: string;
}

const month = 30.436875 * day;
const year = 365.2425 * day;

function calendarDaysBetween(from: number, to: number) {
  const startOfDay = (time: number) => {
    const date = new Date(time);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  };
  return Math.round((startOfDay(to) - startOfDay(from)) / day);
}

export function toTime(value: RelativeTimeValue | undefined) {
  return new Date(value ?? Number.NaN).getTime();
}

function relativeUnit(distance: number): [number, Intl.RelativeTimeFormatUnit] | undefined {
  const away = Math.abs(distance);
  const sign = distance < 0 ? -1 : 1;
  if (away < 45 * second) return undefined;
  const minutes = Math.round(away / minute);
  if (minutes < 45) return [sign * minutes, 'minute'];
  const hours = Math.round(away / hour);
  if (hours < 22) return [sign * hours, 'hour'];
  const days = Math.round(away / day);
  if (days < 7) return [sign * days, 'day'];
  if (days < 26) return [sign * Math.round(days / 7), 'week'];
  const months = Math.round(away / month);
  if (months < 11) return [sign * months, 'month'];
  return [sign * Math.max(1, Math.round(away / year)), 'year'];
}

function relativeFormatter(
  locale: RelativeTimeOptions['locale'],
  style: NonNullable<RelativeTimeOptions['format']>,
  numeric: 'always' | 'auto',
) {
  return formattersFor(locale).relativeTime({ style, numeric });
}

export function dateTimeFormatter(locale: RelativeTimeOptions['locale']) {
  return formattersFor(locale).dateTime({ dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * A moment as text relative to another, by default the current time, such as "in 2 days",
 * "3 hours ago", "yesterday" or "just now", through Intl.RelativeTimeFormat. A moment a day or so
 * away on the next or the previous calendar day reads "tomorrow" or "yesterday", in the locale's
 * words. An invalid moment gives an empty
 * string; an invalid now is ignored, as by RelativeTime, for the current time.
 */
export function formatRelativeTime(value: RelativeTimeValue, options: RelativeTimeOptions = {}) {
  const { locale, format = 'long', nowLabel } = options;
  const time = toTime(value);
  const givenNow = toTime(options.now);
  const now = Number.isFinite(givenNow) ? givenNow : Date.now();
  if (!Number.isFinite(time)) return '';
  const unit = relativeUnit(time - now);
  const calendarDays = calendarDaysBetween(now, time);
  if (unit?.[1] === 'day' && Math.abs(calendarDays) === 1)
    return relativeFormatter(locale, format, 'auto').format(calendarDays, 'day');
  if (unit) return relativeFormatter(locale, format, 'always').format(...unit);
  if (nowLabel !== undefined) return nowLabel;
  const auto = relativeFormatter(locale, format, 'auto');
  const english = auto.resolvedOptions().locale.split('-')[0] === 'en';
  const englishJustNowThatIntlLacks = time <= now && english;
  if (englishJustNowThatIntlLacks) return relativeTimeMessages.now;
  return auto.format(0, 'second');
}
