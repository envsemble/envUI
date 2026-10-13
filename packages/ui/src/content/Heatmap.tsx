import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Theme, useTheme } from '../foundations/Theme.js';
import { classNames } from '../internal/classNames.js';
import type { BadgeTone } from './Badge.js';

export interface HeatmapDay {
  /** The day, as YYYY-MM-DD. */
  date: string;
  value: number;
  /** The value in words, such as 4 deployments; replaces formatValue's text for this day. */
  label?: string;
}

/** A day as shown: days without data have the value 0. */
export interface HeatmapCell extends HeatmapDay {
  /** The color step, from 0 for an empty day to levels - 1. */
  level: number;
}

interface HeatmapOptions {
  /** Values by day; days without an entry count as 0. */
  data: readonly HeatmapDay[];
  /** The first day shown, as YYYY-MM-DD; the earliest day in data by default. */
  startDate?: string;
  /** The last day shown, as YYYY-MM-DD; the latest day in data by default. */
  endDate?: string;
  /** Color steps including the empty step, 2 to 10; 5 by default. */
  levels?: number;
  /** The value that takes the strongest color; the largest value shown by default. */
  maxValue?: number;
  /**
   * The lowest value of each color step above the empty one, in ascending order, such as quantiles
   * of the data to color by rank. Up to nine; they replace levels and maxValue. A day below the
   * first threshold shows as empty.
   */
  thresholds?: readonly number[];
  /** The first day of each week column: 0 for Sunday (default) or 1 for Monday. */
  weekStart?: 0 | 1;
  /** The tone the colors are mixed from: accent by default. */
  tone?: BadgeTone;
  /** Text for a value; English digit grouping by default. */
  formatValue?: (value: number) => string;
  /** Text for a day's date, in its accessible name and the default tooltip. */
  formatDate?: (date: string) => string;
  /** Tooltip content for a day; the date and value by default. */
  formatTooltip?: (day: HeatmapCell) => ReactNode;
  /** Twelve month names above the weeks, from January; English abbreviations by default. */
  monthLabels?: readonly string[];
  /** Seven weekday names beside the rows, from Sunday; English abbreviations by default. */
  weekdayLabels?: readonly string[];
  /** Legend text before the lightest color; Less by default. */
  lessLabel?: string;
  /** Legend text after the strongest color; More by default. */
  moreLabel?: string;
}

/** The grid of days needs a name: aria-label or aria-labelledby. */
type HeatmapName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type HeatmapProps = HeatmapOptions &
  HeatmapName &
  Omit<
    ComponentPropsWithRef<'div'>,
    keyof HeatmapOptions | 'children' | 'aria-label' | 'aria-labelledby'
  >;

const englishMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const englishWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const englishNumbers = new Intl.NumberFormat('en');
function formatEnglishNumber(value: number) {
  return englishNumbers.format(value);
}

const dayMilliseconds = 86_400_000;
/** Hover waits like Tooltip; moving between days while one is shown switches at once. */
const hoverDelay = 400;

/** Days count from 1970-01-01 in UTC, so daylight saving never shifts a week. */
function parseDay(date: string | undefined) {
  const match = date === undefined ? null : /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return undefined;
  return Math.floor(Date.UTC(+match[1]!, +match[2]! - 1, +match[3]!) / dayMilliseconds);
}

function dayParts(day: number) {
  const date = new Date(day * dayMilliseconds);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    date: date.getUTCDate(),
    weekday: date.getUTCDay(),
  };
}

