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
  - A count per day over weeks or months, such as deployments
  - A pattern that matters more than each day's number
avoidWhen:
  - text: Exact figures people compare or read one by one.
    use: Table
  - text: A headline number with its trend.
    see: key-figures
  - text: Choosing a day.
    use: Calendar
components:
  - CalendarHeatmap
---

# CalendarHeatmap

## Overview

```tsx example=Deployments

```

### Color by rank

Each color step can start where the application chooses, such as at quantiles of the data, so a few very busy days don't leave the rest pale.

```tsx example=ColorByRank

```

### A tooltip of your own

The application can lay out the tooltip itself; each day's name keeps its date and value.

```tsx example=CustomTooltip

```

### Languages

The months, weekdays, dates and the legend follow the application's language, and weeks can start on Monday.

```tsx example=ApplicationStrings

```

## Variants

| Tone    | Use for                                       |
| ------- | --------------------------------------------- |
| Accent  | Activity without a judgment. The default.     |
| Success | Something good to have more of.               |
| Warning | Something that needs attention.               |
| Danger  | Something to have less of, such as incidents. |
| Done    | Completed work.                               |
| Neutral | A quiet count beside other charts.            |

### Color steps

Five steps by default, the empty one included; a heatmap can have as few as two or as many as ten.

## When to use

### Names

Name the heatmap after what it counts and when, such as Deployments in the last year, and give each day a value with its unit, such as 4 deployments.

## Anatomy

```tsx anatomy=HeatmapAnatomy

```

1. **Month** (`env-calendar-heatmap-month`)
2. **Weekday** (`env-calendar-heatmap-weekday`)
3. **Day** (`env-calendar-heatmap-day`)
4. **Legend** (`env-calendar-heatmap-legend`)
5. **Swatch** (`env-calendar-heatmap-swatch`)

Not shown: the tooltip.

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

## In code

### Usage

CalendarHeatmap takes `data`, one entry per day with its `date`, as YYYY-MM-DD, its `value`, which chooses the color step, and a `label` with the value in words and its unit, such as 4 deployments. Days without an entry count as 0. `startDate` and `endDate` set the days shown, from the earliest to the latest day in `data` by default. Name the grid with `aria-label`, or `aria-labelledby` for a visible heading.

```tsx source=Deployments

```

#### Tones and color steps

`tone` is `accent`, the default, `success`, `warning`, `danger`, `done` or `neutral`: the tone the colors are mixed from. `levels` sets the color steps, the empty one included, from 2 to 10, and 5 by default; `maxValue` sets the value that takes the strongest color, the largest value shown by default.

#### Color by rank

`thresholds` sets the lowest value of each color step above the empty one, in ascending order, up to nine, such as quantiles of the data; they replace `levels` and `maxValue`.

```tsx source=ColorByRank

```

#### Tooltip

`formatTooltip` receives the day, with its `date`, `value`, `label` and `level`, the color step from 0, and returns the tooltip's content; the day's accessible name keeps its date and value. `formatValue` and `formatDate` write a value and a date.

```tsx source=CustomTooltip

```

#### Languages

EnvUIProvider's `locale` names the months, weekdays and dates, through `Intl`, and `messages.calendarHeatmap` writes the legend's Less and More; `monthLabels`, `weekdayLabels`, `lessLabel` and `moreLabel` set them for one heatmap. `weekStart={1}` starts weeks on Monday, and `0`, Sunday, is the default.

```tsx source=ApplicationStrings

```

### Composition

The parts are the month names, `env-calendar-heatmap-month`, the weekday names, `env-calendar-heatmap-weekday`, the days, `env-calendar-heatmap-day`, and the legend, `env-calendar-heatmap-legend`, with a swatch, `env-calendar-heatmap-swatch`, for each step. The tooltip is `env-calendar-heatmap-tooltip`, the shared tooltip popup. Put the exact figures elsewhere, such as a Table, where people compare them.

## Changelog

- **1.0.0**: Month and weekday names, dates and numbers follow the locale, from `Intl`, and the legend comes from `messages.calendarHeatmap`; the tooltip is the shared tooltip popup. `Heatmap` is `CalendarHeatmap`, with `CalendarHeatmapDay`, `CalendarHeatmapCell` and the `env-calendar-heatmap-*` classes; the page is `calendar-heatmap`.
- **0.5.0**: Heatmap, with tones, color steps, `thresholds`, a tooltip and keyboard access for every day.
