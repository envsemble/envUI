---
title: Key figures
summary: Show the few labelled figures that sum up a view, such as a dashboard's, with how each changed and over what period.
status: beta
since: 1.0.0
intent: Keep people informed
aliases:
  - Stat
  - Stat.Root
  - Stat.Group
  - StatGroup
  - stat
  - stats
  - KPI
  - metric
  - statistic
  - key figure
  - key metric
  - big number
  - stat card
  - trend
useWhen:
  - The few figures that sum up a view, such as a dashboard's active projects, tasks done and lead time.
  - A figure with how it changed since an earlier period, such as +12% from last month.
avoidWhen:
  - text: Many values to compare or sort, such as figures for each project.
    use: Table
  - text: A quantity within a known range, such as the seats assigned of a plan's five.
    use: Meter
  - text: A count on a control, such as unread messages on a tab.
    use: Badge
  - text: A figure that changes while people look at it.
    use: AnimatedNumber
composes:
  - Surface
  - Grid
  - Column
  - Row
  - Text
  - Badge
  - AnimatedNumber
  - Button
  - Card
---

# Key figures

## Overview

A key figure is a muted label, a large figure in [Text](../foundations/typography.md) and a [Badge](../components/badge.md) that says how it changed, with the period beside it. A [Surface](../components/surface.md) holds a few of them in a [Grid](../components/grid.md) of even columns.

```tsx example=ProjectHealth caption="An AnimatedNumber as the figure rolls to each new value."

```

## Variants

### On a pane

A group on a pane takes the `muted` fill, so its figures stand apart; the pane's heading names it.

```tsx example=OnAPane

```

### One figure

A [Card](../components/card.md) frames a single figure.

```tsx example=InACard

```

## When to use

```tsx do=TrendInWords caption="Say the change in words, with its period."

```

```tsx dont=TrendWithoutWords caption="A bare percentage: without the icon and color, it doesn't say which way."

```

```tsx do=BadNewsTone caption="A rise that is bad news in the danger tone."

```

```tsx dont=GoodNewsToneForBadNews caption="A rising error rate in the success tone."

```

- Three to five figures in a group.
- The trend's tone says whether the change is good news: `success` for a rise in projects, `danger` for a rise in errors, `neutral` for no change.

### Content

- Labels as short noun phrases: Active projects, Lead time.
- The unit in the figure or the description: 2.5 days, Median.
- Figures formatted in the reader's language: 1,284, €4,120.

## Anatomy

```tsx anatomy=KeyFiguresAnatomy

```

1. **Group** (`env-surface`, `role="group"`)
2. **Label** (`env-text[data-variant='body-sm']`)
3. **Figure** (`env-text[data-variant='headline']`)
4. **Trend** (`env-badge`, `tone`, `icon`)
5. **Description** (`env-badge + env-text`)

## Adapting to width

The grid shows as many even columns as fit, each at least 11 rem wide, and stacks the figures in one column below that.

```tsx example=GroupColumns widths="12 26 40"

```

## Accessibility

### envUI provides

- The Badge's icon hidden from assistive technology, so its words are what is read.

### You provide

- `role="group"` on the Surface that holds the figures, named by `aria-label` or `aria-labelledby`.
- A trend in words that say which way, such as +12% or 2 fewer, never in color or an arrow alone.
- Tabular digits on the figure, `font-variant-numeric: tabular-nums`, so it keeps its width as it changes; AnimatedNumber uses them.
- A heading level for the group's own heading, where it has one, that fits the page; the figures themselves are not headings.
- Figures formatted in the reader's language.

## Changelog

- **1.0.0**: Key figures are a pattern built from Surface, Grid, Text and Badge, in place of the Stat component, with Stat.Root and Stat.Group.
