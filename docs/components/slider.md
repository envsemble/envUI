---
title: Slider
summary: A value in a known range, chosen by dragging a thumb, pressing the track or with the keyboard.
status: stable
since: 0.5.0
category: Forms & selection
aliases:
  - range
  - range slider
  - range input
  - range control
  - input range
  - track bar
  - volume slider
useWhen:
  - People adjust a value by eye within a known range, such as opacity, volume or zoom, and see the result as they move it.
  - The exact number matters less than its place in the range, and the value shows beside the label as it changes.
avoidWhen:
  - text: People know the exact number they want, such as a price or a quantity.
    use: TextField
  - text: Choosing one of a few named levels, such as Low, Medium and High.
    use: SegmentedControl
  - text: Showing a measurement people don't change, such as storage used.
    use: Meter
  - text: Showing how far a task has got.
    use: Progress
related:
  - text-field
  - segmented-control
  - meter
  - progress
  - accessibility
components:
  - Slider
---

# Slider

## Overview

A slider chooses a value in a range by dragging a thumb, pressing the track or with the keyboard.

```tsx example=LayerOpacity

```

### Save once a change is complete

`onValueChange` follows the thumb as it moves; `onValueCommitted` reports the value once, when the thumb is released or after a key. Save from it.

```tsx example=SaveOnRelease

```

### Steps in a form

`min`, `max` and `step` set the values, and `name` submits the value with the form.

```tsx example=SessionTimeout

```

### A value people can't change

A disabled slider keeps its value visible; the description says who sets it.

```tsx example=ManagedLimit

```

## When to use

```tsx do=UsefulSteps caption="A step and a range that match the precision people need."

```

```tsx dont=NeedlessPrecision caption="Single minutes over a whole day: no value is easy to reach."

```

- Show the effect where people can see it as the value changes.

### Labels

Name the value in a short noun, and format it with its unit in `formatValue`; the same text is announced.

```tsx do=FormattedValue caption="The value as people read it, with its unit."

```

```tsx dont=RawValue caption="A raw number that people must interpret."

```

## Anatomy

```tsx anatomy=SliderAnatomy

```

1. **Slider** (`env-slider`)
2. **Label** (`env-slider-label`, `label`)
3. **Value** (`env-slider-value`, `formatValue`)
4. **Track** (`env-slider-track`)
5. **Indicator** (`env-slider-indicator`)
6. **Thumb** (`env-slider-thumb`)
7. **Description** (`env-field-description`, `description`)

## Adapting to width

A slider fills its container. Where the line is too narrow, the value wraps under the label.

```tsx example=NarrowSlider widths="14 30"

```

## Accessibility

### Keyboard

| Key                                                                         | Action                                    |
| --------------------------------------------------------------------------- | ----------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                             | Moves to and from the thumb.              |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd>                      | Moves a step, in the reading direction.   |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, or <kbd>Shift</kbd> with an arrow | Moves a large step, a tenth of the range. |
| <kbd>Home</kbd>, <kbd>End</kbd>                                             | Moves to the minimum or maximum.          |

### envUI provides

- A native range input in Base UI's slider, named by its label.
- The formatted value as `aria-valuetext`, such as 40%.
- The description linked to the input, and a 2.75 rem target on touch screens.

### You provide

- A `label`, or `aria-label` on a slider without one.
- A `formatValue` with the unit, in the application's language.
- The effect of the value, and saving it.

## Changelog

- **1.0.0**: `onValueCommit` is `onValueCommitted`, as Base UI names it, and `hint` is `description`, which the `v1-props` codemod writes. The value is formatted in EnvUIProvider's `locale`, or the one Slider takes.
- **1.0.0**: Sliders in the dark theme reach 3:1 contrast on every surface.
- **0.5.0**: Slider, with `formatValue`, `min`, `max`, `step`, `largeStep`, `hint`, `disabled`, `name`, `form` and `onValueCommit`; the thumb grows on touch screens.
