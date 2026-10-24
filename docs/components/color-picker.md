---
title: ColorPicker
summary: A compact color picker on React Aria's color hooks, with hex, RGB and HSL, optional alpha, copy, an eyedropper and preset swatches; a button that opens it in a popover; and a color swatch that shows a color in a format.
status: stable
since: 0.1.0
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
  - People choose any color, such as an accent or a label's color, by eye, by its value or from presets.
  - A toolbar, a row or a form shows a color that opens a picker (ColorPickerButton).
  - A list or a table shows a color that people chose, with its value (ColorSwatch).
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
---

# ColorPicker

## Overview

A color picker chooses a color by eye, by its value or from presets. A square area chooses the saturation and brightness, with upright hue and alpha strips at its side; under them, a row holds the format menu, the eyedropper and copy, and the fields take the row below. It is built on React Aria's color hooks and comes from its own entry, `@envsemble/envui/color`, whose libraries the application installs, as [setup](../setup.md#public-entry-points) lists.

```tsx example=MinimalPicker

```

```tsx example=EveryFormat caption="Every format, with alpha: the application chooses the formats and whether the color has an alpha."

```

### Formats and values

`formats` lists the formats people can type the color in, hex, RGB and HSL, and the format menu lists them in that order; with one, there is no menu. Each channel's field shows its letter, such as R, G and B, beside its number. `value` and `defaultValue` take a CSS color string or React Aria's `Color`, and `onValueChange` receives the color as a string in `valueFormat`, hex by default, and as a `Color`. With `alpha`, the picker adds an alpha slider and field, and the value carries its alpha while it is translucent.

The copy button copies the color as the fields show it. The eyedropper picks a color from the screen where the browser has one, Chromium-based browsers on the desktop; elsewhere it never shows.

### Open from a button

ColorPickerButton shows the color as a swatch and its value, and opens a picker in a popover.

```tsx example=PickerButtonOpen open

```

### Preset swatches

`swatches` lists colors to choose from, each with an optional name.

```tsx example=PresetSwatches

```

### Color swatches

ColorSwatch shows a color as a small sample, with its value in a `format` and an optional `label`.

```tsx example=Swatches

```

```tsx example=SwatchFormats caption="Hex, RGB and HSL, a translucent color over a checkerboard, and the small size."

```

### States

<!-- specimen: States -->

### In a form

`name` submits the color as a string in `valueFormat`, and a reset returns to `defaultValue`. The picker always holds a color, so it takes no `required`: where a color must be chosen, keep "no color yet" in the form's own state and validate it there.

```tsx example=ProjectColorForm

```

## When to use

```tsx do=PickerButton caption="ColorPickerButton: the color's swatch and value, named after its label."

```

```tsx dont=SwatchAlone caption="A swatch alone, which hides the value and names no color."

```

```tsx do=OpaqueLabelColor caption="Offer only the formats and alpha the stored color can hold."

```

```tsx dont=TranslucentLabelColor caption="Alpha and every format for a color stored as six hex digits."

```

- Where the color carries text, check its contrast and say what is wrong through `error`.

## Anatomy

```tsx anatomy=ColorPickerAnatomy

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

Not shown: the description and error, `env-color-picker-description` and `env-color-picker-error`; ColorPickerButton's `env-color-picker-button` and its popover, `env-color-picker-popover`; and the eyedropper where the browser has none.

### Colors

ColorPickerButton has no fill of its own: like a field, it takes the background of what it sits on. `--env-color-picker-button-container` gives one button a fill, through `style` or CSS. [Customize colors](../customizing-colors.md) describes the roles.

## Adapting to width

The picker fills its container up to 18 rem, so that a wide picker stays compact, and everything under the area and the strips takes their width. The strips stay upright at the area's side at every width, and a narrow picker's area shrinks. The format menu, the eyedropper and copy share a row, and the fields take the row under it, in equal columns that keep each channel's letter in its place in every format.

```tsx example=FillWidth widths="15 22"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the area, the sliders, the format, the fields, the eyedropper and copy. |
| <kbd>←</kbd>, <kbd>→</kbd> in the color area    | Changes the saturation; <kbd>Shift</kbd> or <kbd>Page Up</kbd> by more.               |
| <kbd>↑</kbd>, <kbd>↓</kbd> in the color area    | Changes the brightness; <kbd>Shift</kbd> or <kbd>Page Up</kbd> by more.               |
| <kbd>↑</kbd>, <kbd>↓</kbd> in a slider          | Moves the hue or the alpha slider; <kbd>←</kbd>, <kbd>→</kbd> too.                    |
| <kbd>Home</kbd>, <kbd>End</kbd> in a slider     | Moves the hue or the alpha slider to its bottom or its top.                           |
| <kbd>↑</kbd>, <kbd>↓</kbd> in a field           | Steps its value.                                                                      |
| <kbd>Enter</kbd> in a field                     | Commits what was typed, as leaving the field does.                                    |
| <kbd>←</kbd>, <kbd>→</kbd> in the swatches      | Moves between swatches; <kbd>Enter</kbd> or <kbd>Space</kbd> chooses.                 |

### envUI provides

- A group named by `label`, with the area, sliders and fields named after their channels, such as Hue and Alpha, in the EnvUIProvider's language.
- Value texts that say each channel and the color's name, such as dark vibrant blue.
- Names for the format menu, the channels' letters, copy, the eyedropper and the swatches from EnvUIProvider's `messages.colorPicker`.
- A ColorSwatch alone named by its color's description; beside its value or label, the sample is hidden from assistive technology.

### You provide

- A `label` that names what the color is for.
- A contrast check where the color carries text, and its message in `error`.

## Changelog

- **1.0.0**: ColorPicker, ColorPickerButton and ColorSwatch come from `@envsemble/envui/color`, on React Aria's color hooks: hex, RGB and HSL fields named by their letters, with a format menu, an alpha slider and field with `alpha`, a copy button, the browser's eyedropper and preset `swatches`. Values are CSS color strings or React Aria's `Color`, and `onValueChange` receives both. The area is square with the hue and alpha strips upright at its side, all with square corners, and the fields are quiet. ColorSwatch is a small square that writes its color in a `format`, with a `label` and a small size. ColorPickerButton has no fill of its own, as fields have none, and `--env-color-picker-button-container` gives one button a fill. Before, the color area and the hue were envUI's own, on Base UI's Slider, with a HEX field.
- **0.7.0**: ColorSwatch.
- **0.1.0**: ColorPicker, with a color area, a hue slider and a HEX field.
