# envsemble design system

Visual reference derived from Platform. Open `DesignSystemGallery.html` to browse buttons and their icon/action-group options, grouped rows, light and dark palettes, typography, spacing, and icons.

## Develop

Requires Node.js. No dependency installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:8765. Saving HTML, CSS, or assets automatically reloads the browser. Press Ctrl+C to stop.

## Build and share

```sh
npm run build
```

Send `dist/DesignSystemGallery.html` on its own. Recipients can double-click it and use it offline. The build embeds styles, font, icons, and licenses, with no development server code.

Edit the root HTML and the CSS/assets folders during development, then rebuild to update the shareable file. Platform remains the visual reference; changes here do not change the application.

## Design conventions

Define foundations first, then controls, then compositions. The button table includes action and navigation variants. Rows and cards reuse those button classes; navigation examples reuse the same control renderer.

- Separate sections and panes with spacing and background fills, without horizontal rules or container borders. Reserve outlines for relevant controls and keyboard focus.

- Use Platform as the visual source of truth.
- Use 1.75 rem for panes, cards, and all outer row corners, including single rows. Keep inner row corners at 0.5 rem. Everyday buttons and navigation use fully rounded ends. Only the purple emphasis button uses 0.5 rem corners, scaled for mobile.
- Document dimensions in relative units and use responsive layouts; never prescribe fixed pixel sizes.
- Mobile counterparts use a 1.25× visual scale.
- Use normal or medium text weights, never bold. Emphasize with size and contrast.
- Reserve purple for rare, important emphasis. Everyday primary actions use neutral colors.
- Keep documentation neutral and sentence case; reserve theme colors for specimens and palettes.
- Rows share a distinctive fill directly on the page background. On alternate backgrounds, invert the row and surface colors as needed to maintain contrast.

Inter is embedded in the HTML; its license is in `licenses/Inter-LICENSE.txt`. Material Symbols are Google assets distributed under Apache 2.0.

Colors are defined and displayed in HSL. The palette contains only base colors. Hover, pressed, focus, navigation tints, toast actions, and card strips are derived from those bases and the numeric rules in `styles/Tokens.css`. Typography is ordered by emphasis, with relative sizes and palette-linked colors.

Background panes group content with a faint gray in light mode and the raised surface fill in dark mode. Use 1.75 rem corners without a border; rows retain their distinct row fill.

## Deterministic color rules

Only base colors are authorable. `styles/Tokens.css` owns all state parameters; `styles/SharedComponents.css` applies them to real controls and table samples. The document reads its rule values from these tokens.

- HSL lightness shifts preserve hue/saturation: `Lstate = clamp(0, Lbase + delta, 100)`. Delta uses percentage points, not a percentage of L. Pressed uses 1.5 × the hover delta, always from the base.
- Hover profiles (light / dark): neutral primary +15 / −15; secondary/select fill −3 / +6; interactive text −8 / +8; neutral outline −25 / +25. Destructive −5 and purple −10 in both themes.
- Toast action L = parent toast L × (0.78 − 0.13 × state), where state is 0 default, 1 hover, 2 pressed. Hue/saturation and white labels stay unchanged. The dismiss control uses the default action fill on hover and pressed action fill on press.
- Selected navigation mixes blue with the alternate fill in sRGB: blue share = 13% + 7% × state. Quiet navigation uses the row fill on hover and the soft-fill lightness delta on press.
- Card strips mix 35% row fill with 65% alternate fill in sRGB. Loading highlight adds 4 lightness points in light and 8 in dark.
- Focus changes only the ring. Disabled controls never hover or press; filled buttons, selects, dismiss controls, and selected navigation use 48% opacity, while outlined controls and quiet navigation derive their disabled label from caption lightness (+8 points in light, −8 in dark).

Do not add literal colors to state selectors, per-color state swatches, or independent state overrides. For a new component, reuse an existing profile or explicitly document a new profile in the numeric rules. Derived CSS aliases are formulas, not additional palette entries. Relative HSL uses the browser’s CSS color engine and works in the offline build.

Primary buttons use the strong-text palette color as their fill and the canvas color for their label in both themes. Hover changes lightness by +15 in light mode and −15 in dark mode; pressed uses 1.5 times that change. Toast actions continue to derive from their own parent fill.

Circular icon buttons use a 2.5 rem circle and a centered 1.5 rem Material Symbols Rounded icon. Use the row fill and neutral control icon color, with no border. Their hover/pressed fills reuse the soft-fill HSL profile; focus and disabled states reuse the shared button rules. Include an accessible action name. The table uses a chevron as the example.

Dropdown selection uses a content-fit tonal trigger (row fill, pill corners, no border) and a pane containing grouped options: 1.75 rem outer corners, 0.5 rem inner corners, 0.125 rem row gap, and 0.5 rem pane inset. Options reuse circular-button soft-fill states; selected options reuse selected-navigation states. Both theme values stay synchronized. The native select remains the fallback and value source; the enhanced list supports arrow keys, Home/End, Enter/Space, typing an initial, Escape, and dismissal outside the menu.
