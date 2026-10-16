# Colors & themes

## React usage

```tsx
import { Theme, Text, useTheme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

function ThemeLabel() {
  const { theme, contrast } = useTheme();
  return (
    <Text>
      Current theme: {theme}, {contrast} contrast
    </Text>
  );
}

<Theme theme="dark" contrast="high">
  <ThemeLabel />
</Theme>;
```

### Props & contracts

| Name                    | Contract                                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme theme             | Required: light or dark; scopes tokens and provides React theme context                                                                                                                                                                      |
| Theme contrast          | high for the high-contrast colors, standard to keep the standard ones even when the system asks for more contrast, system (the default outside any Theme) to follow prefers-contrast: more; inherited from the enclosing Theme when left out |
| Theme native props      | children, ref, className, style and native div attributes                                                                                                                                                                                    |
| useTheme()              | `{ theme, contrast }` of the nearest Theme, including across library portals                                                                                                                                                                 |
| ThemePreferenceProvider | Stores the preference, follows the system theme and other windows, and themes the document root; takes contrast as Theme does; see setup                                                                                                     |
| useThemePreference()    | preference (light, dark or system), resolved theme, setPreference and toggleTheme                                                                                                                                                            |
| ThemeToggle             | IconButton that switches between light and dark                                                                                                                                                                                              |

### Status tones

Status icons, short status text and badges share these tokens. Each keeps at least 4.5:1 contrast on the page, the default surface and rows in both themes, also over its tint, and 7:1 at high contrast.

| Token                      | 0.7 name             | Meaning                                             |
| -------------------------- | -------------------- | --------------------------------------------------- |
| --color-fg-muted           | --color-tone-neutral | No particular state, such as archived               |
| --color-fg-accent          | --color-tone-accent  | The current or highlighted state, such as in review |
| --color-fg-success         | --color-tone-success | Healthy or ready                                    |
| --color-fg-warning         | --color-tone-warning | Needs attention, such as blocked                    |
| --color-fg-danger          | --color-tone-danger  | Failed or destructive                               |
| --color-fg-done            | --color-tone-done    | Completed work, in purple                           |
| --color-bg-{tone}-muted    | (computed)           | The tone's translucent tint behind badges or alerts |
| --color-bg-{tone}-emphasis | --color-tone-{tone}  | A solid fill in the tone, as on solid badges        |
| --color-fg-on-emphasis     | --color-on-tone      | Text and icons on a solid tone fill                 |

```css
.work-status[data-status='blocked'] {
  color: var(--color-fg-warning);
}
```

## Palette

The colors come from a primitive palette of eight hues: neutral (the slightly blue-tinted gray of text, borders and surfaces), blue (the brand: primary actions, links, selection, focus), steel (information), green (success), amber (warning), red (danger), violet (done) and purple (the important action). The palette is internal: components and apps use the semantic tokens below.

- Every hue has the same grades, from 0 (white) to 100 (black): steps of 5, and steps of 2 where surfaces sit, 0–10 for the light theme and 80–100 for the dark one.
- A grade is a band of WCAG relative luminance shared by every hue, so contrast follows from the grade difference alone: 40 grades apart give at least 3:1, 50 at least 4.5:1 and 70 at least 7:1, for any two hues. Grade 50 has 4.58:1 against both white and black.
- Each hue keeps the hue and chroma of today's colors, its seeds; only the lightness is solved so that the color lands in its grade's band.
- `npm run palette:generate` writes the palette, and a test checks every guarantee over it.

## Semantic tokens

Semantic tokens are named `--color-{bg|fg|border}-{role}-{emphasis}[-{state}]`. Every `fg-on-X` pairs with a `bg-X`, and the contrast gate measures every pair a component paints, in all four themes.

- **Backgrounds:** `bg-page` behind everything; `bg-default`, `bg-muted` and `bg-raised`, the Surface backgrounds; `bg-popup` for menus, Select lists and popovers; `bg-field`; `bg-selected`; `bg-overlay`, the scrim behind dialogs.
- **Fills in a role:** `bg-neutral-muted` is the translucent fill of secondary buttons, tab rails, chips, switch tracks and skeletons, a layer of the text color that keeps its tone on any surface, and `bg-neutral-subtle` is the state layer of controls without a fill. Solid fills come as `emphasis` (white labels in light, dark labels in dark, as on primary buttons) and `strong` (white labels in both themes, as on destructive buttons, checked checkboxes and toasts).
- **Text:** `fg-default`; `fg-muted` for supporting text, icons, field labels, descriptions and placeholders; `fg-control` for navigation labels, secondary buttons and option labels; `fg-link`; `fg-accent`; `fg-on-selected`; and one per tone.
- **Borders:** `border-default` is the boundary of a control that has no other edge, such as an outlined field, at least 3:1 on every surface. `border-muted` is for dividers and other decorative edges. `border-accent`, `border-danger` and `border-focus` mark focused, invalid and keyboard-focused controls.

The 0.7 names, such as `--color-text-muted`, are aliases of these roles until the components move to the semantic names; component tokens such as `--color-checkbox` alias the role a component takes in each theme.

## States, contrast and elevation

- **Hover and pressed** are tokens of their own (`--color-bg-brand-emphasis-hover`), other grades of the same hue chosen when the tokens are built, so labels keep their contrast on every state. Text and outlines gain contrast on hover; fills follow the direction they always had.
- **High contrast:** `contrast="high"` on a Theme moves text to 7:1 and every boundary, indicator and focus ring to 4.5:1, and so does the system's `prefers-contrast: more` while the contrast is `system`, the default. Dividers and popup edges become boundaries, fills get lighter layers, and checked controls take the emphasis fill. `contrast="standard"` keeps the standard colors even when the system asks for more contrast. A nested Theme and envUI's popups, such as menus, Select lists, tooltips and dialogs, take the contrast of the boundary they open from, as they take its color scheme: `<Theme theme="dark">` inside a high-contrast boundary is dark and high contrast. Theme writes `data-env-contrast`, `high` or `standard`, on its element, and none for `system`; style sheets can select it.
- **Elevation** 0–3 (`--elevation-{level}-shadow`, `--elevation-{level}-border`) is a shadow and an edge color, after Material 3's levels. Menus, Select lists and popovers take level 2, so they separate from a page or surface of their own color.

## Guidelines

- Use the semantic role for what an element is, not for the color it should have: `fg-muted` for any supporting text, `border-default` for a control's only boundary, `border-muted` for a divider.
- Use the same role for a component in both themes; the themes give the role its grade. Component tokens may take another role per theme, as list rows do.
- Light theme uses a white page, cool pale surfaces, soft gray rows and blue actions and selection. Dark theme uses dark gray surfaces that grow lighter as they rise, and a soft blue for actions and selection.
- Surfaces (page, default, muted, raised) are opaque. Fills drawn on them are translucent layers of the text color, so they keep their tone on the page and stay distinct on every other surface.
- Disabled controls use 0.48 opacity, which WCAG exempts from contrast.
- Focus rings are blue in both themes. A ring drawn inside a solid fill of its own color gains an inner ring in the label color.
- Scope content with Theme. Nested boundaries and library portals retain the originating theme and contrast. Application-owned portal content needs a Theme boundary too: `<Theme {...useTheme()}>` inside the portal takes both from where the portal opens.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Button](../components/button.md)
- [NavList](../components/nav-list.md)
- [ColorPicker](../components/color-picker.md)
- [Accessibility](../foundations/accessibility.md)
- [Badge](../components/badge.md)
