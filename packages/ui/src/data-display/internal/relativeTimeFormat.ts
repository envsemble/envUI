import { formattersFor } from '../../internal/provider/formatters.js';
import type { RelativeTimeOptions, RelativeTimeValue } from '../formatRelativeTime.js';

export function toTime(value: RelativeTimeValue | undefined) {
  return new Date(value ?? Number.NaN).getTime();
}

export function dateTimeFormatter(locale: RelativeTimeOptions['locale']) {
  return formattersFor(locale).dateTime({ dateStyle: 'medium', timeStyle: 'short' });
}
