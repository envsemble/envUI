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
  - A value adjusted by eye in a known range, such as opacity, volume or zoom
  - A value whose place in the range matters more than the exact number
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

Slider is a field, as tall as the fields and with their corners, so it sits in a form among them: its label inside at the start, its value at the end and a fill from the start that shows it. At rest that is all it shows, and the fill ends crisply.

```tsx example=LayerOpacity

```

### Under the pointer

When the pointer comes over the slider, a thin handle marks the value and faint ticks mark its steps. Where the handle, the end of the fill and the ticks pass under the label or the value, they fade, so the text keeps its full strength. Pressing anywhere moves the value there, and dragging carries it along. Once the slider is let go, the handle and the ticks go away, even with the pointer still over it, and come back when the pointer leaves and returns. On a touch screen they show only while the finger is down.

### With the keyboard

Reached with the keyboard, the slider shows its focus ring and the handle at the value, faded under the text in the same way. The arrow keys move the value; the ticks stay hidden.

### Save once a change is complete

The value follows the pointer as it moves, and is reported once more when the pointer lets go or after a key. Save it then.

```tsx example=SaveOnRelease

```

### Steps

A slider has a lowest and a highest value and a step between values.

```tsx example=SessionTimeout

```

## When to use

```tsx do=UsefulSteps caption="A step and a range that match the precision people need."

```

```tsx dont=NeedlessPrecision caption="Single minutes over a whole day: no value is easy to reach."

```

### Show the effect

Show the effect where people can see it as the value changes.

### Labels

Show the value with its unit, such as 30 minutes; the same text is announced.

## Anatomy

```tsx anatomy=SliderAnatomy

```

1. **Slider** (`env-slider`)
2. **Field** (`env-slider-control`)
3. **Label** (`env-slider-label`, `label`)
4. **Fill** (`env-slider-indicator`)
5. **Handle** (`env-slider-thumb`)
6. **Value** (`env-slider-value`, `formatValue`)
7. **Description** (`env-field-description`, `description`)

Not shown: the span the value moves along, which draws the faint ticks, and the row of the label and the value.

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

## In code

### Usage

A Slider takes its `label`, inside it at the start, and a `description` under it. Leave it uncontrolled, with `defaultValue`, the minimum by default, or control it with `value` and `onValueChange`, which receives the value as often as the handle moves. `formatValue` formats the value with its unit, such as `` (value) => `${value}%` ``, as it shows at the end and is announced; without it, the number shows in the `locale`, EnvUIProvider's by default.

```tsx source=LayerOpacity

```

#### Save once a change is complete

`onValueCommitted` reports the value once a change is complete: when the pointer is released or the track pressed, and after each key. Save from it.

```tsx source=SaveOnRelease

```

#### Steps in a form

`min` and `max`, 0 and 100 by default, set the range, and `step`, 1 by default, the distance between values, counted from `min`. `largeStep`, a tenth of the range in whole steps by default, is the change of <kbd>Page Up</kbd>, <kbd>Page Down</kbd> and an arrow with <kbd>Shift</kbd>. `name` submits the value with a form, `form` names a form the slider sits outside of, and a reset returns to `defaultValue`.

```tsx source=SessionTimeout

```

#### Disabled

`disabled` dims the slider: it can't be focused or moved, and forms leave it out. Say in the `description` who sets the value.

```tsx
import { Slider } from '@envsemble/envui';

export default function ManagedLimit() {
  return (
    // As wide as a form column.
    <div style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Slider
        label="Storage per member"
        description="Sam Lee, your administrator, sets this limit for everyone at Northwind."
        min={5}
        max={100}
        step={5}
        defaultValue={20}
        formatValue={(value) => `${value} GB`}
        disabled
      />
    </div>
  );
}
```

### Composition

`inputRef` reaches the native range input, such as to focus it. The parts are the slider, `env-slider`; the row of the label and the value, `env-slider-heading`, with the label, `env-slider-label`, and the value, `env-slider-value`, in numbers of one width; the field, `env-slider-control`, the track's quiet tint, which takes the pointer, with the fill from the start to the value, `env-slider-indicator`, and the handle, `env-slider-thumb`; and the description, `env-field-description`. The span the value moves along, `env-slider-track`, runs across the whole field, so the fill is empty at the minimum and full at the maximum, and draws the faint ticks at the steps, or at the large steps where the steps are many. The field marks what it shows besides its text and fill: `data-handle` while the handle shows, under a hovering or pressing pointer and with keyboard focus, `data-ruler` while the ticks do, under a hovering or pressing pointer, and `data-pressed` while the pointer presses it. A release clears them until the pointer leaves and comes back.

### Customize

`--env-slider-container` sets the track's tint, `--env-slider-indicator` the fill and `--env-slider-content` the label, the value, the handle and the ticks of one Slider, through `style` or CSS; with none set, it keeps its own colors.

## Changelog

- **1.0.0-prerelease.2**: Slider is a field: as tall as the fields and with their corners, its label inside at the start, its value at the end in the text style of a field, with numbers of one width and a fill from the start, with a thin handle and faint ticks under the pointer and on focus, both fading where they pass under the text. The track has no outline. `--env-slider-indicator` colors the fill alone, and `--env-slider-content` the label, value, handle and ticks.
- **1.0.0**: `onValueCommit` is `onValueCommitted`, as Base UI names it, and `hint` is `description`, which the `v1-props` codemod writes. The value is formatted in EnvUIProvider's `locale`, or the one Slider takes.
- **1.0.0**: Sliders in the dark theme reach 3:1 contrast on every surface.
- **0.5.0**: Slider, with `formatValue`, `min`, `max`, `step`, `largeStep`, `hint`, `disabled`, `name`, `form` and `onValueCommit`; the thumb grows on touch screens.
