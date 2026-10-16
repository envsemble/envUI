---
title: ColorPicker
summary: A color area, a hue slider and a HEX field for choosing an opaque color, and a color swatch that shows one.
status: beta
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

A color picker chooses one opaque color in three ways that stay in step: a color area for saturation and brightness, a hue slider and a native HEX field. The field is the shared text field, so it takes part in forms, validation and reset, and it accepts six hexadecimal digits with or without #. The picker reports valid colors as lowercase `#rrggbb`; the application owns the color and what it means.

**ColorSwatch** is a round, decorative sample of a color, such as on the button that opens a ColorPicker in a Popover.

```tsx example=AccentColor

```

## Anatomy

1. **Label** (`label`): the color's name above the picker, in supporting text; it names the picker's group and, with "HEX", its field.
2. **Color area**: saturation across and brightness down for the current hue, with a round 1.75 rem handle; 3:2, between three compact control heights and 14 rem tall.
3. **Hue slider**: the hues as a bar under the area, as tall as a compact control, with its own handle.
4. **HEX field**: the shared text field labelled HEX, with a hint, and an error when the draft isn't a color.
5. **Swatch** (ColorSwatch): a round sample with a hairline ring in the strong border color, so white and black samples stay visible on every surface.

## Variants and sizes

- The picker fills its container's width; the color area keeps its 3:2 shape within its height limits. Give the picker its width on the container, such as about 20 rem in a Popover.
- The HEX field takes the field's `variant` and `compact`, as a TextField does.
- On touch screens the hue slider grows to 2.75 rem.
- A ColorSwatch is 1 rem; as a Button's start icon, or inside another icon slot, it takes that icon's size.

<!-- specimen: States -->

## States and behaviour

- **Choosing**: dragging or pressing in the area or on the slider, the arrow keys, or a valid HEX value change the color, and `onValueChange` receives it, normalized to lowercase `#rrggbb`. `value` controls the picker; `defaultValue` starts an uncontrolled one at that color, or `#000000`.
- **HEX drafts**: a partial or invalid draft doesn't call `onValueChange`. The field shows an error, "Use six hexadecimal digits (0–9, A–F).", reports itself invalid to the form and announces it; leaving the field with an invalid draft restores the last valid color and announces that. A valid draft is normalized as soon as it is typed.
- **Rejected changes**: a controlled picker whose application keeps the old `value` returns the area, the slider and the field to it.
- **Read only**: the area and the slider can't be changed or focused, and the HEX field stays focusable and copyable.
- **Disabled**: nothing can be changed or focused, the label and the area take the shared disabled opacity, and forms leave the field out.
- **In forms**: `name` submits the HEX field's value, `required` and `form` work as on a field, and a form reset restores an uncontrolled picker's `defaultValue` without calling `onValueChange`; a controlled picker keeps its `value`, and a reset the application cancels keeps the draft.
- **Swatch**: ColorSwatch takes any CSS color as `color`, and is hidden from assistive technology.

## Content guidelines

- Name the picker after what the color is for, in sentence case: "Accent color", "Label color".
- Use the hint for what the color affects, such as "Shown beside the project in lists."; by default it says how to write a HEX value.
- Write the color beside a swatch, such as its HEX value or a name, since the swatch is decorative.

## Do and don't

### Do

- Open a picker from a button with a ColorSwatch and the color's value, in a Popover, where the color is a setting among others.
- Check a chosen color's contrast where it carries text or meaning, and say what is wrong in `error`.
- Keep the color in the application's state with `value` and `onValueChange`, or submit it with `name`.

### Don't

- Don't use a picker for a short list of named colors; offer them as choices.
- Don't rely on a swatch alone to name a color.
- Don't expect alpha, short HEX or other color formats; the picker takes six-digit HEX colors only.

## Accessibility

### Keyboard

| Key                                             | Action                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the color area, the hue slider and the HEX field in turn. |
| <kbd>←</kbd>, <kbd>→</kbd> in the color area    | Lowers or raises the saturation by 5%.                                   |
| <kbd>↑</kbd>, <kbd>↓</kbd> in the color area    | Raises or lowers the brightness by 5%.                                   |
| <kbd>←</kbd>, <kbd>→</kbd> on the hue slider    | Moves the hue back or forward by 5% of the wheel.                        |
| Typing in the HEX field                         | Sets the color once the draft is six hexadecimal digits.                 |

### envUI provides

- A group named by `label`, around the area and the slider, sliders named "Color" and "Hue" whose values say the saturation and brightness, and the HEX field named after the label, such as "Accent color HEX".
- The hint and the error linked to the field, `aria-invalid` and the form's validity while a draft is invalid, and a status that announces invalid and discarded drafts.
- A focus outline on the area and the slider, and the shared field's focus.
- A swatch hidden from assistive technology.

### You provide

- A `label` that names what the color is for.
- The color in text beside a ColorSwatch, such as on the button that shows it.
- A check of the chosen color's contrast where it matters, and the message when it doesn't pass.

## Examples

### Open from a swatch

A secondary button shows the color as a swatch and its HEX value, and opens the picker in a Popover.

```tsx example=SwatchButton

```

### In a form

`name` submits the HEX value with the form, and Reset returns an uncontrolled picker to its `defaultValue`.

```tsx example=ProjectColorForm

```

### Swatches beside names

ColorSwatch shows each label's color before its name, with the value written beside it; a white swatch keeps its ring.

```tsx example=Swatches

```

## Changelog

- **0.7.0**: ColorSwatch.
- **0.1.0**: ColorPicker, with a color area, a hue slider and a HEX field.
