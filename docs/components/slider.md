---
title: Slider
summary: A value in a known range, chosen by pressing or dragging along a field, or with the keyboard.
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
components:
  - Slider
---

# Slider

## Overview

Slider is a field, as tall as the fields and with their corners, so it sits in a form among them: its label inside at the start, its value at the end and a fill from the start that shows it. A thin handle and faint ticks at its steps appear under the pointer and while it has focus. The label and the value always keep their full strength: where the handle and the end of the fill pass under them, those fade instead.

```tsx example=LayerOpacity

```

### Save once a change is complete

`onValueChange` follows the value as it moves; `onValueCommitted` reports it once, when the pointer is released or after a key. Save from it.

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

## Anatomy

```tsx anatomy=SliderAnatomy

```

1. **Slider** (`env-slider`)
2. **Field** (`env-slider-control`): the track, a quiet tint, which takes the pointer
3. **Label** (`env-slider-label`, `label`)
4. **Fill** (`env-slider-indicator`): from the start to the value
5. **Handle** (`env-slider-thumb`)
6. **Value** (`env-slider-value`, `formatValue`), with numbers of one width
7. **Description** (`env-field-description`, `description`)

Not shown: the span the value moves along, `env-slider-track`, inside the field's rounded ends, which draws the faint ticks at the steps, or at the large steps where the steps are many, and the row of the label and the value, `env-slider-heading`.

### Colors

`--env-slider-container` sets the track's tint, `--env-slider-indicator` the fill and `--env-slider-content` the label, the value, the handle and the ticks of one Slider, through `style` or CSS; with none set, it keeps its own colors.

## Adapting to width

A slider fills its container. Where it is narrow, a long label is cut short with an ellipsis, and the value keeps its room.

```tsx example=NarrowSlider widths="14 30"

```

## Accessibility

### Keyboard

| Key                                                                         | Action                                    |
| --------------------------------------------------------------------------- | ----------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                             | Moves to and from the slider.             |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd>                      | Moves a step, in the reading direction.   |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, or <kbd>Shift</kbd> with an arrow | Moves a large step, a tenth of the range. |
| <kbd>Home</kbd>, <kbd>End</kbd>                                             | Moves to the minimum or maximum.          |

### envUI provides

- A native range input in Base UI's slider, named by its label.
- The formatted value as `aria-valuetext`, such as 40%.
- The description linked to the input, a focus ring around the whole field, and the touch height on touch screens, where the whole field takes the finger.

### You provide

- A `label`, or `aria-label` on a slider without one.
- A `formatValue` with the unit, in the application's language.
- The effect of the value, and saving it.

## Changelog

- **1.0.0-prerelease.2**: Slider is a field: as tall as the fields and with their corners, its label inside at the start, its value at the end in the text style of a field, with numbers of one width and a fill from the start, with a thin handle and faint ticks under the pointer and on focus, both fading where they pass under the text. The track has no outline. `--env-slider-indicator` colors the fill alone, and `--env-slider-content` the label, value, handle and ticks.
- **1.0.0**: `onValueCommit` is `onValueCommitted`, as Base UI names it, and `hint` is `description`, which the `v1-props` codemod writes. The value is formatted in EnvUIProvider's `locale`, or the one Slider takes.
- **1.0.0**: Sliders in the dark theme reach 3:1 contrast on every surface.
- **0.5.0**: Slider, with `formatValue`, `min`, `max`, `step`, `largeStep`, `hint`, `disabled`, `name`, `form` and `onValueCommit`; the thumb grows on touch screens.
