---
title: CalendarHeatmap
summary: A calendar grid that shades each day by its value, with a tooltip and keyboard access for every day.
status: stable
since: 0.5.0
category: Content & guidance
aliases:
  - Heatmap
  - calendar heat map
  - contribution graph
  - contributions calendar
  - activity calendar
  - activity graph
  - streak calendar
  - year in review
useWhen:
  - A count per day over weeks or months shows a pattern, such as activity or deployments, where the pattern matters more than each number.
avoidWhen:
  - text: Exact figures people compare or read one by one.
    use: Table
  - text: A headline number with its trend.
    see: key-figures
  - text: Choosing a day.
    use: Calendar
  - text: A share of a known range, such as storage used.
    use: Meter
components:
  - CalendarHeatmap
---

# CalendarHeatmap

## Overview

A calendar heatmap shows a value for each day as a shade of one tone, weeks as columns. Each day is named with its date and value, shown in a tooltip.

```tsx example=Deployments

```

### Color by rank

`thresholds` sets where each step starts, such as quantiles of the data, so a few very busy days don't leave the rest pale.

```tsx example=ColorByRank

```

### A tooltip of your own

`formatTooltip` lays out the tooltip; the day's name keeps its date and value.

```tsx example=CustomTooltip

```

### Languages

EnvUIProvider's `locale` names the months, weekdays and dates, and `messages.calendarHeatmap` writes the legend. `weekStart={1}` starts weeks on Monday.

```tsx example=ApplicationStrings

```

## Variants

| Tone      | Use for                                       |
| --------- | --------------------------------------------- |
| `accent`  | Activity without a judgment. The default.     |
| `success` | Something good to have more of.               |
| `warning` | Something that needs attention.               |
| `danger`  | Something to have less of, such as incidents. |
| `done`    | Completed work.                               |
| `neutral` | A quiet count beside other charts.            |

`levels` sets the number of color steps, the empty one included; five by default.

## When to use

```tsx do=IncidentsInDanger caption="A tone that says what more means: danger for incidents."

```

```tsx dont=IncidentsInSuccess caption="Incidents in the success tone: a bad week reads as a good one."

```

```tsx do=FiveLevels caption="Five steps, which people can tell apart."

```

```tsx dont=TenLevels caption="Ten steps: neighbouring shades look the same."

```

- Name it after what it counts and when, such as Deployments in the last year.
- Give each day a `label` with its unit, such as 4 deployments.

## Anatomy

```tsx anatomy=HeatmapAnatomy

```

1. **Month** (`env-calendar-heatmap-month`)
2. **Weekday** (`env-calendar-heatmap-weekday`)
3. **Day** (`env-calendar-heatmap-day`)
4. **Legend** (`env-calendar-heatmap-legend`)
5. **Swatch** (`env-calendar-heatmap-swatch`)

Not shown: the tooltip, `env-calendar-heatmap-tooltip`.

## Adapting to width

The heatmap is never wider than its container: a narrow one scrolls the weeks, starting at the latest. On touch screens, days grow to 1.25 rem.

```tsx example=ScrollingWeeks widths="16 36"

```

## Accessibility

### Keyboard

| Key                                                             | Action                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                 | Moves into the grid, on the latest or last focused day. |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                      | Moves to the previous or next day.                      |
| <kbd>←</kbd>, <kbd>→</kbd>                                      | Moves to the same weekday a week earlier or later.      |
| <kbd>Home</kbd>, <kbd>End</kbd>                                 | Moves to the same weekday in the first or last week.    |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                        | Moves to the first or last day of the week.             |
| <kbd>Ctrl</kbd>+<kbd>Home</kbd>, <kbd>Ctrl</kbd>+<kbd>End</kbd> | Moves to the first or the latest day.                   |
| <kbd>Esc</kbd>                                                  | Hides the tooltip.                                      |

### envUI provides

- A read-only `grid` with a cell for each day, named with its date and value.
- One tab stop, the tooltip on focus as on hover, and a focus outline.
- Month and weekday names and the legend hidden; each day's name says it all.

### You provide

- A name for the heatmap, and values whose names say their unit.
- The exact figures elsewhere, where people compare them.

## Changelog

- **1.0.0**: Month and weekday names, dates and numbers follow the locale, from `Intl`, and the legend comes from `messages.calendarHeatmap`; the tooltip is the shared tooltip popup. `Heatmap` is `CalendarHeatmap`, with `CalendarHeatmapDay`, `CalendarHeatmapCell` and the `env-calendar-heatmap-*` classes; the page is `calendar-heatmap`.
- **0.5.0**: Heatmap, with tones, color steps, `thresholds`, a tooltip and keyboard access for every day.
