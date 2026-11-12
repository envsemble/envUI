import { day as dayMilliseconds, minute } from './durations.js';

/** A day of the week: 0 for Sunday through 6 for Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const minutesPerDay = 24 * 60;

/**
 * Days count from 1970-01-01 in UTC and times as minutes after midnight, so arithmetic and
 * formatting never meet daylight saving: a value is a wall-clock date and time, without a zone.
 */
function utcDay(year: number, month: number, date: number) {
  const time = new Date(0);
  time.setUTCFullYear(year, month, date);
  return Math.floor(time.getTime() / dayMilliseconds);
}

export function dayParts(day: number) {
  const date = new Date(day * dayMilliseconds);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    date: date.getUTCDate(),
    // getUTCDay gives 0 to 6.
    weekday: date.getUTCDay() as Weekday,
  };
}

/** A YYYY-MM-DD day, or undefined for an empty or impossible date such as 2026-02-30. */
export function parseDay(value: string | null | undefined) {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match) return undefined;
  const [year, month, date] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const day = utcDay(year, month, date);
  const parts = dayParts(day);
  return parts.year === year && parts.month === month && parts.date === date ? day : undefined;
}

export function formatDay(day: number) {
  const { year, month, date } = dayParts(day);
  return `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

/** A local YYYY-MM-DDTHH:mm value, also with seconds, which are dropped. */
export function parseDateTime(value: string | null | undefined) {
  const match = value
    ? /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value)
    : null;
  if (!match) return undefined;
  const day = parseDay(match[1]);
  const minutes = parseTime(`${match[2]}:${match[3]}`);
  return day === undefined || minutes === undefined ? undefined : { day, minutes };
}

/** An HH:mm time as minutes after midnight. */
export function parseTime(value: string | null | undefined) {
  const match = value ? /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value) : null;
  if (!match) return undefined;
  const [hours, minutes] = [Number(match[1]), Number(match[2])];
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : undefined;
}

export function formatTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function formatDateTime(day: number, minutes: number) {
  return `${formatDay(day)}T${formatTime(minutes)}`;
}

/** The moment as minutes since 1970-01-01, for comparing date-and-time values. */
export function momentOf(day: number, minutes: number) {
  return day * minutesPerDay + minutes;
}

export function fromMoment(moment: number) {
  const day = Math.floor(moment / minutesPerDay);
  // Moments before 1970 are negative: the minutes count on from the day's start all the same.
  return { day, minutes: moment - day * minutesPerDay };
}

/** Today and the current time on the reader's own clock. */
export function now() {
  const time = new Date();
  return {
    day: utcDay(time.getFullYear(), time.getMonth(), time.getDate()),
    minutes: time.getHours() * 60 + time.getMinutes(),
  };
}

function daysInMonth(year: number, month: number) {
  return dayParts(utcDay(year, month + 1, 0)).date;
}

/** The same date months later or earlier, on the month's last day where the month is shorter. */
export function addMonths(day: number, months: number) {
  const { year, month, date } = dayParts(day);
  const target = new Date(0);
  target.setUTCFullYear(year, month + months, 1);
  const [targetYear, targetMonth] = [target.getUTCFullYear(), target.getUTCMonth()];
  return utcDay(targetYear, targetMonth, Math.min(date, daysInMonth(targetYear, targetMonth)));
}

export function monthStart(day: number) {
  const { year, month } = dayParts(day);
  return utcDay(year, month, 1);
}

export function clampDay(day: number, min: number | undefined, max: number | undefined) {
  if (min !== undefined && day < min) return min;
  if (max !== undefined && day > max) return max;
  return day;
}

/** A time list's step in whole minutes, from 1 to 60; 15 without one. */
export function minuteStepOf(step: number | undefined) {
  if (step === undefined || !Number.isFinite(step)) return 15;
  return Math.min(60, Math.max(1, Math.round(step)));
}

/**
 * The minutes a time list's minute column offers: every step from 0 through the hour, with a
 * chosen minute that falls between steps in its place among them.
 */
export function minuteSteps(step: number, selected?: number) {
  const minutes: number[] = [];
  for (let minute = 0; minute < 60; minute += step) minutes.push(minute);
  if (selected !== undefined && selected >= 0 && selected < 60 && selected % step) {
    minutes.splice(Math.ceil(selected / step), 0, selected);
  }
  return minutes;
}

/** A time of day moved to the nearest step of its hour, on into the next hour from its last step. */
export function roundToStep(minutes: number, step: number) {
  const [hour, minute] = [Math.floor(minutes / 60), minutes % 60];
  const rounded = Math.round(minute / step) * step;
  return rounded >= 60 ? ((hour + 1) % 24) * 60 : hour * 60 + rounded;
}

/**
 * The first of a column's entries whose typed forms start with the typed text and that can be
 * chosen, or -1.
 */
export function matchTyped(
  typed: string,
  entries: readonly { keys: readonly string[]; disabled?: boolean }[],
) {
  return entries.findIndex(
    (entry) => !entry.disabled && entry.keys.some((key) => key.startsWith(typed)),
  );
}

/** A YYYY-MM month as months since January of year 0, or undefined for an empty or impossible one. */
export function parseMonth(value: string | null | undefined) {
  const match = value ? /^(\d{4})-(\d{2})$/.exec(value) : null;
  if (!match) return undefined;
  const [year, month] = [Number(match[1]), Number(match[2]) - 1];
  return month >= 0 && month < 12 ? year * 12 + month : undefined;
}

export function formatMonth(month: number) {
  const year = Math.floor(month / 12);
  return `${String(year).padStart(4, '0')}-${String(month - year * 12 + 1).padStart(2, '0')}`;
}

/** The month a day is in, counted as parseMonth counts. */
export function monthOfDay(day: number) {
  const { year, month } = dayParts(day);
  return year * 12 + month;
}

/** The first day of a month counted as parseMonth counts. */
export function monthFirstDay(month: number) {
  const year = Math.floor(month / 12);
  return utcDay(year, month - year * 12, 1);
}

export function clampMonth(month: number, min: number | undefined, max: number | undefined) {
  return clampDay(month, min, max);
}

/** Intl formatting of a day or a wall-clock moment: always in UTC, the zone the counts are in. */
export function toUtcDate(day: number, minutes = 0) {
  return new Date(day * dayMilliseconds + minutes * minute);
}

/**
 * Formats days and moments of the Gregorian calendar the grid shows, in UTC, with the locale's
 * language and digits: a locale with a calendar of its own, such as Persian, names Gregorian months
 * too. Options can choose another calendar.
 */
export function dateFormat(locale: string | undefined, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, { calendar: 'gregory', ...options, timeZone: 'UTC' });
}

/** The options on the given clock, in place of the locale's and of any hour12 they set. */
export function withHourCycle(
  options: Intl.DateTimeFormatOptions,
  hourCycle: 'h12' | 'h23' | undefined,
): Intl.DateTimeFormatOptions {
  return hourCycle ? { ...options, hour12: undefined, hourCycle } : options;
}

type LocaleWithWeekInfo = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
};

/** The first day of the week where the locale is used, or Monday where the browser cannot tell. */
export function localeWeekStart(locale: string | undefined): Weekday {
  try {
    const resolved = new Intl.DateTimeFormat(locale).resolvedOptions().locale;
    // TypeScript's Intl types don't have the week's information yet.
    const info = new Intl.Locale(resolved) as LocaleWithWeekInfo;
    // Week info numbers Monday 1 through Sunday 7.
    const firstDay = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    if (firstDay !== undefined && firstDay >= 1 && firstDay <= 7) return (firstDay % 7) as Weekday;
  } catch {
    // An unknown locale falls back to Monday, like a browser without week info.
  }
  return 1;
}
