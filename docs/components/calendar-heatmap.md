---
title: CalendarHeatmap
summary: A calendar grid that shades each day by its value, with a tooltip and keyboard access for every day.
status: stable
since: 0.5.0
category: Data display
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
examples:
  Deployments: overview
  ColorByRank: example
  CustomTooltip: example
  HeatmapAnatomy: anatomy
  ApplicationStrings: example
  ScrollingWeeks: example
---

# CalendarHeatmap

## Variants

### Tones

A heatmap is drawn in one tone, the accent by default, or any status tone, which [Colors & themes](../foundations/colors.md) describes.

### Color steps

Five steps by default, the empty one included; a heatmap can have as few as two or as many as ten.

<!-- specimen: TonesAndSteps -->

### Color by rank

Each color step can start where the application chooses, such as at quantiles of the data, so a few very busy days don't leave the rest pale.

```tsx figure=ColorByRank motion

```

### A tooltip of your own

The application can lay out the tooltip itself; each day's name keeps its date and value.

```tsx figure=CustomTooltip motion

```

## Anatomy

```tsx figure=HeatmapAnatomy enlarge

```

1. **Month** (`env-calendar-heatmap-month`)
2. **Weekday** (`env-calendar-heatmap-weekday`)
3. **Day** (`env-calendar-heatmap-grid tr:nth-child(4) > env-calendar-heatmap-day:last-child`)
4. **Legend** (`env-calendar-heatmap-legend`)
5. **Swatch** (`env-calendar-heatmap-swatch[data-level='3']`)

## Behaviour

### Languages

The months, weekdays, dates and the legend follow the application's language, and weeks start on the locale's first day, as a calendar's do.

```tsx figure=ApplicationStrings

```

### Adapting to width

The heatmap is never wider than its container: a narrow one scrolls the weeks, starting at the latest. On touch screens, days grow to fit a fingertip.

```tsx figure=ScrollingWeeks widths="30 16" sweep

```

## Rules

A heatmap shows the pattern; put the exact figures elsewhere, where people compare them.

### Names

Name the heatmap after what it counts and when, such as Deployments in the last year, and give each day a value with its unit, such as 4 deployments.

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

## Compose

### Usage

CalendarHeatmap takes `data`, one entry per day with its `date`, as YYYY-MM-DD, its `value`, which chooses the color step, and a `label` with the value in words and its unit, such as 4 deployments. Days without an entry count as 0. `startDate` and `endDate` set the days shown, from the earliest to the latest day in `data` by default. Name the grid with `aria-label`, or `aria-labelledby` for a visible heading.

```tsx source=Deployments

```

#### Tones and color steps

`tone` is `accent`, the default, `success`, `warning`, `danger`, `done` or `neutral`: the tone the colors are mixed from. `levels` sets the color steps, the empty one included, from 2 to 10, and 5 by default; `maxValue` sets the value that takes the strongest color, the largest value shown by default.

#### Color by rank

`thresholds` sets the lowest value of each color step above the empty one, in ascending order, up to nine, such as quantiles of the data, as ColorByRank computes them; they replace `levels` and `maxValue`.

```tsx
<CalendarHeatmap aria-label="Edits by rank" data={data} thresholds={[1, 3, 5, 8]} />
```

#### Tooltip

`renderTooltip` receives the day, with its `date`, `value`, `label` and `level`, the color step from 0, and returns the tooltip's content; the day's accessible name keeps its date and value. `formatValue` and `formatDate` write a value and a date.

```tsx
<CalendarHeatmap
  aria-label="Reviews in ten weeks"
  data={data}
  formatValue={reviews}
  renderTooltip={({ date, value }) => (
    <>
      <strong>{reviews(value)}</strong>
      <br />
      {dates.format(new Date(`${date}T00:00:00Z`))}
    </>
  )}
/>
```

#### Languages

EnvUIProvider's `locale` names the months, weekdays and dates, through `Intl`, and `messages.calendarHeatmap` writes the legend's Less and More; `monthLabels`, `weekdayLabels`, `lessLabel` and `moreLabel` set them for one heatmap. Weeks start on the locale's first day, as on Calendar; `weekStart` sets another, from `0` for Sunday to `6` for Saturday, such as `weekStart={1}` for Monday.

```tsx
<EnvUIProvider messages={{ calendarHeatmap: { less: 'Quieter', more: 'Busier' } }}>
  <CalendarHeatmap aria-label="Activity in the first quarter" data={data} weekStart={1} />
</EnvUIProvider>
```

### Composition

The parts are the month names, `env-calendar-heatmap-month`, the weekday names, `env-calendar-heatmap-weekday`, the days, `env-calendar-heatmap-day`, and the legend, `env-calendar-heatmap-legend`, with a swatch, `env-calendar-heatmap-swatch`, for each step. The tooltip is `env-calendar-heatmap-tooltip`, the shared tooltip popup. Put the exact figures elsewhere, such as a Table, where people compare them.

## Changelog

- **1.0.0**: `formatTooltip` is `renderTooltip`, as it returns content, as `render*` callbacks do; `v1-props` renames it. Weeks start on the locale's first day, as on Calendar, and `weekStart` takes any weekday; they started on Sunday. A date that doesn't exist, such as 2026-02-31, is left out and reported while developing, where it moved to the next month.
- **1.0.0**: Month and weekday names, dates and numbers follow the locale, from `Intl`, and the legend comes from `messages.calendarHeatmap`; the tooltip is the shared tooltip popup. `Heatmap` is `CalendarHeatmap`, with `CalendarHeatmapDay`, `CalendarHeatmapCell` and the `env-calendar-heatmap-*` classes; the page is `calendar-heatmap`.
- **0.5.0**: Heatmap, with tones, color steps, `thresholds`, a tooltip and keyboard access for every day.