function dayKey(day: number) {
  const { year, month, date } = dayParts(day);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

interface DayModel extends HeatmapCell {
  day: number;
  name: string;
}

interface HeatmapModel {
  start: number;
  end: number;
  /** The first day of the first week column. */
  first: number;
  weeks: number;
  levelCount: number;
  days: Map<number, DayModel>;
  months: { column: number; span: number; label: string }[];
}

/** The strength of each color step, from 30% of the tone over the canvas to the full tone. */
function levelMix(level: number, levelCount: number) {
  return `${30 + (70 * (level - 1)) / Math.max(1, levelCount - 2)}%`;
}

/**
 * A calendar of daily values with weeks as columns and weekdays as rows, colored in steps of a tone.
 * Each day names its date and value, shows them in a tooltip on hover and focus, and the grid is
 * one tab stop that the arrow keys move through.
 */
export function Heatmap({
  data,
  startDate,
  endDate,
  levels = 5,
  maxValue,
  thresholds,
  weekStart = 0,
  tone = 'accent',
  formatValue = formatEnglishNumber,
  formatDate,
  formatTooltip,
  monthLabels = englishMonths,
  weekdayLabels = englishWeekdays,
  lessLabel = 'Less',
  moreLabel = 'More',
  'aria-label': label,
  'aria-labelledby': labelledBy,
  className,
  style,
  ...props
}: HeatmapProps) {
  const theme = useTheme();
  // Thresholds compare by value, so a new array with the same steps keeps the model.
  const thresholdsKey = thresholds?.join(' ');
  const model = useMemo<HeatmapModel>(() => {
    const steps = thresholdsKey
      ?.split(' ')
      .filter(Boolean)
      .map(Number)
      .filter(Number.isFinite)
      .sort((first, second) => first - second)
      .slice(0, 9);
    const values = new Map<number, HeatmapDay>();
    for (const entry of data) {
      const day = parseDay(entry.date);
      if (day !== undefined) values.set(day, entry);
    }
    let earliest: number | undefined;
    let latest: number | undefined;
    for (const day of values.keys()) {
      if (earliest === undefined || day < earliest) earliest = day;
      if (latest === undefined || day > latest) latest = day;
    }
    const start = parseDay(startDate) ?? earliest;
    const end = parseDay(endDate) ?? latest;
    const levelCount = steps?.length
      ? steps.length + 1
      : Math.min(10, Math.max(2, Math.round(levels)));
    if (start === undefined || end === undefined || end < start)
      return { start: 0, end: -1, first: 0, weeks: 0, levelCount, days: new Map(), months: [] };
    const offset = (day: number) => (dayParts(day).weekday - weekStart + 7) % 7;
    const first = start - offset(start);
    const weeks = (end - offset(end) - first) / 7 + 1;
    let top = maxValue ?? 0;
    if (maxValue === undefined)
      for (const [day, entry] of values)
        if (day >= start && day <= end) top = Math.max(top, entry.value);
    const dateText =
      formatDate ??
      ((date: string) => {
        const parts = dayParts(parseDay(date)!);
        return `${weekdayLabels[parts.weekday]} ${parts.date} ${monthLabels[parts.month]} ${parts.year}`;
      });
    const days = new Map<number, DayModel>();
    // Each month is labelled above the week holding its first day, or above the first week.
    const monthColumns = new Map<number, number>([[0, dayParts(start).month]]);
    for (let day = start; day <= end; day += 1) {
      const entry = values.get(day);
      const value = entry?.value ?? 0;
      const level =
        value <= 0
          ? 0
          : steps?.length
            ? steps.filter((step) => value >= step).length
            : top > 0
              ? Math.min(levelCount - 1, Math.max(1, Math.ceil((value / top) * (levelCount - 1))))
              : 0;
      const date = dayKey(day);
      const valueText = entry?.label ?? formatValue(value);
      days.set(day, {
        day,
        date,
        value,
        label: entry?.label,
        level,
        name: `${dateText(date)}: ${valueText}`,
      });
      const parts = dayParts(day);
      if (parts.date === 1) monthColumns.set(Math.floor((day - first) / 7), parts.month);
    }
    const columns = [...monthColumns.keys()].sort((a, b) => a - b);
    const months = columns.map((column, index) => ({
      column,
      span: (columns[index + 1] ?? weeks) - column,
      label: monthLabels[monthColumns.get(column)!] ?? '',
    }));
    return { start, end, first, weeks, levelCount, days, months };
  }, [
    data,
    startDate,
    endDate,
    levels,
    maxValue,
    thresholdsKey,
    weekStart,
    formatValue,
    formatDate,
    monthLabels,
    weekdayLabels,
  ]);

  const [activeDay, setActiveDay] = useState<number>();
  const active =
    activeDay !== undefined && activeDay >= model.start && activeDay <= model.end
      ? activeDay
      : model.end;
  // One tooltip serves every day: it follows the hovered or focused day and leaves no portal at rest.
  // A closing tooltip keeps its day and anchor while it fades.
  const [tip, setTip] = useState<{
    day: number;
    anchor: HTMLElement;
    open: boolean;
    /** Shown for the focused day rather than the hovered one. */
    focused: boolean;
  } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const grid = useRef<HTMLTableElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // Narrow containers scroll inside the heatmap, starting at the most recent weeks. It stays there
  // as the weeks settle, such as when the web font loads, until the person scrolls it.
  const pinned = useRef(true);
  useLayoutEffect(() => {
    const element = scroller.current;
    const table = grid.current;
    if (!element || !table) return;
    pinned.current = true;
    const toEnd = () => {
      if (!pinned.current) return;
      const rtl = getComputedStyle(element).direction === 'rtl';
      element.scrollLeft = rtl ? -element.scrollWidth : element.scrollWidth;
    };
    toEnd();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(toEnd);
    observer.observe(element);
    observer.observe(table);
    return () => observer.disconnect();
  }, [model.end]);

  function unpin() {
    pinned.current = false;
  }

  function cellFrom(target: EventTarget | null) {
    return target instanceof Element ? target.closest<HTMLElement>('td[data-day]') : null;
  }

  function show(cell: HTMLElement, focused = false) {
    clearTimeout(hoverTimer.current);
    setTip({ day: Number(cell.dataset.day), anchor: cell, open: true, focused });
  }

  function hide() {
    clearTimeout(hoverTimer.current);
    setTip((current) => current && { ...current, open: false });
  }

  // A tooltip opened by focus closes once the pointer moves away from the days, so it never stays
  // over what people reach for next. Moves of a few pixels, or none, as when the page scrolls under
  // a resting pointer, keep it.
  const focusTipOpen = Boolean(tip?.open && tip.focused);
  useEffect(() => {
    if (!focusTipOpen) return;
    const document = grid.current?.ownerDocument;
    let origin: { x: number; y: number } | undefined;
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse' || grid.current?.contains(event.target as Node)) return;
      origin ??= { x: event.clientX, y: event.clientY };
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 4) hide();
    };
    document?.addEventListener('pointermove', move);
    return () => document?.removeEventListener('pointermove', move);
  }, [focusTipOpen]);

  function handlePointerOver(event: PointerEvent<HTMLTableElement>) {
    if (event.pointerType === 'touch') return;
    const cell = cellFrom(event.target);
    if (!cell) return;
    clearTimeout(hoverTimer.current);
    if (tip?.open) show(cell);
    else hoverTimer.current = setTimeout(() => show(cell), hoverDelay);
  }

  function handleFocus(event: FocusEvent<HTMLTableElement>) {
    // A tap focuses its day too, so touch shows the value on tap.
    const cell = cellFrom(event.target);
    if (!cell) return;
    setActiveDay(Number(cell.dataset.day));
    show(cell, true);
  }

  function handleBlur(event: FocusEvent<HTMLTableElement>) {
    if (grid.current?.contains(event.relatedTarget as Node | null)) return;
    if (!grid.current?.matches(':hover')) hide();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') {
      if (tip?.open) {
        // Hiding the tooltip consumes Escape, so an enclosing dialog stays open.
        event.preventDefault();
        event.stopPropagation();
        hide();
      }
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const week = rtl ? -7 : 7;
    const moves: Record<string, number> = {
      ArrowUp: active - 1,
      ArrowDown: active + 1,
      ArrowLeft: active - week,
      ArrowRight: active + week,
      Home: model.start,
      End: model.end,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    if (next < model.start || next > model.end) return;
    grid.current?.querySelector<HTMLElement>(`td[data-day="${next}"]`)?.focus();
  }

  const shown = tip ? model.days.get(tip.day) : undefined;
  const legendLevels = Array.from({ length: model.levelCount }, (_, level) => level);
  return (
    <div {...props} className={classNames('env-heatmap', className)} style={style} data-tone={tone}>
      <div
        className="env-heatmap-scroll"
        ref={scroller}
        onPointerDown={unpin}
        onWheel={unpin}
        onKeyDown={unpin}
      >
        <table
          ref={grid}
          role="grid"
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-readonly="true"
          className="env-heatmap-grid"
          onPointerOver={handlePointerOver}
          onPointerLeave={hide}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          <HeatmapDays
            model={model}
            active={active}
            weekStart={weekStart}
            weekdayLabels={weekdayLabels}
          />
        </table>
      </div>
      <div className="env-heatmap-legend" aria-hidden="true">
        <span>{lessLabel}</span>
        {legendLevels.map((level) => (
          <span
            key={level}
            className="env-heatmap-swatch"
            data-level={level}
            style={
              level > 0
                ? ({ '--env-heatmap-mix': levelMix(level, model.levelCount) } as CSSProperties)
                : undefined
            }
          />
        ))}
        <span>{moreLabel}</span>
      </div>
      <BaseTooltip.Root
        open={tip?.open ?? false}
        onOpenChange={(open, details) => {
          // Presses on the days move the tooltip rather than closing it.
          if (open || (details.event && cellFrom(details.event.target))) return;
          hide();
        }}
      >
        <BaseTooltip.Portal>
          <Theme theme={theme} className="env-tooltip-theme">
            <BaseTooltip.Positioner
              anchor={tip?.anchor}
              side="top"
              sideOffset={6}
              className="env-tooltip-positioner env-heatmap-tooltip-positioner"
            >
              <BaseTooltip.Popup className="env-tooltip env-heatmap-tooltip">
                {shown &&
                  (formatTooltip
                    ? formatTooltip({
                        date: shown.date,
                        value: shown.value,
                        label: shown.label,
                        level: shown.level,
                      })
                    : shown.name)}
              </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
          </Theme>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </div>
  );
}

