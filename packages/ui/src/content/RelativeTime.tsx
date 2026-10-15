import { useCallback, useContext, useSyncExternalStore, type ComponentPropsWithRef } from 'react';
import { Tooltip } from '../feedback/Tooltip.js';
import { TooltipNestingContext } from '../feedback/internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { useHydrated } from '../internal/useHydrated.js';
import { subscribeToClock } from './internal/relativeTimeClock.js';

/** A moment: a Date, milliseconds since 1970 or a date string such as an ISO 8601 timestamp. */
export type RelativeTimeValue = Date | number | string;

export interface RelativeTimeOptions {
  /** The moment to compare with; the current time by default, also in place of an invalid one. */
  now?: Date | number;
  /** Language of the text, such as "en-GB" or "de"; the runtime's default by default. */
  locale?: string | readonly string[];
  /** long "3 hours ago" (default), short "3 hr. ago" or narrow "3h ago". */
  format?: 'long' | 'short' | 'narrow';
  /**
   * Text for a moment less than 45 seconds away: "just now" for past moments in English, "now"
   * for coming ones, and the locale's own word for now in other languages.
   */
  nowLabel?: string;
}

const second = 1_000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const month = 30.436875 * day;
const year = 365.2425 * day;

/** Milliseconds since 1970, or NaN for an invalid moment or one outside the range of Date. */
function toTime(value: RelativeTimeValue | undefined) {
  return new Date(value ?? Number.NaN).getTime();
}

/**
 * The unit and count that describe a distance in time, rounded so the text changes at the
 * midpoints: under 45 seconds is now, then minutes below 45, hours below 22, days below a week,
 * weeks below 26 days, months below 11 and years.
 */
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

const formatters = new Map<string, Intl.RelativeTimeFormat | Intl.DateTimeFormat>();

function relativeFormatter(
  locale: RelativeTimeOptions['locale'],
  style: NonNullable<RelativeTimeOptions['format']>,
  numeric: 'always' | 'auto',
) {
  const key = `relative|${String(locale ?? '')}|${style}|${numeric}`;
  let formatter = formatters.get(key) as Intl.RelativeTimeFormat | undefined;
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale as Intl.LocalesArgument, { style, numeric });
    formatters.set(key, formatter);
  }
  return formatter;
}

function dateTimeFormatter(locale: RelativeTimeOptions['locale']) {
  const key = `absolute|${String(locale ?? '')}`;
  let formatter = formatters.get(key) as Intl.DateTimeFormat | undefined;
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale as Intl.LocalesArgument, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/**
 * A moment as text relative to another, by default the current time, such as "in 2 days",
 * "3 hours ago" or "just now", through Intl.RelativeTimeFormat. An invalid moment gives an empty
 * string; an invalid now is ignored, as by RelativeTime, for the current time.
 */
export function formatRelativeTime(value: RelativeTimeValue, options: RelativeTimeOptions = {}) {
  const { locale, format = 'long', nowLabel } = options;
  const time = toTime(value);
  const given = toTime(options.now);
  const now = Number.isFinite(given) ? given : Date.now();
  if (!Number.isFinite(time)) return '';
  const unit = relativeUnit(time - now);
  if (unit) return relativeFormatter(locale, format, 'always').format(...unit);
  if (nowLabel !== undefined) return nowLabel;
  const auto = relativeFormatter(locale, format, 'auto');
  // English says just now of a moment that has passed; Intl has only now, in every language.
  if (time <= now && auto.resolvedOptions().locale.split('-')[0] === 'en') return 'just now';
  return auto.format(0, 'second');
}

export interface RelativeTimeProps
  extends Omit<ComponentPropsWithRef<'time'>, 'children' | 'dateTime'>,
    Omit<RelativeTimeOptions, 'now'> {
  /** The moment to describe. */
  value: RelativeTimeValue;
  /**
   * A fixed moment to compare with, for tests and server rendering; the text then stays as it is.
   * Without it, or with an invalid one, the text follows the current time.
   */
  now?: Date | number;
  /**
   * Show the date and time in a tooltip on hover; true by default. Inside an application's own
   * Tooltip, that one describes the time instead.
   */
  tooltip?: boolean;
}

/**
 * A moment in a time element as text relative to now, such as "3 hours ago", with the date and
 * time in a tooltip. One shared clock keeps every RelativeTime on the page current.
 */
export function RelativeTime({
  value,
  now,
  locale,
  format = 'long',
  nowLabel,
  tooltip = true,
  className,
  ...props
}: RelativeTimeProps) {
  const time = toTime(value);
  // An invalid now, such as from missing data, leaves the text to the clock.
  const given = now === undefined ? undefined : toTime(now);
  const fixedNow = given !== undefined && Number.isFinite(given) ? given : undefined;
  // Inside an application's own Tooltip, that tooltip describes the time.
  const nested = useContext(TooltipNestingContext);
  const live = fixedNow === undefined && Number.isFinite(time);
  const subscribe = useCallback(
    (onTick: () => void) => (live ? subscribeToClock(time, onTick) : () => {}),
    [live, time],
  );
  const read = () => formatRelativeTime(time, { now: fixedNow, locale, format, nowLabel });
  const text = useSyncExternalStore(subscribe, read, read);
  const hydrated = useHydrated();
  if (!Number.isFinite(time)) return null;
  const element = (
    <time
      dir="auto"
      {...props}
      dateTime={new Date(time).toISOString()}
      className={classNames('env-relative-time', className)}
      // The server's clock, time zone or language can differ from the browser's. The text then
      // differs while hydrating, which is expected: it is rendered as a separate text node until
      // hydration ends, then replaced by the browser's text, so the server's never lingers.
      suppressHydrationWarning
    >
      {hydrated ? text : [text]}
    </time>
  );
  if (!tooltip || nested) return element;
  return <Tooltip content={<DateAndTime time={time} locale={locale} />}>{element}</Tooltip>;
}

/** Formatted only while the tooltip shows, so a long list does not format dates it never shows. */
function DateAndTime({ time, locale }: { time: number; locale: RelativeTimeOptions['locale'] }) {
  return dateTimeFormatter(locale).format(time);
}
