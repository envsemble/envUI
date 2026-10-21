---
title: Stat
summary: Labelled key figures for dashboards, with how they changed and over what period, grouped in even columns.
status: stable
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

A stat is a labelled key figure, with how it changed. Stat.Group puts a few on one surface.

```tsx example=ProjectHealth caption="An AnimatedNumber as the value rolls to each new figure."

```

## Variants

| Trend  | Default tone |
| ------ | ------------ |
| `up`   | `success`    |
| `down` | `danger`     |
| `flat` | `neutral`    |

### Trend tones

A trend's `tone` replaces the default where a rise is bad news, or a fall good news.

```tsx example=TrendTones

```

### Backgrounds

Stat.Group is `default` on the page, and `muted` on a pane; `page` and `raised` where they fit.

```tsx example=OnAPane

```

### One figure

A Stat.Root has no surface; a Card gives one figure a frame.

```tsx example=InACard

```

## When to use

```tsx do=TrendInWords caption="Say the change in words, with its period."

```

```tsx dont=TrendWithoutWords caption="A bare percentage: without the icon and color, it doesn't say which way."

```

```tsx do=BadNewsTone caption="A rise that is bad news in the danger tone."

```

```tsx dont=DefaultToneForBadNews caption="A rising error rate in the default success tone."

```

- Three to five stats in a group.

### Content

- Labels as short noun phrases: Active projects, Lead time.
- The unit in the value or the description: 2.5 days, Median.
- Figures formatted in the reader's language: 1,284, €4,120.

## Anatomy

```tsx anatomy=StatAnatomy

```

1. **Group** (`env-stat-group`)
2. **Label** (`env-stat-label`, `label`)
3. **Value** (`env-stat-value`, `value`)
4. **Trend** (`env-stat-trend`, `trend`)
5. **Description** (`env-stat-description`, `description`)

## Adapting to width

A group shows as many even columns as fit, keeps two in a narrow group, and stacks only below that. Figures shrink to stay on one line.

```tsx example=GroupColumns widths="12 20 40"

```

## Accessibility

### envUI provides

- The trend's direction in its text and icon, never in color alone.
- `role="group"` on a named Stat.Group.
- Tabular digits, so figures don't shift as they change.

### You provide

- A trend label that says which way, such as +12% or 2 fewer.
- A name for a group that stands for a section.
- Figures formatted in the reader's language.

## Changelog

- **1.0.0**: Stat.Root's `detail` is `description`, with the class `env-stat-description`, and Stat.Group's `tone` is `background`: `pane` is `default`, `row` is `muted`, `canvas` is `page` and `alternate` is `raised`. `Stat` is a namespace: `Stat` is `Stat.Root` and `StatGroup` is `Stat.Group`, with the `Stat.Trend` and `Stat.TrendTone` types.
- **0.5.0**: Stat and StatGroup.
