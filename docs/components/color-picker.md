---
title: ColorPicker
summary: A compact color picker with hex, RGB and HSL, optional alpha, copy, an eyedropper and preset swatches; a button that opens it in a popover; and a color swatch that shows a color in a format.
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
  PresetSwatches: example
  Swatches: example
  SwatchFormats:
    role: example
    caption: Hex, RGB and HSL, a translucent color over a checkerboard, and the small size.
  ColorPickerAnatomy: anatomy
  FillWidth: example
  PickerButton:
    role: do
    caption: "ColorPickerButton: the color's swatch and value, named after its label."
  SwatchAlone:
    role: dont
    caption: A swatch alone, which hides the value and names no color.
---

# ColorPicker

## Variants

### Formats and values

The picker shows one format at a time, hex first, and the format menu switches to RGB or HSL.

- It can also show one format alone, with no menu, or several together.
- Each channel's field shows its letter, such as R, G and B, beside its number.
- A color with an alpha keeps it while it is translucent.

### Several formats at once

Several formats show their fields on a row each, with a copy button each. They edit the same color: typing in one moves the others.

- The channels' letters and the hex value's # say which format a row holds.
- The letters and numbers line up from row to row.
- With an alpha, each row ends in it.

```tsx figure=FormatsTogether

```

### Open from a button

ColorPickerButton shows the color as a swatch and its value, and opens a picker in a popover.

- It has no fill of its own: like a field, it takes the background of what it sits on.
- One button can be given a fill of its own.

```tsx figure=PickerButtonOpen open

```

### Preset swatches

A picker can offer colors to choose from, each with an optional name.

```tsx figure=PresetSwatches

```

### Color swatches

ColorSwatch shows a color as a small sample, with its value in a format and an optional label.

As the icon of an icon button, it is a rounded square whose fill shows on hover, keyboard focus and press, and while its popup is open.

```tsx figure=Swatches

```

```tsx figure=SwatchFormats

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

A read-only picker can be read and copied but not changed, and a disabled one takes no input.

<!-- specimen: States -->

### Copy and the eyedropper

Copy copies the color as the fields show it.

The eyedropper picks a color from the screen in browsers that offer one, on the desktop; elsewhere it never shows.

### Adapting to width

The picker fills its container but stays compact in a wide one, and everything under the area and the strips takes their width.

- The strips stay upright at the area's side at every width.
- A narrow picker's area shrinks.
- The format menu, the eyedropper and copy share a row.
- The fields take the row under it, in equal columns that keep each channel's letter in its place in every format.

```tsx figure=FillWidth widths="15 22"

```

## Rules

A picker shows the color's value beside its swatch, and checks the contrast of a color that carries text.

```tsx figure=PickerButton

```

```tsx figure=SwatchAlone

```

### Contrast

Where the color carries text, check its contrast and say what is wrong under the picker.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the area, the sliders, the format, the fields, the eyedropper and copy; with several formats, through each row's fields and copy in turn. |
| <kbd>←</kbd>, <kbd>→</kbd> in the color area    | Changes the saturation; <kbd>Shift</kbd> or <kbd>Page Up</kbd> by more.                                                                                 |
| <kbd>↑</kbd>, <kbd>↓</kbd> in the color area    | Changes the brightness; <kbd>Shift</kbd> or <kbd>Page Up</kbd> by more.                                                                                 |
| <kbd>↑</kbd>, <kbd>↓</kbd> in a slider          | Moves the hue or the alpha slider; <kbd>←</kbd>, <kbd>→</kbd> too.                                                                                      |
| <kbd>Home</kbd>, <kbd>End</kbd> in a slider     | Moves the hue or the alpha slider to its bottom or its top.                                                                                             |
| <kbd>↑</kbd>, <kbd>↓</kbd> in a field           | Steps its value.                                                                                                                                        |
| <kbd>Enter</kbd> in a field                     | Commits what was typed, as leaving the field does.                                                                                                      |
| <kbd>←</kbd>, <kbd>→</kbd> in the swatches      | Moves between swatches; <kbd>Enter</kbd> or <kbd>Space</kbd> chooses.                                                                                   |

### envUI provides

- A group named by `label`, with the area, sliders and fields named after their channels, such as Hue and Alpha, in the EnvUIProvider's language.
- Value texts that say each channel and the color's name, such as dark vibrant blue.
- Names for the format menu, the channels' letters, copy, the eyedropper and the swatches from EnvUIProvider's `messages.colorPicker`.
- A ColorSwatch alone named by its color's description; beside its value or label, the sample is hidden from assistive technology.

### You provide

- A `label` that names what the color is for.
- A contrast check where the color carries text, and its message in `error`.

## Compose

### Usage

ColorPicker, ColorPickerButton and ColorSwatch come from their own entry, `@envsemble/envui/color`, built on React Aria's color hooks, whose libraries the application installs.

- A ColorPicker takes its `label`, which names it, a `description` and an `error`; `showLabel={false}` hides the label where something else names the picker, such as a popover.
- `value` and `defaultValue`, `#000000` by default, take a CSS color string, such as `#6750a4`, `rgb(103, 80, 164)` or `hsl(256, 34%, 48%)`, or React Aria's `Color`.
- `onValueChange` receives the color as a string in `valueFormat` and as a `Color`, which keeps the hue of a gray and converts to any format.
- `valueFormat` is `hex`, the default, `#rrggbb` or `#rrggbbaa` while translucent, `rgb` or `hsl`.
- With `alpha`, the picker adds an alpha slider and field; without it, colors are opaque.

```tsx source=MinimalPicker

```

#### Formats

