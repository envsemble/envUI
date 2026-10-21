---
title: Meter
summary: A measurement within a known range, such as the seats assigned of a plan or the storage used of a quota, as a labelled bar.
status: stable
since: 0.2.0
category: Feedback & overlays
aliases:
  - gauge
  - usage bar
  - usage meter
  - quota
  - capacity
  - level
  - meters
useWhen:
  - A quantity within a known range, such as the seats assigned of a plan's five or the storage used of a quota.
  - Several limits people compare at a glance, such as a plan's seats, projects and requests.
avoidWhen:
  - text: How much of a task is done, such as an upload or an import.
    use: Progress
  - text: A key figure without a range, such as the active projects this month.
    see: key-figures
  - text: A value people set within a range, such as a volume or a limit.
    use: Slider
  - text: A score on a scale of stars, such as a review's 4.5 out of 5.
    use: Rating
related:
  - progress
  - key-figures
  - slider
  - colors
components:
  - Meter
---

# Meter

## Overview

A meter shows a measurement within a known range, such as the seats assigned of a plan.

```tsx example=SeatsAssigned

```

## When to use

```tsx do=PlanUsage caption="Say in text what a full meter means."

```

```tsx dont=FullWithoutWords caption="A full bar left to speak for itself: it has no warning color."

```

```tsx do=SameWidths caption="One width for meters people compare."

```

```tsx dont=MixedWidths caption="Bars of different lengths, side by side."

```

### Content

```tsx do=StorageQuota caption="The value as people count it, with its unit."

```

```tsx dont=PercentOfStorage caption="A percentage, where people count an amount."

```

- Name what is measured in `label`, such as Seats assigned.

## Anatomy

```tsx anatomy=MeterAnatomy

```

1. **Meter** (`env-meter`)
2. **Label** (`env-meter-label`, `label`)
3. **Value** (`env-meter-value`, `valueText`)
4. **Track** (`env-meter-track`)
5. **Indicator** (`env-meter-indicator`, `value`)

## Adapting to width

A meter fills its container. The label and the value wrap onto two lines where they don't fit.

```tsx example=LongLabel widths="12 24"

```

## Accessibility

### envUI provides

- `role="meter"` named by `label`, with its value and range, kept within the range.
- `aria-valuetext` from the prop.
- No motion under reduced motion.

### You provide

- `aria-valuetext` with the unit in words, such as 2 of 5 seats; without it, the value is read as a percentage.
- Text that says when a limit is reached.

## Changelog

- **1.0.0**: The classes are `env-meter*`; without `aria-valuetext` the formatted value stays; `className`, `style`, `ref` and data attributes reach the root, and numbers follow the provider's locale.
- **1.0.0**: In the dark theme, meters reach 3:1 on every surface.
- **0.4.0**: The track uses the translucent neutral fill, so it stays visible on panes, rows and cards.
- **0.2.0**: Meter.
