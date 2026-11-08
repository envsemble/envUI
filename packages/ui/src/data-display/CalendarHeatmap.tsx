'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { TooltipPopup } from '../internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../layout/Layout.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { calendarHeatmap as calendarHeatmapMessages } from '../foundations/messages/calendarHeatmap.js';
import type { BadgeTone } from './Badge.js';
import { isRightToLeft } from '../internal/direction.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import type { Weekday } from '../internal/calendarDays.js';
import {
  calendarHeatmapModel,
  heatmapKeyTarget,
  levelStyle,
  type CalendarHeatmapModel,
} from './internal/calendarHeatmapModel.js';
import { useHeatmapLabels } from './internal/useHeatmapLabels.js';
import { useHeatmapTooltip } from './internal/useHeatmapTooltip.js';
import '../styles/Base.css';
import '../styles/CalendarHeatmap.css';

export interface CalendarHeatmapDay {
  /** The day, as YYYY-MM-DD. */
  date: string;
  /** The day's value, such as a count; it chooses the color step. */
  value: number;
  /** The value in words, such as 4 deployments; replaces formatValue's text for this day. */
  label?: string;
}

/** A day as shown: days without data have the value 0. */
export interface CalendarHeatmapCell extends CalendarHeatmapDay {
  /** The color step, from 0 for an empty day to levels - 1. */
  level: number;
}

interface CalendarHeatmapOptions {
  /** Values by day; days without an entry count as 0. */
  data: readonly CalendarHeatmapDay[];
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
   * first threshold shows as empty, and a first threshold of 0 or less colors days of 0 too.
   */
  thresholds?: readonly number[];
  /**
   * The first day of each week column, from 0 for Sunday to 6 for Saturday, as on Calendar.
   * @default the locale's, or Monday where the browser cannot tell
   */
  weekStart?: Weekday;
  /** The tone the colors are mixed from: primary by default. */
  tone?: BadgeTone;
  /**
   * Text for a value.
   * @default the number format of EnvUIProvider's locale, or else the browser's
   */
  formatValue?: (value: number) => string;
  /**
   * Text for a day's date, in its accessible name and the default tooltip.
   * @default the weekday, day, month and year in the locale, such as Tue 14 Oct 2025
   */
  formatDate?: (date: string) => string;
  /** Tooltip content for a day; the date and value by default. */
  renderTooltip?: (day: CalendarHeatmapCell) => ReactNode;
  /**
   * Twelve month names above the weeks, from January.
   * @default the locale's short month names, from Intl
   */
  monthLabels?: readonly string[];
  /**
   * Seven weekday names beside the rows, from Sunday.
   * @default the locale's short weekday names, from Intl
   */
  weekdayLabels?: readonly string[];
  /**
   * Legend text before the lightest color. It overrides EnvUIProvider's
   * `messages.calendarHeatmap.less`.
   * @default 'Less'
   */
  lessLabel?: string;
  /**
   * Legend text after the strongest color. It overrides EnvUIProvider's
   * `messages.calendarHeatmap.more`.
   * @default 'More'
   */
  moreLabel?: string;
}

/** The grid of days needs a name: aria-label or aria-labelledby. */
type CalendarHeatmapName =
  | {
      /** Names the grid of days, such as "Deployments in the last year"; this or aria-labelledby. */
      'aria-label': string;
      /** The id of visible text that names the grid of days, such as a heading; this or aria-label. */
      'aria-labelledby'?: string;
    }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type CalendarHeatmapProps = CalendarHeatmapOptions &
  CalendarHeatmapName &
  Omit<
    ComponentPropsWithRef<'div'>,
    keyof CalendarHeatmapOptions | 'children' | 'aria-label' | 'aria-labelledby'
  >;

/**
 * A calendar of daily values with weeks as columns and weekdays as rows, colored in steps of a tone.
 * Each day names its date and value, shows them in a tooltip on hover and focus, and the grid is
 * one tab stop that the arrow keys move through.
 */
