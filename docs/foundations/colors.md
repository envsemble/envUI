---
aliases:
  - dark mode
  - dark theme
  - light mode
  - color scheme
  - high contrast
  - contrast
---

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
| Theme scale             | comfortable or compact, the app's [scale](../foundations/scale.md); inherited from the enclosing Theme when left out                                                                                                                         |
| useTheme()              | `{ theme, contrast, scale }` of the nearest Theme, including across library portals                                                                                                                                                          |
| ThemePreferenceProvider | Stores the preference, follows the system theme and other windows, and themes the document root; takes contrast as Theme does; see setup                                                                                                     |
| useThemePreference()    | preference (light, dark or system), resolved theme, setPreference and toggleTheme                                                                                                                                                            |
| ThemeToggle             | IconButton that switches between light and dark                                                                                                                                                                                              |

### Status tones

Status icons, short status text and badges share these tokens. Each keeps at least 4.5:1 contrast on the page, the default surface and rows in both themes, also over its tint, and 7:1 at high contrast.

| Token                           | 0.7 name             | Meaning                                             |
| ------------------------------- | -------------------- | --------------------------------------------------- |
| --env-color-fg-muted            | --color-tone-neutral | No particular state, such as archived               |
| --env-color-fg-accent           | --color-tone-accent  | The current or highlighted state, such as in review |
| --env-color-fg-success          | --color-tone-success | Healthy or ready                                    |
| --env-color-fg-warning          | --color-tone-warning | Needs attention, such as blocked                    |
| --env-color-fg-danger           | --color-tone-danger  | Failed or destructive                               |
| --env-color-fg-done             | --color-tone-done    | Completed work, in purple                           |
| --env-color-bg-{tone}-muted     | (computed)           | The tone's translucent tint behind badges or alerts |
| --env-color-border-{tone}-muted | (computed)           | The faint edge of an alert in the tone              |
| --env-color-border-{tone}       | (computed)           | The edge of an outlined badge in the tone           |
| --env-color-bg-{tone}-emphasis  | --color-tone-{tone}  | A solid fill in the tone, as on solid badges        |
| --env-color-fg-on-emphasis      | --color-on-tone      | Text and icons on a solid tone fill                 |

```css
.work-status[data-status='blocked'] {
  color: var(--env-color-fg-warning);
}
```

## Palette

The colors come from a primitive palette of ten hues: neutral (the slightly blue-tinted gray of text, borders and surfaces), blue (the brand: primary actions, links, the light selection, focus), slate (a low-chroma blue-gray: the dark selection and the light navigation hover), steel (information), green (success), teal (success toasts), amber (warning), red (danger), violet (done) and purple (the important action). The palette is internal: components and apps use the semantic tokens below.

- Every hue has the same grades, from 0 (white) to 100 (black): steps of 5, and finer steps where surfaces sit: 0–6 in steps of 2 and 6–15 in steps of 1 for the light theme's surfaces and their selection, hover and pressed fills, and 80–100 in steps of 2 for the dark theme's.
- A grade is a band of WCAG relative luminance shared by every hue, so contrast follows from the grade difference alone: 40 grades apart give at least 3:1, 50 at least 4.5:1 and 70 at least 7:1, for any two hues. Grade 50 has 4.58:1 against both white and black.
- Each hue keeps the hue and chroma of today's colors, its seeds; only the lightness is solved so that the color lands in its grade's band.
- `npm run palette:generate` writes the palette, and a test checks every guarantee over it.

## Semantic tokens

