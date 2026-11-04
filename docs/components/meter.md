---
title: Meter
summary: A measurement within a known range, such as the storage used of a quota.
status: stable
since: 1.0.0
category: Data display
aliases:
  - gauge
  - usage bar
  - usage meter
  - quota
  - capacity
  - level
  - meters
useWhen:
  - A quantity within a known range, such as storage used of a quota
  - Several limits compared at a glance, such as a plan's seats and projects
avoidWhen:
  - text: How much of a task is done, such as an upload or an import.
    use: Progress
  - text: A key figure without a range, such as the active projects this month.
    see: key-figures
  - text: A value people set within a range, such as a volume or a limit.
    use: Slider
  - text: A score on a scale of stars, such as a review's 4.5 out of 5.
    use: Rating
components:
  - Meter
examples:
  SeatsAssigned: overview
  MeterAnatomy: anatomy
  LongLabel: example
  PlanUsage:
    role: do
    caption: Say in text what a full meter means.
  FullWithoutWords:
    role: dont
    caption: 'A full bar left to speak for itself: it has no warning color.'
---

# Meter

## Anatomy

```tsx figure=MeterAnatomy

```

1. **Meter** (`env-meter`)
2. **Label** (`env-meter-label`, `label`)
3. **Value** (`env-meter-value`, `valueText`)
4. **Track** (`env-meter-track`)
5. **Indicator** (`env-meter-indicator`, `value`)

## Behaviour

### Out of range

A value outside the range shows as its nearest end.

### Adapting to width

A meter fills its container. The label and the value wrap onto two lines where they don't fit.

```tsx figure=LongLabel widths="12 24" sweep

```

## Rules

A meter has no warning color of its own, so say in text when a limit is reached.

```tsx figure=PlanUsage motion

```

```tsx figure=FullWithoutWords motion

```

### Content

Name what is measured in the label, such as Seats assigned.

## Accessibility

### envUI provides

- `role="meter"` named by `label`, with its value and range, kept within the range.
- `aria-valuetext` from the prop.
- No motion under reduced motion.

### You provide

- `aria-valuetext` with the unit in words, such as 2 of 5 seats; without it, the value is read as a percentage.
- Text that says when a limit is reached.

## Compose

### Usage

A Meter takes its `value` between `min`, 0 by default, and `max`, 100 by default; a value outside the range shows, and is reported, as the nearest end. Its `label`, above the bar, names it, such as Seats assigned. `valueText` shows the value at the end of the label's row, formatted by the application, such as 2 of 5; without it, no value shows. `aria-valuetext` is the value as assistive technology reads it, with its unit in words, such as 2 of 5 seats; without it, the value is read as a percentage of the range.

```tsx source=SeatsAssigned

```

### Composition

The parts are the meter, `env-meter`, its label, `env-meter-label`, its value, `env-meter-value`, the track, `env-meter-track`, and the indicator, `env-meter-indicator`. `className`, `style`, `ref` and data attributes reach the root, and the numbers follow the provider's locale. The meter has no warning color of its own, so say in text when a limit is reached.

## Changelog

- **1.0.0**: The classes are `env-meter*`; without `aria-valuetext` the formatted value stays; `className`, `style`, `ref` and data attributes reach the root, and numbers follow the provider's locale.
- **1.0.0**: In the dark theme, meters reach 3:1 on every surface.
