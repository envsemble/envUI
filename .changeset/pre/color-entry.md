---
'@envsemble/envui': major
---

ColorPicker and ColorSwatch move to their own entry point, `@envsemble/envui/color`, rebuilt on React Aria's color hooks (`@react-aria/color`, `@react-stately/color` and `@react-aria/i18n`), which the application installs, as the setup guide lists; an application that never imports the entry never loads them. The main entry exports neither any more.

- **ColorPicker** is compact: a saturation and brightness area, a hue slider, an alpha slider and field with `alpha`, a format menu and quiet fields for hex, RGB and HSL, each channel named by its letter beside its number, such as R, G and B, a copy button, the browser's eyedropper where it has one (`eyeDropper`), and preset `swatches`. `formats` chooses the formats and their order, and `copy` the copy button. `value` and `defaultValue` take a CSS color string, hex, `rgb()` or `hsl()`, or React Aria's `Color`; `onValueChange(value, color)` receives the string in `valueFormat`, `#rrggbb` by default, and the `Color`; `name` submits the string through a hidden input. `showLabel`, `description`, `error`, `disabled` and `readOnly` stay; `variant` is gone, and `ref` reaches the picker's root rather than the HEX field. Fields commit on Enter and as focus leaves, and the arrow keys step them.
- **ColorPickerButton** is a compact button that shows a color as a swatch and its value, named after its label, and opens a ColorPicker in a popover.
- **ColorSwatch** is a small rounded square with a checkerboard under a translucent color. `format` writes its value beside it, `label` a name, and `size="sm"` makes it smaller; alone, it is an image named by its color's description, such as dark purple. As the icon of an IconButton in its default variant, the button is a rounded square with no fill at rest, which shows on hover, focus and press.
- EnvUIProvider's `messages.colorPicker` holds `format`, `formatButton`, `hex`, `rgb`, `hsl`, `hexField`, the channel letters `redShort` to `alphaShort`, `copy`, `eyeDropper`, `swatches` and `button`; `description`, `invalid`, `hexLabel`, `restored`, `hue`, `area` and `areaValue` are gone, as React Aria names the channels and the area in the provider's locale.
- Parts: `env-color-picker-plane`, `env-color-picker-saturation`, `env-color-picker-saturation-slider`, `env-color-picker-saturation-thumb`, `env-color-picker-hue-control`, `env-color-picker-hue-thumb`, `env-color-picker-hue-track` and `env-color-picker-status` are gone. The area is `env-color-picker-area`, its thumb and the sliders' `env-color-picker-thumb`, the sliders `env-color-picker-slider` (`env-color-picker-hue`, `env-color-picker-alpha`) with `env-color-picker-track`, and the fields `env-color-picker-fields`; a swatch's color is `env-color-swatch-sample`.

The `v1-props` and `v1-entries` codemods move the props and the imports.

Migration guide: [Color picker and swatches](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
