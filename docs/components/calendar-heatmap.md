---
title: CalendarHeatmap
summary: A calendar grid that shades each day by its value.
status: stable
since: 1.0.0
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
  - text: Choosing a day.
    use: Calendar
components:
  - CalendarHeatmap
  - CalendarHeatmapLegend
examples:
  Deployments: overview
  ColorByRank: example
  CustomTooltip: example
  LegendBesideHeading: example
  HeatmapAnatomy: anatomy
  ApplicationStrings: example
  ScrollingWeeks: example
---

# CalendarHeatmap

## Variants

### Color steps

<!-- specimen: TonesAndSteps -->

### Color by rank

```tsx figure=ColorByRank motion

```

### A tooltip of your own

```tsx figure=CustomTooltip motion

```

### A legend of your own

```tsx figure=LegendBesideHeading

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

```tsx figure=ApplicationStrings

```

### Adapting to width

```tsx figure=ScrollingWeeks widths="30 16" sweep

```

## Accessibility

### Keyboard

| Key                                                             | Action                                               |
| --------------------------------------------------------------- | ---------------------------------------------------- |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                      | Moves to the previous or next day.                   |
| <kbd>←</kbd>, <kbd>→</kbd>                                      | Moves to the same weekday a week earlier or later.   |
| <kbd>Home</kbd>, <kbd>End</kbd>                                 | Moves to the same weekday in the first or last week. |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                        | Moves to the first or last day of the week.          |
| <kbd>Ctrl</kbd>+<kbd>Home</kbd>, <kbd>Ctrl</kbd>+<kbd>End</kbd> | Moves to the first or the latest day.                |
