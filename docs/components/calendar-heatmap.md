---
title: CalendarHeatmap
summary: A calendar grid that shades each day by its value, with a tooltip and keyboard access for every day.
status: beta
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
    use: Stat
  - text: Choosing a day.
    use: Calendar
  - text: A share of a known range, such as storage used.
    use: Meter
related:
  - stat
  - table
  - date-picker
  - tooltip
  - colors
  - accessibility
components:
  - CalendarHeatmap
---

# CalendarHeatmap

## Overview

A calendar heatmap shows a value for each day as a shade of one tone: weeks are columns and weekdays rows, with month names above and a legend below. Higher values stand out more in both themes. Every day is a cell named with its date and value, shown in a tooltip on hover and focus, and the grid is one tab stop that the arrow keys move through. The application passes the values by day; dates are calendar days, independent of time zones.

```tsx example=Deployments

```

## Anatomy

1. **Month row**: the month names above the weeks, each above the week that holds its first day.
2. **Weekday column**: every other weekday name beside the rows.
3. **Day** (each day from `startDate` to `endDate`): a 0.75 rem square with small corners in the color of its step; empty days take the translucent fill.
4. **Legend**: `lessLabel` (Less), a swatch for each color step, and `moreLabel` (More), below the grid.
5. **Tooltip**: one tooltip for the hovered or focused day, with the day's name or `formatTooltip`'s content.

## Variants and sizes

| Tone      | Use for                                                             |
| --------- | ------------------------------------------------------------------- |
| `accent`  | Activity without a judgement, such as edits or visits. The default. |
| `success` | Something good to have more of, such as deployments.                |
| `warning` | Something that needs attention, such as reviews waiting.            |
| `danger`  | Something to have less of, such as incidents.                       |
| `done`    | Completed work, such as closed tasks.                               |
| `neutral` | A quiet count beside other charts.                                  |

- `levels` sets the color steps, including the empty one, from 2 to 10 (5). By default they are equal parts of the range up to `maxValue`, the largest value shown; `thresholds` sets where each step starts instead, such as quantiles of the data to color by rank.
- Each step mixes the tone into the page's color, from 30% to the tone itself at the strongest step, which is also the only step of two levels.
- Days are 0.75 rem, 0.1875 rem apart, in 0.75 rem text. On touch screens they grow to 1.25 rem and sit 0.25 rem apart, so each meets the minimum target size through its spacing.
- The heatmap is as wide as its weeks, and never wider than its container: a narrow container scrolls the weeks inside it, starting at the most recent.

## States and behaviour

- **Range**: `startDate` and `endDate` set the first and last day shown, by default the range `data` covers; days without an entry count as 0. `weekStart` starts each week column on Sunday (0) or Monday (1).
- **Month names**: a month shorter than two weeks at the edge of the range leaves its name out, so names never overlap.
- **Tooltip**: it shows at once on focus and on a tap, after a short delay on hover, then from day to day without waiting. <kbd>Esc</kbd> hides it wherever focus is, without closing an enclosing dialog; <kbd>Esc</kbd> with <kbd>Ctrl</kbd>, <kbd>Alt</kbd> or <kbd>Meta</kbd> leaves it and goes on. Leaving the days with the pointer hides it, and so does moving the pointer away from a day focused from the keyboard.
- **Reading the tooltip**: the tooltip of a day hovered or clicked with the mouse sits just across the gap above the day, so the pointer can move onto it to read or magnify it; it stays while the pointer is on it. A tooltip opened by keyboard focus or a tap takes no pointer, so it never blocks a press on what lies under it.
- **Focus**: keyboard focus scrolls its day into view in a scrolling heatmap; the focused day shows a focus outline.
- **Right to left**: the weeks run from the right, and the arrow keys follow.
- **Performance**: the tooltip leaves nothing in the document at rest, and hovering doesn't render the days again, so a year renders and updates quickly.

## Content guidelines

- Name the heatmap after what it counts and over which period: "Deployments in the last year".
- Give each day a `label` with the unit, such as "4 deployments", or a `formatValue` that adds it.
- Localize `monthLabels`, `weekdayLabels`, `formatDate`, `formatValue`, `lessLabel` and `moreLabel`; the defaults are English.

## Do and don't

### Do

- Choose the tone by what more means: success for something good, danger for something to avoid.
- Color by rank with `thresholds` when a few large values would leave most days pale.
- Show the exact figures elsewhere when people need them, such as in a table or a Stat.

### Don't

- Don't use a heatmap for a few days or for values people compare precisely.
- Don't rely on the shades alone: every day's value is in its name and tooltip, so keep them meaningful.
- Don't use more color steps than people can tell apart; five suit most data.

## Accessibility

### Keyboard

| Key                                                             | Action                                                                                  |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                 | Moves focus to the grid, one tab stop on the latest or last focused day, and out of it. |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                      | Moves to the previous or next day.                                                      |
| <kbd>←</kbd>, <kbd>→</kbd>                                      | Moves to the same weekday in the previous or next week, in the reading direction.       |
| <kbd>Home</kbd>, <kbd>End</kbd>                                 | Moves to the same weekday in the first or last week.                                    |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                        | Moves to the first or last day of the week.                                             |
| <kbd>Ctrl</kbd>+<kbd>Home</kbd>, <kbd>Ctrl</kbd>+<kbd>End</kbd> | Moves to the first or the latest day.                                                   |
| <kbd>Esc</kbd>                                                  | Hides the tooltip; an enclosing dialog stays open.                                      |

### envUI provides

- A read-only `grid` named by `aria-label` or `aria-labelledby`, which its types require, with a `gridcell` for each day named with its date and value, such as "Tue 3 Mar 2026: 4 deployments".
- One roving tab stop and the grid keys, the tooltip on focus as on hover, and a focus outline on the focused day.
- Month and weekday names, the empty cells and the legend hidden from assistive technology, which reads each day's name instead.
- Tooltips that can be hovered and dismissed, and touch-sized days with their spacing.

### You provide

- A name for the heatmap, and values whose names say their unit.
- The labels in the application's language.
- The exact figures elsewhere when people need to compare them.

## Examples

### Color by rank

`thresholds` from quantiles of the active days make each step hold about as many days, so a few very busy days don't leave the rest pale.

```tsx example=ColorByRank

```

### In another language

Month and weekday names from `Intl`, weeks from Monday, and dates and values in German.

```tsx example=Localized

```

### A tooltip of your own

`formatTooltip` lays out the tooltip; the day's accessible name keeps its date and value.

```tsx example=CustomTooltip

```

## Changelog

- **1.0.0**: `Heatmap` is `CalendarHeatmap`, with `CalendarHeatmapDay`, `CalendarHeatmapCell` and the `env-calendar-heatmap-*` classes; the page is `calendar-heatmap`.
- **0.5.0**: Heatmap, with tones, color steps, `thresholds`, a tooltip and keyboard access for every day.
