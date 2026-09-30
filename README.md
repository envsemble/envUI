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

Colors are defined and displayed in HSL. The palette includes base colors, button-label colors, and derived interaction fills. Typography is ordered by emphasis, with relative sizes and palette-linked colors.

Background panes group content with a faint gray in light mode and the raised surface fill in dark mode. Use 1.75 rem corners without a border; rows retain their distinct row fill.
