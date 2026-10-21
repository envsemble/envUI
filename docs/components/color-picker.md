---
title: ColorPicker
summary: A color area, a hue slider and a HEX field for choosing an opaque color, and a color swatch that shows one.
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
  - color swatch
  - swatch
  - color sample
useWhen:
  - People choose any opaque color, such as an accent or a label's color, by eye or by its HEX value.
  - A button or a list shows a color that people chose, as a round sample (ColorSwatch).
avoidWhen:
  - text: Choosing one of a few named colors or themes.
    use: SegmentedControl
  - text: Choosing one of a fixed list of colors with names.
    use: Select
  - text: A light, dark or system appearance.
    use: Radio
related:
  - popover
  - text-field
  - button
  - colors
  - accessibility
components:
  - ColorPicker
  - ColorSwatch
---

# ColorPicker

## Overview

A color picker chooses an opaque color with a color area, a hue slider and a HEX field that stay in step.

```tsx example=AccentColor

```

```tsx example=Swatches caption="ColorSwatch: a round sample of a color, beside its name."

```

### States

The HEX field takes six hexadecimal digits, with or without #, and takes part in forms and validation.

<!-- specimen: States -->

### Open from a swatch

In a Popover, opened by a button that shows the color as a swatch and its value.

```tsx example=SwatchButton

```

### In a form

`name` submits the HEX value, and a reset returns to `defaultValue`.

```tsx example=ProjectColorForm

```

## When to use

```tsx do=SwatchWithValue caption="A swatch with the color's value in text."

```

```tsx dont=SwatchAlone caption="A swatch alone, which names no color."

```

```tsx do=ContrastChecked caption="Check the contrast of a color that carries text, and say what is wrong."

```

```tsx dont=ContrastUnchecked caption="A color too light for text, taken without a word."

```

- The picker takes six-digit HEX colors only: no alpha or other formats.

## Anatomy

```tsx anatomy=ColorPickerAnatomy

```

1. **Picker** (`env-color-picker`)
2. **Label** (`env-color-picker > env-text`, `label`)
3. **Color area** (`env-color-picker-plane`)
4. **Area thumb** (`env-color-picker-saturation-thumb`)
5. **Hue slider** (`env-color-picker-hue-track`)
6. **Hue thumb** (`env-color-picker-hue-thumb`)
7. **HEX field** (`env-color-picker > env-text-field`)

## Adapting to width

The picker fills its container, and the color area keeps its shape.

```tsx example=FillWidth widths="14 24"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                     |
| ----------------------------------------------- | ---------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the color area, the hue slider and the HEX field. |
| <kbd>←</kbd>, <kbd>→</kbd> in the color area    | Changes the saturation by 1%, 10% with <kbd>Shift</kbd>.   |
| <kbd>↑</kbd>, <kbd>↓</kbd> in the color area    | Changes the brightness by 1%, 10% with <kbd>Shift</kbd>.   |
| <kbd>←</kbd>, <kbd>→</kbd> on the hue slider    | Moves the hue a degree, 18 with <kbd>Shift</kbd>.          |
| Typing in the HEX field                         | Sets the color once the draft is six digits.               |

### envUI provides

- A group named by `label`, with the area and the hue as sliders named after it, such as Accent color hue.
- Values that say the saturation, brightness and hue in words.
- A status that announces invalid and discarded drafts.
- A ColorSwatch hidden from assistive technology.

### You provide

- A `label` that names what the color is for.
- The color in text beside a ColorSwatch.
- A contrast check where the color carries text, and its message.

## Changelog

- **1.0.0**: The color area and the hue are envUI's own, the hue on Base UI's Slider, so the package no longer depends on react-colorful and its `.react-colorful` classes are gone. Their names, after the picker's label, the area's value text, the hue's in degrees, and the HEX field's labels, description and messages, come from EnvUIProvider's `messages`, and the percentages follow its locale. The area moves by 1 % per arrow key, 10 % with Shift. `hint` is `description`, which the `v1-props` codemod writes, and `ref` reaches the HEX field.
- **0.7.0**: ColorSwatch.
- **0.1.0**: ColorPicker, with a color area, a hue slider and a HEX field.
