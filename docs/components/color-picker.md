---
title: ColorPicker
summary: Picks a color, as hex, RGB or HSL.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - colour picker
  - color input
  - color chooser
  - color field
  - hex color
  - hex input
  - rgb
  - hsl
  - alpha
  - opacity
  - eyedropper
  - color swatch
  - swatch
  - color sample
useWhen:
  - Any color, such as an accent, chosen by eye, by value or from presets
  - A color in a toolbar, a row or a form that opens a picker (ColorPickerButton)
  - A chosen color shown in a list or a table, with its value (ColorSwatch)
avoidWhen:
  - text: Choosing one of a few named colors or themes.
    use: SegmentedControl
  - text: Choosing one of a fixed list of colors with names.
    use: Select
  - text: A light, dark or system appearance.
    use: Radio
components:
  - ColorPicker
  - ColorPickerButton
  - ColorSwatch
examples:
  MinimalPicker: overview
  EveryFormat:
    role: overview
    caption: With alpha, one format at a time.
  FormatsTogether: example
  PickerButtonOpen: example
  TextColorInToolbar: example
  PresetSwatches: example
  Swatches: example
  ColorPickerAnatomy: anatomy
  FillWidth: example
---

# ColorPicker

## Variants

### Several formats at once

```tsx figure=FormatsTogether motion

```

### Open from a button

```tsx figure=PickerButtonOpen motion

```

### A trigger of your own, swatches first

```tsx figure=TextColorInToolbar

```

### Preset swatches

```tsx figure=PresetSwatches motion

```

### Color swatches

```tsx figure=Swatches

```

## Anatomy

```tsx figure=ColorPickerAnatomy

```

1. **Picker** (`env-color-picker`)
2. **Label** (`env-color-picker-label`, `label`)
3. **Color area** (`env-color-picker-area`)
4. **Thumb** (`env-color-picker-area > env-color-picker-thumb`)
5. **Hue slider** (`env-color-picker-slider[data-channel='hue']`)
6. **Alpha slider** (`env-color-picker-slider[data-channel='alpha']`)
7. **Format** (`env-color-picker-format`)
8. **Fields** (`env-color-picker-fields`)
9. **Eyedropper** (`env-color-picker-eye-dropper`)
10. **Copy** (`env-color-picker-copy`)
11. **Swatches** (`env-color-picker-swatches`, `swatches`)

## Behaviour

### States

<!-- specimen: States -->

### Adapting to width

```tsx figure=FillWidth widths="22 15" sweep

```

## Accessibility

### Keyboard

| Key                                          | Action                                                                  |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd> in the color area | Changes the saturation; <kbd>Shift</kbd> or <kbd>Page Up</kbd> by more. |
| <kbd>↑</kbd>, <kbd>↓</kbd> in the color area | Changes the brightness; <kbd>Shift</kbd> or <kbd>Page Up</kbd> by more. |
| <kbd>↑</kbd>, <kbd>↓</kbd> in a slider       | Moves the hue or the alpha slider; <kbd>←</kbd>, <kbd>→</kbd> too.      |
| <kbd>Home</kbd>, <kbd>End</kbd> in a slider  | Moves the hue or the alpha slider to its bottom or its top.             |
| <kbd>←</kbd>, <kbd>→</kbd> in the swatches   | Moves between swatches; <kbd>Enter</kbd> or <kbd>Space</kbd> chooses.   |
