'use client';

import {
  useCallback,
  useContext,
  useSyncExternalStore,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { Tooltip } from '../overlays/Tooltip.js';
import { TooltipNestingContext } from '../internal/popup/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { hoverDetailClass } from '../internal/trigger/hoverDetail.js';
import { useEnvUI } from '../internal/provider/EnvUIContext.js';
import { useHydrated } from '../internal/react/useHydrated.js';
import { subscribeToClock } from './internal/relativeTimeClock.js';
import {
  formatRelativeTime,
  type RelativeTimeOptions,
  type RelativeTimeValue,
} from './formatRelativeTime.js';
import { dateTimeFormatter, toTime } from './internal/relativeTimeFormat.js';
import '../styles/Base.css';
import '../styles/RelativeTime.css';

export interface RelativeTimeProps
  extends
    Omit<ComponentPropsWithRef<'time'>, 'children' | 'dateTime'>,
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
   * @default true
   */
  tooltip?: boolean;
  /**
   * The tooltip's content from the moment, such as the time with its time zone, in UTC, or "Edited
   * by Alex Morgan at 9:41"; the date and time in the locale by default.
   */
  renderTooltip?: (date: Date) => ReactNode;
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
  renderTooltip,
  className,
  ...props
}: RelativeTimeProps) {
  const provider = useEnvUI();
  const locale = ownLocale ?? provider.locale;
  const nowLabel = ownNowLabel ?? (provider.messages.relativeTime?.now as string | undefined);
  const time = toTime(value);
  const givenNow = now === undefined ? undefined : toTime(now);
  const fixedNow = givenNow !== undefined && Number.isFinite(givenNow) ? givenNow : undefined;
  const insideApplicationTooltip = useContext(TooltipNestingContext);
  const live = fixedNow === undefined && Number.isFinite(time);
  const subscribe = useCallback(
    (onTick: () => void) => (live ? subscribeToClock(time, onTick) : () => {}),
    [live, time],
  );
  const read = () => formatRelativeTime(time, { now: fixedNow, locale, format, nowLabel });
  const text = useSyncExternalStore(subscribe, read, read);
  const hydrated = useHydrated();
  if (!Number.isFinite(time)) return null;
  const withTooltip = tooltip && !insideApplicationTooltip;
  const hoverDetailTooltipDoesNotAddToParts = withTooltip && hoverDetailClass;
  const serverTextAsSeparateNodeUntilHydrated = hydrated ? text : [text];
  const element = (
    <time
      dir="auto"
      {...props}
      dateTime={new Date(time).toISOString()}
      className={classNames('env-relative-time', hoverDetailTooltipDoesNotAddToParts, className)}
      suppressHydrationWarning
    >
      {serverTextAsSeparateNodeUntilHydrated}
    </time>
  );
  if (!withTooltip) return element;
  return (
    <Tooltip
      content={
        <DateAndTimeFormattedOnlyWhenShown time={time} locale={locale} format={renderTooltip} />
      }
    >
      {element}
    </Tooltip>
  );
}

function DateAndTimeFormattedOnlyWhenShown({
  time,
  locale,
  format,
}: {
  time: number;
  locale: RelativeTimeOptions['locale'];
  format: RelativeTimeProps['renderTooltip'];
}) {
  return format ? format(new Date(time)) : dateTimeFormatter(locale).format(time);
}
