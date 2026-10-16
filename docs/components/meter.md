---
title: Meter
summary: A measurement within a known range, such as the seats assigned of a plan or the storage used of a quota, as a labelled bar.
status: beta
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
    use: Stat
  - text: A value people set within a range, such as a volume or a limit.
    use: Slider
  - text: A score on a scale of stars, such as a review's 4.5 out of 5.
    use: Rating
related:
  - progress
  - stat
  - slider
  - colors
components:
  - Meter
---

# Meter

## Overview

A meter shows a measurement within a known range as a labelled bar: the seats assigned of a plan, or the storage used of a quota. It is read-only, and assistive technology reads it as a meter named by its label, with its value and range. For how much of a task is done, use Progress, which shares its look.

```tsx example=SeatsAssigned

```

## Anatomy

1. **Label** (`label`): muted 0.875 rem text at the start of the top row, which names the meter.
2. **Value** (optional, `valueText`): the value as text at the end of the row, in the strong text color at medium weight, such as 2 of 5. The label and the value keep 0.75 rem apart and wrap onto two lines when they don't fit.
3. **Track**: 0.625 rem tall and fully rounded, on the neutral fill, 0.5 rem below the row.
4. **Indicator**: the control blue, from the start of the track to the value's share of the range, with rounded ends.

The meter fills the width of its container; give the container a width where a full-width bar would be too long.

## States and behaviour

- **Range**: `min` and `max` set the range, 0 and 100 by default. A value outside the range shows, and is reported, as the nearest end.
- **Changes**: when the value changes, the indicator grows or shrinks to it over 0.16 s; with a reduced-motion preference it changes at once.
- **One color**: the indicator keeps the control blue whatever the value. A meter doesn't mark a value as low, high or over a limit; say so in text, such as in `valueText` or beside the meter.
- **Read-only**: a meter takes no focus and no input.

## Content guidelines

- Name what is measured in the label, as a short noun phrase in sentence case: "Seats assigned", "Storage", "API requests this month".
- Write the value as people count it, with the range and the unit: "2 of 5", "7.2 GB of 10 GB". Format numbers in the application, in the reader's language.
- Write `aria-valuetext` with the unit in words: "2 of 5 seats", "7.2 gigabytes of 10".

## Do and don't

### Do

- Show the value as text with `valueText` where the exact amount matters; the bar alone is approximate.
- Give meters that people compare the same width, so their bars compare too.
- Say beside the meter what happens at the limit, such as "All seats are assigned. Remove a member to invite another."

### Don't

- Don't use a meter for a task's progress; use [Progress](../components/progress.md).
- Don't rely on the bar to warn about a limit; it has no warning color.
- Don't use a meter for a figure without a known maximum; use [Stat](../components/stat.md).

## Accessibility

### Keyboard

| Key                                             | Action                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Pass over the meter, which takes no focus; screen readers reach it as they read the page. |

### envUI provides

- `role="meter"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, the value kept within the range.
- The label as the meter's name, through `aria-labelledby`.
- `aria-valuetext` from the prop.
- A label and a value in text colors that reach 4.5:1 on the canvas, panes and rows.
- No motion with a reduced-motion preference.

### You provide

- A label that names what is measured.
- `aria-valuetext` with the value and its unit in words, such as "2 of 5 seats". Without it, a screen reader reads only the number, such as 2.
- The value as text in `valueText` where the exact amount matters.
- Text that says when a limit is reached, since the bar doesn't change color.

## Examples

### Units in words

The value shows the abbreviation, and `aria-valuetext` reads the unit in words.

```tsx example=StorageQuota

```

### Limits of a plan

Meters of one plan side by side, each with its own range. The text below says what the full one means.

```tsx example=PlanUsage

```

## Changelog

- **1.0.0**: In the dark theme, meters reach 3:1 on every surface.
- **0.4.0**: The track uses the translucent neutral fill, so it stays visible on panes, rows and cards.
- **0.2.0**: Meter.
