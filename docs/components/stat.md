---
title: Stat
summary: Labelled key figures for dashboards, with how they changed and over what period, grouped in even columns.
status: beta
since: 0.5.0
category: Content & guidance
aliases:
  - KPI
  - metric
  - statistic
  - key figure
  - key metric
  - big number
  - stat card
  - StatGroup
  - Stat.Group
  - Stat.Root
useWhen:
  - The few figures that sum up a view, such as a dashboard's active projects, tasks done and lead time.
  - A figure with how it changed since an earlier period, such as +12% from last month.
avoidWhen:
  - text: Many values to compare or sort, such as figures for each project.
    use: Table
  - text: A quantity within a known range, such as the seats assigned of a plan's five.
    use: Meter
  - text: A count on a control, such as unread messages on a tab.
    use: CounterBadge
  - text: A summary people open or act on, with a description and actions.
    use: Card
related:
  - animated-number
  - meter
  - table
  - card
  - surface
  - colors
components:
  - Stat
---

# Stat

## Overview

A stat is a labelled key figure: what is measured, the figure in large digits, and optionally how it changed and over what period. Stats sum up a view, such as a dashboard, in a few figures people take in at a glance.

The parts are members of the `Stat` namespace:

- **Stat.Root** is one figure with its `label`, an optional `trend` and an optional `detail`. It has no surface of its own.
- **Stat.Group** puts stats on one surface, a pane by default, in as many even columns as fit.

```tsx example=ProjectHealth

```

## Anatomy

1. **Label** (`label`): muted 0.875 rem text above the figure.
2. **Value** (`value`): the figure at 1.75 rem and medium weight, in tabular digits, so figures of the same length line up.
3. **Trend** (optional, `trend`): a 1 rem direction icon and the change as text, at medium weight in the trend's tone.
4. **Detail** (optional, `detail`): muted 0.875 rem text after the trend, such as the period.
5. **Group** (Stat.Group): a surface, a pane by default, with the surface's padding, which holds the stats in columns.

The label, value and footer are 0.25 rem apart. The trend and the detail share a row, 0.75 rem apart, and wrap when they don't fit.

## Variants and sizes

| Trend direction | Icon          | Default tone |
| --------------- | ------------- | ------------ |
| `up`            | Trending up   | `success`    |
| `down`          | Trending down | `danger`     |
| `flat`          | Trending flat | `neutral`    |

- A trend's `tone` replaces the default: `success`, `warning`, `danger` or `neutral`. Set it when a rise is bad news, as for costs or errors, or a fall is good news, as for open risks.
- **Columns**: Stat.Group lays its stats out in as many even columns as fit, each at least 11 rem wide, 1 to 2 rem apart, with 1.5 rem between rows. A narrow group, such as on a phone, keeps two columns down to 6.5 rem each, and stacks its stats only below that.
- **Figures in a group** shrink with a narrow column, from 1.75 rem down to 1.25 rem, so they stay on one line.
- **Group tone**: `pane` (default) for a group on the canvas; `row` for a group on a pane, so it stands apart. `padding` takes a step of the spacing scale; without it, the inset is 1.25 rem in narrow windows and 1.5 rem from 50 rem wide.

## States and behaviour

- **Changing figures**: an AnimatedNumber as the `value` rolls to each new figure, up as it grows and down as it shrinks, and fades with a reduced-motion preference.
- **Named groups**: a Stat.Group with `aria-label` or `aria-labelledby` has `role="group"`, so screen readers announce its name as people enter it; without a name it adds no role.
- **Reading order**: a stat reads as its text in order: label, value, trend and detail. The trend's icon is hidden from assistive technology.
- **Long text**: labels, figures and details wrap, anywhere in a long word if they must, instead of overflowing their column.
- **Read-only**: stats take no focus and no input.

## Content guidelines

- Keep labels short, as a noun phrase in sentence case: "Active projects", "Lead time", "Error rate".
- Put the unit in the value or the detail: "2.5 days", "0.4%", "Median".
- Format figures in the application, in the reader's language and with its separators: "1,284", "€4,120".
- Write the trend so it reads well without its icon and its color: "+12% from last month", "2 fewer than last week", "No change".
- Say the period in the detail when the trend's text doesn't: "Last 30 days".

## Do and don't

### Do

- Show a few figures that matter for the view, three to five in a group.
- Set the trend's `tone` when a change in its direction is good or bad news against the default.
- Name a group with `aria-label` or `aria-labelledby` when it stands for a section, such as Project health.
- Put a single stat in a [Card](../components/card.md) or a Surface where it needs a frame.

### Don't

- Don't use stats for many values people compare or sort; use a [Table](../components/table.md).
- Don't show a quantity of a known maximum as a stat alone; use a [Meter](../components/meter.md).
- Don't rely on the trend's color to say whether a change is good; say it in the label where it matters.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Pass over the stats, which take no focus; screen readers reach them as they read the page. |

### envUI provides

- The trend's direction in its text and icon, never in color alone, with the icon hidden from assistive technology.
- `role="group"` on a Stat.Group named with `aria-label` or `aria-labelledby`.
- Labels, figures, trends and details at 4.5:1 or more on the canvas, panes and rows, in every tone and both themes.
- Tabular digits, so figures line up and don't shift as they change.

### You provide

- A trend label that says which way the figure moved, such as "+12%" or "2 fewer", since the icon is hidden.
- A name for a group that stands for a section.
- Figures formatted in the reader's language, with their units.

## Examples

### Good news and bad news

Fewer risks take the success tone, a higher error rate the danger tone, and a rising cost that stays within budget the warning tone.

```tsx example=TrendTones

```

### On a pane

On a pane, the group takes the row tone and a smaller padding; the heading names the group.

```tsx example=OnAPane

```

### One figure in a card

A stat on its own has no surface; a Card gives it one.

```tsx example=InACard

```

## Changelog

- **1.0.0**: `Stat` is a namespace: `Stat` is `Stat.Root` and `StatGroup` is `Stat.Group`, with the `Stat.Trend` and `Stat.TrendTone` types.
- **0.5.0**: Stat and StatGroup.
