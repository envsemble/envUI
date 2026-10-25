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
  - The few figures that sum up a view, such as a dashboard's
  - A figure and how it changed, such as 12 percent up on last month
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

A key figure is a muted label, a large figure and a [Badge](../components/badge.md) that says how it changed, with the period beside it. A [Surface](../components/surface.md) holds a few of them in a [Grid](../components/grid.md).

```tsx example=ProjectHealth caption="A figure that rolls to each new value, as an AnimatedNumber."

```

## Variants

### On a pane

A group on a pane takes the muted fill, so its figures stand apart; the pane's heading names it.

```tsx example=OnAPane

```

### One figure

A [Card](../components/card.md) frames a single figure.

```tsx example=InACard

```

## When to use

### The change in words

Say how a figure changed in words that say which way, such as "2 fewer", with its period, since a color or an arrow alone says nothing to many people, as [feedback](feedback.md) shows for any status.

### A few figures

Keep a group to three to five figures. The trend's color says whether the change is good news: green for good, red for bad, and neutral for no change.

### Content

Labels are short noun phrases, such as Active projects or Lead time. The unit goes in the figure or the description, such as 2.5 days or Median, and figures are formatted in the reader's language, such as 1,284 or €4,120.

## Anatomy

```tsx anatomy=KeyFiguresAnatomy

```

1. **Group** (`env-surface`, `role="group"`)
2. **Label** (`env-text[data-variant='body-sm']`)
3. **Figure** (`env-text[data-variant='headline']`)
4. **Trend** (`env-badge`, `tone`, `icon`)
5. **Description** (`env-badge + env-text`)

## Adapting to width

The grid shows as many even columns as fit, and stacks the figures in one column where there is room for only one.

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

## In code

### Usage

A key figure is a Column of three Texts: the label with `variant="body-sm"` and `emphasis="muted"`, the figure with `variant="headline"` and `fontVariantNumeric: 'tabular-nums'`, so it keeps its width, and a Row with the trend Badge and a muted description. The Badge takes the change in words and an `icon`, such as TrendingUp or TrendingFlat, and its `tone` says whether it is good news: `success`, `danger`, or `neutral` for no change. A figure that changes while people look at it is an AnimatedNumber inside the figure's Text.

```tsx source=ProjectHealth

```

#### On a pane or in a card

On a pane, the group's Surface takes `background="muted"`, inside the pane's own `background="default"` Surface with its heading. A single figure sits in a Card.

### Composition

The group is a Surface with `role="group"` and an `aria-label`, rendering a Grid through `render`. The Grid's `columns` are `repeat(auto-fit, minmax(min(100%, 11rem), 1fr))`: as many even columns as fit, each at least 11 rem wide, and one column below that.

```tsx
<Surface
  role="group"
  aria-label="Project health"
  render={<Grid columns="repeat(auto-fit, minmax(min(100%, 11rem), 1fr))" gap={5} />}
>
  {/* One Column per figure */}
</Surface>
```

## Changelog

- **1.0.0**: Key figures are a pattern built from Surface, Grid, Text and Badge, in place of the Stat component, with Stat.Root and Stat.Group.