export function CalendarHeatmap({
  data,
  startDate,
  endDate,
  levels = 5,
  maxValue,
  thresholds,
  weekStart: ownWeekStart,
  tone = 'primary',
  formatValue: ownFormatValue,
  formatDate: ownFormatDate,
  renderTooltip,
  monthLabels: ownMonthLabels,
  weekdayLabels: ownWeekdayLabels,
  lessLabel: ownLessLabel,
  moreLabel: ownMoreLabel,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  className,
  style,
  ...props
}: CalendarHeatmapProps) {
  // A prop wins over the provider's messages and locale, which win over English and the runtime's.
  const messages = useMessages('calendarHeatmap', calendarHeatmapMessages);
  const lessLabel = ownLessLabel ?? messages.less;
  const moreLabel = ownMoreLabel ?? messages.more;
  const { weekStart, monthLabels, weekdayLabels, formatValue, formatDate } = useHeatmapLabels({
    weekStart: ownWeekStart,
    formatValue: ownFormatValue,
    formatDate: ownFormatDate,
    monthLabels: ownMonthLabels,
    weekdayLabels: ownWeekdayLabels,
  });
  // Thresholds compare by value, so a new array with the same steps keeps the model.
  const thresholdsKey = thresholds?.join(' ');
  const model = useMemo(
    () =>
      calendarHeatmapModel({
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
      }),
    [
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
    ],
  );

  // A date it can't read, such as 2026-02-31, is left out rather than moved to another day: said
  // while developing, once.
  reportInDevelopment(
    () =>
      process.env.NODE_ENV !== 'production' &&
      model.invalid.length > 0 &&
      `CalendarHeatmap leaves out dates it can't read, such as ${JSON.stringify(model.invalid[0])}: write each as YYYY-MM-DD, a day that exists.`,
    { level: 'warn' },
  );

  const [activeDay, setActiveDay] = useState<number>();
  const active =
    activeDay !== undefined && activeDay >= model.start && activeDay <= model.end
      ? activeDay
      : model.end;
  const grid = useRef<HTMLTableElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const { tip, gridHandlers, onOpenChange, popupProps } = useHeatmapTooltip(grid, setActiveDay);

  // Narrow containers scroll inside the heatmap, starting at the most recent weeks: the scroller is a
  // reversed row, whose scroll origin is its end (CalendarHeatmap.css), so the server's markup and
  // the first paint already show them and they stay in view as the weeks settle, such as when the
  // web font loads. A later end, such as new data, scrolls back to them.
  const shownEnd = useRef(model.end);
  useLayoutEffect(() => {
    if (shownEnd.current === model.end) return;
    shownEnd.current = model.end;
    if (scroller.current) scroller.current.scrollLeft = 0;
  }, [model.end]);

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.altKey || event.metaKey) return;
    const next = heatmapKeyTarget(model, active, event, isRightToLeft(event.currentTarget));
    if (next === undefined) return;
    event.preventDefault();
    if (next < model.start || next > model.end) return;
    grid.current?.querySelector<HTMLElement>(`td[data-day="${next}"]`)?.focus();
  }

  const shown = tip ? model.days.get(tip.day) : undefined;
  const legendLevels = Array.from({ length: model.levelCount }, (_, level) => level);
  return (
    <Grid
      {...props}
      gap={2}
      className={classNames('env-calendar-heatmap', className)}
      style={style}
      data-tone={tone}
    >
      <div className="env-calendar-heatmap-scroll" ref={scroller}>
        <table
          ref={grid}
          role="grid"
          aria-label={label}
          aria-labelledby={labelledBy}
          aria-readonly="true"
          className="env-calendar-heatmap-grid"
          {...gridHandlers}
          onKeyDown={handleKeyDown}
        >
          <CalendarHeatmapDays
            model={model}
            active={active}
            weekStart={weekStart}
            weekdayLabels={weekdayLabels}
          />
        </table>
      </div>
      <Row wrap align="center" className="env-calendar-heatmap-legend" aria-hidden="true">
        <span>{lessLabel}</span>
        {legendLevels.map((level) => (
          <span
            key={level}
            className="env-calendar-heatmap-swatch"
            data-level={level}
            style={levelStyle(level, model.levelCount)}
          />
        ))}
        <span>{moreLabel}</span>
      </Row>
      <BaseTooltip.Root open={tip?.open ?? false} onOpenChange={onOpenChange}>
        <TooltipPopup
          side="top"
          anchor={tip?.anchor}
          sideOffset={tip?.offset ?? 0}
          positionerClassName="env-calendar-heatmap-tooltip-positioner"
          popupProps={{ ...popupProps, className: 'env-calendar-heatmap-tooltip' }}
          content={
            shown &&
            (renderTooltip
              ? renderTooltip({
                  date: shown.date,
                  value: shown.value,
                  label: shown.label,
                  level: shown.level,
                })
              : shown.name)
          }
        />
      </BaseTooltip.Root>
    </Grid>
  );
}

/** The month row and the seven weekday rows; hovering and the tooltip do not render them again. */
const CalendarHeatmapDays = memo(function CalendarHeatmapDays({
  model,
  active,
  weekStart,
  weekdayLabels,
}: {
  model: CalendarHeatmapModel;
  active: number;
  weekStart: Weekday;
  weekdayLabels: readonly string[];
}) {
  const weeks = Array.from({ length: model.weeks }, (_, week) => week);
  return (
    <>
      <thead aria-hidden="true">
        <tr>
          <th className="env-calendar-heatmap-corner" />
          {model.months.map(({ column, span, label }) => (
            <th key={column} colSpan={span} className="env-calendar-heatmap-month">
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
              <th className="env-calendar-heatmap-weekday" aria-hidden="true">
                {weekday % 2 === 1 && <span>{weekdayLabels[weekday]}</span>}
              </th>
              {weeks.map((week) => {
                const day = model.first + week * 7 + row;
                const entry = model.days.get(day);
                // Keyed by day, so the tooltip's anchor stays with its day when the range changes.
                if (!entry)
                  return <td key={day} className="env-calendar-heatmap-pad" aria-hidden="true" />;
                return (
                  <td
                    key={day}
                    role="gridcell"
                    tabIndex={day === active ? 0 : -1}
                    aria-label={entry.name}
                    className="env-calendar-heatmap-day"
                    data-day={day}
                    data-date={entry.date}
                    data-level={entry.level}
                    style={levelStyle(entry.level, model.levelCount)}
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