/** The month row and the seven weekday rows; hovering and the tooltip do not render them again. */
const HeatmapDays = memo(function HeatmapDays({
  model,
  active,
  weekStart,
  weekdayLabels,
}: {
  model: HeatmapModel;
  active: number;
  weekStart: 0 | 1;
  weekdayLabels: readonly string[];
}) {
  const weeks = Array.from({ length: model.weeks }, (_, week) => week);
  return (
    <>
      <thead aria-hidden="true">
        <tr>
          <th className="env-heatmap-corner" />
          {model.months.map(({ column, span, label }) => (
            <th key={column} colSpan={span} className="env-heatmap-month">
              {/* A month shorter than two weeks leaves its name out, so names never overlap. */}
              {span >= 2 && <span>{label}</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 7 }, (_, row) => {
          const weekday = (weekStart + row) % 7;
          return (
            <tr key={row}>
              <th className="env-heatmap-weekday" aria-hidden="true">
                {weekday % 2 === 1 && <span>{weekdayLabels[weekday]}</span>}
              </th>
              {weeks.map((week) => {
                const day = model.first + week * 7 + row;
                const entry = model.days.get(day);
                // Keyed by day, so the tooltip's anchor stays with its day when the range changes.
                if (!entry) return <td key={day} className="env-heatmap-pad" aria-hidden="true" />;
                return (
                  <td
                    key={day}
                    role="gridcell"
                    tabIndex={day === active ? 0 : -1}
                    aria-label={entry.name}
                    className="env-heatmap-day"
                    data-day={day}
                    data-date={entry.date}
                    data-level={entry.level}
                    style={
                      entry.level > 0
                        ? ({
                            '--env-heatmap-mix': levelMix(entry.level, model.levelCount),
                          } as CSSProperties)
                        : undefined
                    }
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </>
  );
});
