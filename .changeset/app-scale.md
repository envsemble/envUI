---
'@envsemble/envui': major
---

An app scale: `Theme` and `ThemePreferenceProvider` take `scale`, `comfortable` (the default, today's sizes) or `compact`, about 0.8 of them with type one step smaller, for desktop productivity apps. Left out, a Theme takes the scale of the Theme around it. Theme writes it to `data-env-scale` on every boundary, nested ones and those around popups included, and `useTheme()` returns `{ theme, contrast, scale }`. `createThemeBootstrapScript({ scale: 'compact' })` puts the compact scale on the root before the first paint. Use one scale per app or window, and another only on a Theme around a whole region.

Every size is a token, with a value per scale: `--control-height-xs`, `-sm`, `-md` and `-lg`, `--row-height`, the row densities' `--row-padding-block-*`, `--control-gap`, `--font-size-caption` and `--font-size-label`, `--icon-size-sm`, `-md` and `-lg`, `--radius-large`, `--field-floating-height` and `--row-content-height` are new, and the spacing, type, corner, top bar and title bar tokens take their compact values in the compact scale. Icons keep a 1 rem floor, and borders and focus rings keep their widths. The type roles `--type-h1`, `--type-h2`, `--type-body` and `--type-body-small` are tokens now, with a custom property for each part, such as `--type-body-font-size`.

Removed custom properties: `--control-height-small` and `--icon-button-size`, which `--control-height` replaces, `--control-height-compact`, which `--control-height-sm` replaces, and the `--scale` multiplier, which components no longer read. `--control-height` is the height of a control that sets no size; a container can set it to another control height for what it holds, as table cells do with `--control-height-sm`.

Under a coarse pointer, buttons, icon buttons, segments, menubar triggers and other controls keep their size in either scale and gain an invisible hit area 2.75 rem tall and wide; rows, navigation items and text fields grow to 2.75 rem instead.
