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

A slider chooses a value in a range by dragging a thumb along a track, pressing the track or with the keyboard. Its label and the current value sit above the track and a description below it. Slider is built on Base UI's slider, around a native range input, so the arrow keys, focus, form submission and reset behave as the platform's.

```tsx example=LayerOpacity

```

## Anatomy

1. **Label** (`label`): the value's name, at the start of the line above the track, in 0.875 rem text. It names the slider, and pressing it moves focus to the slider.
2. **Value**: the current value at the end of the same line, in medium-weight figures of equal width, formatted by `formatValue`, such as 40%. It wraps under the label when the line is too narrow.
3. **Track**: a 0.375 rem pill across the slider's width, in the translucent fill.
4. **Indicator**: the part of the track from the start to the thumb, in the control blue.
5. **Thumb**: a 1.25 rem circle in the control blue, centred on the value; at the ends it stays inside the slider.
6. **Description** (optional, `description`): guidance under the track, 0.75 rem below it.

The track sits in a pressable row 1.75 rem tall, 0.75 rem below the label. The slider fills the width of its container; set the width on the container. The ref and other `div` props reach the root element; `inputRef` reaches the native range input.

## States and behaviour

- **Hover and dragging**: a halo in the control blue, 0.375 rem wide, rings the thumb while the pointer is on the track's row and while the thumb is dragged.
- **Focus**: keyboard focus shows the shared focus ring around the thumb.
- **Pressing the track** moves the thumb there and sets the value; dragging moves it with the pointer, in whole `step`s from `min`.
- **Changing and committing**: `onValueChange` receives the value each time it changes, as often as the thumb moves; `onValueCommitted` receives it once a change is complete: when the thumb is released, the track pressed, or after each key. Run work such as saving from `onValueCommitted`.
- **Range and steps**: `min` and `max` set the range, 0 to 100 by default, and `step` the values between them, 1 apart by default. `largeStep`, for <kbd>Page Up</kbd>, <kbd>Page Down</kbd> and <kbd>Shift</kbd> with an arrow key, is a tenth of the range in whole steps by default.
- **Disabled** (`disabled`): the track and thumb take the shared disabled opacity and the label and value the disabled text color. The slider can't be focused or moved, and forms leave it out.
- **Controlled or not**: `value` with `onValueChange` controls the slider; otherwise it starts from `defaultValue`, or `min`.
- **Native forms**: with `name` the value submits with the form, and `form` ties the slider to a form it sits outside of. A form reset returns an uncontrolled slider to `defaultValue` and leaves a controlled one as `value` says.
- **Touch screens**: the row is 2.75 rem tall, the thumb 1.5 rem, and an invisible 2.75 rem target around the thumb is easy to press.
- **Motion**: the halo eases in and out; with a reduced-motion preference it changes at once.

## Content guidelines

- Name the value in the label with a short noun phrase in sentence case, without a colon: "Opacity", "Notification volume", "Sign out after".
- Format the value with its unit in `formatValue`, as people read it: "40%", "30 min", "20 GB". The same text is announced.
- Put the range or what the value applies to in the description where it isn't obvious: "Minutes without activity, from 5 to 120."
- Keep the label the same as the value changes; the value beside it shows the change.

## Do and don't

### Do

- Show the effect of the value as it changes where people can see it, such as on the selected layer.
- Choose a `step` that matches the precision people need, such as 5 minutes, and a range that keeps the steps easy to reach.
- Save from `onValueCommitted`, so a drag saves once, not at every step.
- Say in the description why a disabled slider can't change, and who can change it.

### Don't

- Don't use a slider where people need an exact number; use [TextField](../components/text-field.md) with `type="number"`.
- Don't use a slider for a few named levels; use [SegmentedControl](../components/segmented-control.md) or [Radio](../components/radio.md).
- Don't use a slider to show a value people can't change; use [Meter](../components/meter.md) or [Progress](../components/progress.md).
- Don't leave the value unformatted when it has a unit; people and assistive technology read the same text.

## Accessibility

### Keyboard

| Key                                                                                          | Action                                                                             |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                              | Moves focus to and from the thumb; a disabled slider is skipped.                   |
| <kbd>→</kbd> or <kbd>↑</kbd>, <kbd>←</kbd> or <kbd>↓</kbd>                                   | Increases or decreases the value by one `step`, stopping at the ends of the range. |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                                     | Increases or decreases the value by `largeStep`, a tenth of the range by default.  |
| <kbd>Shift</kbd>+<kbd>→</kbd> or <kbd>↑</kbd>, <kbd>Shift</kbd>+<kbd>←</kbd> or <kbd>↓</kbd> | Increases or decreases the value by `largeStep`.                                   |
| <kbd>Home</kbd>, <kbd>End</kbd>                                                              | Sets the value to `min` or `max`.                                                  |

### envUI provides

- A native range input with the `slider` role, named by the label and described by the description, with `aria-valuenow`, `min` and `max`, and `aria-valuetext` from `formatValue`, so assistive technology announces "40%" rather than 40.
- The value as an `<output>` for the input, which stays quiet while the value moves, so the slider's own announcement isn't repeated.
- Focus moved to the slider when its label is pressed, and the shared focus ring around the thumb.
- A thumb and indicator at 3:1 contrast against the page, and a label and value at 4.5:1, in both themes.
- A 2.75 rem row and touch target on coarse pointers.
- Native disabled state, form submission and reset.

### You provide

- A `label` that names the value.
- A `formatValue` that adds the unit, in the application's language.
- The effect of the value, and an announcement where saving happens out of sight, such as a status message.

## Examples

### Save once a change is complete

The value follows the thumb as it moves, and `onValueCommitted` saves it once, when the thumb is released or after a key. A status line announces the save.

```tsx example=SaveOnRelease

```

### Steps in a form

`min`, `max` and `step` give whole 5-minute steps from 5 to 120, and `name` submits the value with the form. Reset returns the slider to `defaultValue`.

```tsx example=SessionTimeout

```

### A value people can't change

A disabled slider keeps its value visible, and the description says who sets it.

```tsx example=ManagedLimit

```

## Changelog

- **1.0.0**: `onValueCommit` is `onValueCommitted`, as Base UI names it, and `hint` is `description`, which the `v1-props` codemod writes. The value is formatted in EnvUIProvider's `locale`, or the one Slider takes.
- **1.0.0**: Sliders in the dark theme reach 3:1 contrast on every surface.
- **0.5.0**: Slider, with `formatValue`, `min`, `max`, `step`, `largeStep`, `hint`, `disabled`, `name`, `form` and `onValueCommit`; the thumb grows on touch screens.
