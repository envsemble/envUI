# envsemble design system

A visual reference derived from Platform. The catalogue defines foundations, reusable controls, and compositions in both themes.

## Develop

Requires Node.js; no dependency installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:8765. Saving HTML, CSS, JavaScript, or assets reloads the browser. Press Ctrl+C to stop.

## Build and share

```sh
npm run build
```

Send `dist/DesignSystemGallery.html` on its own. Styles, component behaviors, font, icons, and licenses are embedded; recipients can open it offline.

## Component ownership

| Source | Responsibility |
| --- | --- |
| `styles/Tokens.css` | Base palette, typography, spacing, corner tokens, and deterministic state formulas |
| `styles/SharedComponents.css` | Buttons, navigation, icons, chips, disclosure notes, and toasts |
| `components/FormControls.css` | Fields, checkbox, radio, switch, dropdown and selectable options |
| `components/Rows.css` | Grouped rows and alternate-background composition |
| `components/ContentStates.css` | Dialogs, empty states, and loading placeholders |
| `components/FeatureCard.css`, `components/ActionCard.css` | Card compositions |
| `components/Controls.js` | Dropdown, dialog, toast, and paired-input behaviors |
| `scripts/Gallery.js` | Catalogue rendering, theme comparison, reference values, and sidebar state |
| `styles/Gallery.css` | Document layout and specimen spacing |

Component styles own their geometry and states; they do not depend on Gallery.css. Consumers need Tokens.css and SharedComponents.css plus the relevant component stylesheet. Call `initializeDropdowns(container)`, `initializeDialogs(container)`, or `initializeToasts(container)` for the corresponding markup. Dropdowns retain native selects as their value source; dialogs use native modal focus and Escape behavior. `initializePairedInputs(container)` is the catalogue comparison helper.

## Rules

- Platform is the visual reference. Catalogue changes do not modify the application.
- Use relative units, regular or medium typography, palette colors, and the shared spacing scale.
- Row, card, and pane outer corners use the shared outer-radius token. Exceptions are documented under Spacing & shape and beside their components.
- Purple is rare emphasis. Everyday primary actions are neutral.
- Palette entries are base colors only. Every control uses one color-based HSL rule in both themes: if default lightness is below 50%, add the central hover/pressed shifts below the threshold; otherwise subtract them. The threshold, direction, and shift magnitudes are defined only in Tokens.css; the catalogue reads their values dynamically. Calculate both states directly from the default color. At exactly 50%, subtract. Preserve hue and saturation and clamp to 0–100%. Focus adds a ring; disabled controls use shared opacity. Never author independent state colors.
- Strong control blue is shared by switches and checkboxes. Radios, links, and navigation use theme-specific link blue.
- Keep labels and required instructions visible. Optional guidance uses the shared disclosure note.
- Examples use the same components and spacing rules as applications. Light and dark values are synchronized; their section alignment is based on the actual section count.

The HTML catalogue is the reference for dimensions and usage; numeric color behavior is read from the tokens. Avoid copying those values into another documentation source.

Dialog actions demonstrate dismissal; they do not save or delete data. Native radio geometry and unchecked rings remain browser-controlled, as in Platform; checked accent colors use the shared default, hover, and pressed tokens. Text-field fills also follow the shared interaction rule. Checkboxes use native semantics with an authored mark; partial selection is set through the input's `indeterminate` property.

Inter and Material Symbols Rounded assets are embedded with their licenses from `licenses/`. No drop shadows, pane outlines, or additional theme colors are introduced by the catalogue.
