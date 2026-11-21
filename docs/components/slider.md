---
title: Slider
summary: A value in a known range, chosen by dragging or with the keyboard.
status: stable
since: 1.0.0
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
components:
  - Slider
examples:
  LayerOpacity:
    role: overview
    caption: A field among fields, with its label inside at the start, its value at the end and a fill that shows it.
  SliderAnatomy:
    role: anatomy
    caption: As under the pointer, which shows the handle.
  SaveOnRelease: example
  SessionTimeout: example
  IconsAndUnits: example
  NarrowSlider: example
---

# Slider

## Anatomy

```tsx figure=SliderAnatomy specimen

```

1. **Slider** (`env-slider`)
2. **Field** (`env-slider-control`)
3. **Label** (`env-slider-label`, `label`)
4. **Fill** (`env-slider-indicator`)
5. **Handle** (`env-slider-thumb`)
6. **Value** (`env-slider-value`, `formatValue`)
7. **Description** (`env-field-description`, `description`)

## Behaviour

### Under the pointer

<!-- specimen: UnderThePointer -->

### Past the ends

<!-- specimen: PastTheEnds -->

### With the keyboard

<!-- specimen: WithTheKeyboard -->

### Saving

```tsx figure=SaveOnRelease motion

```

### Steps

```tsx figure=SessionTimeout

```

### Icons and units

```tsx figure=IconsAndUnits

```

### Adapting to width

```tsx figure=NarrowSlider widths="30 10" sweep

```

## Accessibility

### Keyboard

| Key                                                                         | Action                                    |
| --------------------------------------------------------------------------- | ----------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd>                      | Moves a step, in the reading direction.   |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, or <kbd>Shift</kbd> with an arrow | Moves a large step, a tenth of the range. |
| <kbd>Home</kbd>, <kbd>End</kbd>                                             | Moves to the minimum or maximum.          |