Semantic tokens are named `--env-color-{bg|fg|border}-{role}[-{emphasis}][-{state}]`. Every `fg-on-X` pairs with a `bg-X`, and the contrast gate measures every pair a component paints, in all four themes. The emphasis, weakest first: `subtle` (transparent at rest, a state layer under the pointer), `muted` (a translucent tint or edge), none (the role's own), `emphasis` (solid) and `strong` (solid, with white labels, or the dark edge of a strong fill). Every state token has its resting token: `bg-accent-subtle-hover` beside `bg-accent-subtle`.

- **Backgrounds:** `bg-page` behind everything; `bg-default`, `bg-muted` and `bg-raised`, the Surface backgrounds; `bg-popup` for menus, Select lists and popovers; `bg-field`; `bg-selected`, a blue tint in light and a blue-gray in dark; `bg-navigation-hover` and `-pressed` for navigation items; `bg-overlay`, the scrim behind dialogs, and `bg-overlay-muted`, the lighter one behind a drawer.
- **Fills in a role:** `bg-neutral-muted` is the translucent fill of secondary buttons, tab rails, chips, switch tracks, and with its hover step skeletons, a layer of the text color that keeps its tone on any surface, and `bg-neutral-subtle` is the state layer of controls without a fill; `bg-{tone}-subtle`, transparent, with `-hover` and `-pressed`, is that layer in a tone, as on an alert's dismiss button. `bg-inset` is a background that leans back toward the page inside a fill, as a diff stat's pill does on a tab. Solid fills come as `emphasis` (white labels in light, dark labels in dark, as on primary buttons, chosen radios, checked checkboxes and switches, sliders, meters and spinners) and `strong` (white in both themes: labels at 4.5:1 on destructive buttons, important buttons, toasts and tooltips; on the brand's strong fill, which envUI's own controls don't take, only marks, at 3:1).
- **Text:** `fg-default`; `fg-muted` for supporting text, icons, field labels, descriptions and placeholders; `fg-control` for navigation labels, secondary buttons and option labels; `fg-link`, and `fg-link-on-tint` for links on a tint, where `fg-link` falls below 4.5:1: alerts and list and table rows under the pointer point `fg-link` at it, and links on `bg-brand-muted` take it; `fg-accent`; `fg-on-selected`; and one per tone.
- **Borders:** `border-default` is the boundary of a control that has no other edge, such as an outlined field or the composer, at least 3:1 on every surface. `border-muted` is for dividers and other decorative edges. `border-accent-emphasis`, `border-danger-emphasis` and `border-focus` mark focused, invalid and keyboard-focused controls. A tone's edges grow from `border-{tone}-muted`, the faint edge of an alert (accent, success, warning and danger), through `border-{tone}`, the translucent edge of an outlined badge (neutral, accent, success, warning, danger and done), to the solid `border-accent-emphasis` and `border-danger-emphasis` of a focused or invalid field, and `border-{neutral|success|info|danger}-strong`, the edge of a strong fill. A tone has only the edges a component draws. `border-media` is the inner edge of content of any color, such as images and the color picker's area.

Component tokens name a color that no one role does: `--env-color-list-item-bg`, with `-hover` and `-pressed`, is the muted surface (the default one in light at high contrast), and `--env-color-avatar-bg`, `-fg` and `-figure` are the fixed blues of avatars. The 0.7 names, such as `--color-text-muted`, are gone: the [migration guide](../migration.md#tokens) lists what replaces each, and the codemod `v1-classes` rewrites them. Every token is a custom property with the `--env-` prefix.

## States, contrast and elevation

- **Hover and pressed** are tokens of their own (`--env-color-bg-brand-emphasis-hover`), other grades of the same hue chosen when the tokens are built, so labels keep their contrast on every state. Text and outlines gain contrast on hover; fills follow the direction they always had, as far as their labels allow: a destructive button lightens on hover and settles back halfway when pressed, since white labels need a darker red.
- **Selection** must not be mistaken for another item, at rest or under the pointer: the selection, and a selected item under the pointer, keep a distance of at least ΔEOK 0.03 from the other items and their hover fills, 0.04 at high contrast, and the label of a selected item differs as much from the others. Every hover and pressed fill differs from its own rest by at least one just-noticeable difference, ΔEOK 0.02. The contrast gate measures those distances too, beside the ratios. In light, a navigation item under the pointer takes a blue-gray deeper than the selection; at high contrast and in dark it takes a gray. A selection also carries a second cue: its label color, a check mark or a bar.
- **High contrast:** `contrast="high"` on a Theme moves text to 7:1 and every boundary, indicator and focus ring to 4.5:1, and so does the system's `prefers-contrast: more` while the contrast is `system`, the default. Dividers and popup edges become boundaries, fills get lighter layers, and checked controls take the emphasis fill. `contrast="standard"` keeps the standard colors even when the system asks for more contrast. A nested Theme and envUI's popups, such as menus, Select lists, tooltips and dialogs, take the contrast of the boundary they open from, as they take its color scheme: `<Theme theme="dark">` inside a high-contrast boundary is dark and high contrast. Theme writes `data-env-contrast`, `high` or `standard`, on its element, and none for `system`; style sheets can select it.
- **Elevation** 0–3 (`--env-elevation-{level}-border`) is an edge color. envUI draws no shadows: a floating layer separates by its fill and its edge, and a modal by its scrim as well. Menus, Select and Combobox lists, popovers, hover cards, the pickers, docked panels, tooltips and toasts float at level 2, and dialogs, sheets and the command palette at level 3; level 0 is flat. Levels 1–3 share one edge, clearly visible: about 2:1 against a popup and the page, and at least 1.6:1 against every surface a popup floats over, so a popup stands apart from a page or surface of its own color. In high contrast the edge is the 4.5:1 boundary, and under forced colors the boundary the system paints. Focus rings and selection bars drawn with `box-shadow` are rings, not shadows, and stay.
- **Forced colors:** where the system replaces the colors, as the system's contrast themes do, it paints no fills or shadows, so every state a fill carried takes system colors instead: a selected, chosen, current or highlighted item takes `Highlight` and `HighlightText`, a checked box or a switch that is on `Highlight`, today's calendar day an outline, an invalid field a dashed border, a focused field an outline, and an unavailable item `GrayText`. Colors that are content, such as swatches, the color picker's area and the days of a calendar heatmap, keep their own.
- **Tooltips and toasts** are strong fills, so their edge follows the fill rather than the page. The edge exists to separate a popup from a surface of its own color; around a dark tooltip or toast on a light page, the light popup edge would ring the fill like a halo. So in light each fill takes an edge of its own, `--env-color-border-{neutral|success|info|danger}-strong`: the fill a step darker, about 1.3:1 and ΔEOK 0.07 from it, which reads as the fill's own edge and still shows against a surface of the fill's color. High contrast keeps that step from its darker fills, far above 4.5:1 on the page. In dark the fills are lighter than the page, as every popup is, and take the popup edge of elevation 2, which is lighter still. Under forced colors the edge is the boundary the system paints, as on every popup.

## Guidelines

- Use the semantic role for what an element is, not for the color it should have: `fg-muted` for any supporting text, `border-default` for a control's only boundary, `border-muted` for a divider.
- Use the same role for a component in both themes; the themes give the role its grade. Component tokens may take another role per theme, as list rows do.
- Light theme mirrors dark: a white page, cool gray surfaces that grow grayer as they rise, and blue actions and selection. Dark theme uses dark gray surfaces that grow lighter as they rise, and a soft blue for actions and selection.
- Surfaces (page, default, muted, raised) are opaque. Fills drawn on them are translucent layers of the text color, so they keep their tone on the page and stay distinct on every other surface.
- Disabled controls use 0.48 opacity, which WCAG exempts from contrast; a choice control or a slider fades with its label.
- Focus rings are blue in both themes. A ring drawn inside a solid fill of its own color gains an inner ring in the label color.
- Scope content with Theme. Nested boundaries and library portals retain the originating theme and contrast. Application-owned portal content needs a Theme boundary too: `<Theme {...useTheme()}>` inside the portal takes both from where the portal opens.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Button](../components/button.md)
- [Drawer](../components/drawer.md)
- [ColorPicker](../components/color-picker.md)
- [Accessibility](../foundations/accessibility.md)
- [Badge](../components/badge.md)
