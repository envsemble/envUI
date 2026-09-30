# envsemble design system

Visual reference derived from Platform. Open `DesignSystemGallery.html` to browse components, grouped rows, light and dark palettes, typography, spacing, and icons.

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

- Separate sections and panes with spacing and background fills, without horizontal rules or container borders. Reserve outlines for relevant controls and keyboard focus.

- Use Platform as the visual source of truth.
- Mobile counterparts use a 1.25× visual scale.
- Use normal or medium text weights, never bold. Emphasize with size and contrast.
- Keep documentation neutral and sentence case; reserve theme colors for specimens and palettes.
- Rows share a distinctive fill directly on the page background. Avatar dropdowns explicitly invert this relationship.

Inter is embedded in the HTML; its license is in `licenses/Inter-LICENSE.txt`. Material Symbols are Google assets distributed under Apache 2.0.