Without `formats`, the picker shows one format at a time, hex first, with the format menu.

- `formats` with one format, such as `['hex']`, shows it alone, with no menu.
- With two or more, such as `['hex', 'rgb', 'hsl']`, it shows each on a row of its own in that order, with its own copy button.
- Each row is a group named after its format, so a screen reader says which Red or Alpha it is in.

Offer only the formats and the alpha the stored color can hold: a color stored as `#rrggbb` takes `formats={['hex']}` and no `alpha`, rather than every format and an alpha it would lose.

```tsx
<ColorPicker label="Brand color" defaultValue="#6b4fa3" formats={['hex', 'rgb', 'hsl']} />
<ColorPicker label="Label color" defaultValue="#2f6f62" formats={['hex']} />
```

#### Copy, the eyedropper and swatches

`copy` and `eyeDropper` are on by default. The eyedropper shows only where the browser has one, Chromium-based browsers on the desktop. `swatches` lists preset colors under the fields: CSS color strings, `Color`s, or `{ color, label }` with a name.

```tsx
<ColorPicker
  label="Project color"
  defaultValue="#6b4fa3"
  swatches={[
    { color: '#3b6fd4', label: 'Blue' },
    { color: '#2f6f62', label: 'Teal' },
  ]}
/>
```

#### ColorPickerButton

ColorPickerButton takes the picker's props, and opens it in a popover.

- `side` places the popover, `bottom` by default, lined up by `align`, `start` by default.
- `defaultOpen` starts it open.
- `size` is `sm`, `md` or `lg`, or its container's control height.
- `className` and `style` reach the button.

```tsx
<ColorPickerButton label="Label color" defaultValue="#2f6f62" />
```

#### ColorSwatch

ColorSwatch shows its `color`, with an optional alpha, and writes it in `format`, `hex`, `rgb` or `hsl`, after an optional `label`.

- Without a format and a label, the sample stands alone, named by the color's description, such as dark purple.
- `size` is `md`, 1 rem and the default, or `sm`, 0.75 rem, for dense rows; as a Button's icon it takes the icon's size.
- As the icon of an IconButton in its default variant, the button draws no round fill behind the square sample.

```tsx
<ColorSwatch color="#6b4fa3" label="Design" format="hex" />
```

#### In a form

`name` submits the color as a string in `valueFormat`, and `form` ties it to a form it sits outside; a reset returns to `defaultValue`.

- The picker always holds a color, so it takes no `required`: keep "no color yet" in the form's own state and validate it there.
- `readOnly` lets people read and copy the color but not change it.
- `disabled` takes no input.

```tsx
<form onSubmit={apply}>
  <ColorPicker
    label="Project color"
    name="color"
    defaultValue="#6b4fa3"
    formats={['hex', 'rgb']}
    description="Shown beside the project in lists."
  />
  <Button type="submit">Apply color</Button>
</form>
```

### Composition

The picker fills its container up to 18 rem. The picker, `env-color-picker`, holds its label, `env-color-picker-label`; the controls, `env-color-picker-controls`, with the area, `env-color-picker-area`, and the sliders, `env-color-picker-sliders`, the hue, `env-color-picker-hue`, and the alpha, `env-color-picker-alpha`, each an `env-color-picker-slider` with its track, `env-color-picker-track`, and a thumb, `env-color-picker-thumb`, like the area's; and the values, `env-color-picker-values`, with the format, `env-color-picker-format`, the eyedropper, `env-color-picker-eye-dropper`, copy, `env-color-picker-copy`, and the fields, `env-color-picker-fields`, each an `env-color-picker-field` with its letter, `env-color-picker-field-label`, and input, `env-color-picker-input`. Several formats shown together are rows, `env-color-picker-row`. Then come the swatches, `env-color-picker-swatches`, each an `env-color-picker-swatch`, the description, `env-color-picker-description`, and the error, `env-color-picker-error`. `data-channel` names a slider's or a field's channel, and `data-format` a row's format.

ColorPickerButton is `env-color-picker-button`, with its value, `env-color-picker-button-value`, and its popover, `env-color-picker-popover`. ColorSwatch is `env-color-swatch`, with its sample, `env-color-swatch-sample`, its label, `env-color-swatch-label`, and its value, `env-color-swatch-value`.

### Customize

ColorPickerButton has no fill of its own; `--env-color-picker-button-container` gives one button a fill, through `style` or CSS.

## Changelog

- **1.0.0-prerelease.3**: `formats` with two or more formats shows their fields together, a row each with its own copy button, where in 1.0.0-prerelease.2 it limited the format menu to them; the format menu stays the default. Remove `formats` to keep the menu, which offers every format, as [the migration guide](../migration.md#color-picker-and-swatches) says. `--env-color-picker-button-container` gives one ColorPickerButton a fill.
- **1.0.0**: ColorPicker, ColorPickerButton and ColorSwatch come from `@envsemble/envui/color`, on React Aria's color hooks: hex, RGB and HSL fields named by their letters, with a format menu, an alpha slider and field with `alpha`, a copy button, the browser's eyedropper and preset `swatches`. Values are CSS color strings or React Aria's `Color`, and `onValueChange` receives both. The area is square with the hue and alpha strips upright at its side, all with square corners, and the fields are quiet. ColorSwatch is a small square that writes its color in a `format`, with a `label` and a small size. ColorPickerButton has no fill of its own, as fields have none. Before, the color area and the hue were envUI's own, on Base UI's Slider, with a HEX field.
- **0.7.0**: ColorSwatch.
- **0.1.0**: ColorPicker, with a color area, a hue slider and a HEX field.
