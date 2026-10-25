'use client';

import { useCallback, useContext, useSyncExternalStore, type ComponentPropsWithRef } from 'react';
import { Tooltip } from '../feedback/Tooltip.js';
import { TooltipNestingContext } from '../feedback/internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { hoverDetailClass } from '../internal/hoverDetail.js';
import { useEnvUI } from '../internal/EnvUIContext.js';
import { useHydrated } from '../internal/useHydrated.js';
import { subscribeToClock } from './internal/relativeTimeClock.js';
import {
  dateTimeFormatter,
  formatRelativeTime,
  toTime,
  type RelativeTimeOptions,
  type RelativeTimeValue,
} from './formatRelativeTime.js';

export interface RelativeTimeProps
  extends Omit<ComponentPropsWithRef<'time'>, 'children' | 'dateTime'>,
    Omit<RelativeTimeOptions, 'now'> {
  /**
   * The moment to describe: a Date, milliseconds since 1970 or a date string such as an ISO 8601
   * timestamp. An invalid moment renders nothing.
   */
  value: RelativeTimeValue;
  /**
   * A fixed moment to compare with, for tests and server rendering; the text then stays as it is.
   * Without it, or with an invalid one, the text follows the current time.
   */
  now?: Date | number;
  /**
   * Show the date and time in a tooltip on hover, such as "Oct 14, 2026, 9:41 AM", in the
   * reader's time zone and the locale. Turn it off where the exact moment shows nearby. Inside an
   * application's own Tooltip, that one describes the time instead.
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
  locale: ownLocale,
  format = 'long',
  nowLabel: ownNowLabel,
  tooltip = true,
  className,
  ...props
}: RelativeTimeProps) {
  // A prop wins over the nearest EnvUIProvider's locale and messages.relativeTime.now; without
  // either, the runtime's locale, and English's "just now" or the locale's own word.
  const provider = useEnvUI();
  const locale = ownLocale ?? provider.locale;
  const nowLabel = ownNowLabel ?? (provider.messages.relativeTime?.now as string | undefined);
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
  const withTooltip = tooltip && !nested;
  const element = (
    <time
      dir="auto"
      {...props}
      dateTime={new Date(time).toISOString()}
      // With a tooltip of its own, the time takes the dotted underline of text with more on hover,
      // which Tooltip gives text it recognises but not another component's part.
      className={classNames('env-relative-time', withTooltip && hoverDetailClass, className)}
      // The server's clock, time zone or language can differ from the browser's. The text then
      // differs while hydrating, which is expected: it is rendered as a separate text node until
      // hydration ends, then replaced by the browser's text, so the server's never lingers.
      suppressHydrationWarning
    >
      {hydrated ? text : [text]}
    </time>
  );
  if (!withTooltip) return element;
  return <Tooltip content={<DateAndTime time={time} locale={locale} />}>{element}</Tooltip>;
}

/** Formatted only while the tooltip shows, so a long list does not format dates it never shows. */
function DateAndTime({ time, locale }: { time: number; locale: RelativeTimeOptions['locale'] }) {
  return dateTimeFormatter(locale).format(time);
}
