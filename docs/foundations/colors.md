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

| Name                    | Contract                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Theme theme             | Required: light or dark; scopes the tokens and provides the theme to React                                                                                   |
| Theme contrast          | `high`; `standard`, even when the system asks for more; or `system`, the default, which follows `prefers-contrast: more`; inherited from the enclosing Theme |
| Theme scale             | comfortable or compact, the app's [scale](../foundations/scale.md); inherited from the enclosing Theme                                                       |
| useTheme()              | `{ theme, contrast, scale }` of the nearest Theme, also across envUI's portals                                                                               |
| ThemePreferenceProvider | Stores the preference, follows the system and other windows, and themes the document root; see [setup](../setup.md)                                          |
| useThemePreference()    | `preference` (light, dark or system), the resolved `theme`, `setPreference` and `toggleTheme`                                                                |
| ThemeToggle             | An IconButton that switches between light and dark                                                                                                           |

### Status tones

Status icons, short status text and badges share these tokens, at least 4.5:1 on the page, surfaces and rows in both themes, and 7:1 at high contrast.

| Token                            | Meaning                                         |
| -------------------------------- | ----------------------------------------------- |
| `--env-color-fg-muted`           | No particular state, such as archived           |
| `--env-color-fg-accent`          | The current or highlighted state                |
| `--env-color-fg-success`         | Healthy or ready                                |
| `--env-color-fg-warning`         | Needs attention                                 |
| `--env-color-fg-danger`          | Failed or destructive                           |
| `--env-color-fg-done`            | Completed work                                  |
| `--env-color-bg-{tone}-muted`    | The tone's tint behind badges and alerts        |
| `--env-color-bg-{tone}-emphasis` | A solid fill in the tone, with `fg-on-emphasis` |

```css
.work-status[data-status='blocked'] {
  color: var(--env-color-fg-warning);
}
```

## Semantic tokens

Tokens are named `--env-color-{bg|fg|border}-{role}[-{emphasis}][-{state}]`, emphasis weakest first: `subtle`, `muted`, none, `emphasis` and `strong`. Every `fg-on-X` pairs with a `bg-X`, every state token has its resting token, and the contrast gate measures every pair a component paints, in all four themes.

- **Backgrounds:** `bg-page`; `bg-default`, `bg-muted` and `bg-raised`, the surfaces; `bg-popup`, `bg-field`, `bg-selected`; `bg-overlay`, the scrim behind dialogs.
- **Fills:** `bg-neutral-muted`, a translucent layer of the text color under secondary buttons, chips, switch tracks and skeletons; `bg-neutral-subtle`, the state layer of controls without a fill; `emphasis` and `strong` solid fills.
- **Text:** `fg-default`, `fg-muted` for supporting text and icons, `fg-control`, `fg-link`, `fg-on-selected`, and one per tone.
- **Borders:** `border-default`, the only boundary of a control, at least 3:1; `border-muted` for the hairlines between a list's items, quote bars and other decorative edges; `border-focus`; `border-media`, the inner edge of images.

The colors come from an internal palette of ten hues in grades from 0 to 100, where the grade difference alone sets the contrast: 50 grades apart give at least 4.5:1. The 0.7 names are gone; the [migration guide](../migration.md#tokens) lists what replaces each.

## States and contrast

- **Hover, focus and pressed** are state layers: the content color over the container at `--env-state-hover-opacity`, `--env-state-focus-opacity` and `--env-state-pressed-opacity`, as Material draws them. Solid fills, such as a primary button's, and the navigation's items keep designed hover and pressed tokens, other grades of the same hue, so labels keep their contrast in every state.
- **Selection** stays apart from every other item, at rest and under the pointer, and carries a second cue: its label color, a check or a bar.
- **High contrast** moves text to 7:1 and boundaries, indicators and focus rings to 4.5:1. A nested Theme and envUI's popups take the contrast and theme of where they open.
- **Elevation** 0–3 is an edge, not a shadow: envUI draws no shadows, so a floating layer separates by its background and its edge, and a modal by its scrim as well. Popups float at 2, dialogs, sheets and the command palette at 3.
- **Hairlines separate a list's items, never regions:** Markdown rules, menu separators, table rows and accordion items take a hairline across their container's full width, never inset from its edges. Regions, such as a top bar, a footer, a sticky header, a tab bar and two panes, separate by space and background instead; controls and floating layers keep their edges.
- **Forced colors** take system colors, such as `Highlight` and `GrayText`, for every state a fill carried.

## One element or one area

Each component has public color properties, such as `--env-button-container`, for colors of its own on one instance, and a nested Theme that overrides the semantic tokens recolors a whole area. [Customize colors](../customizing-colors.md) describes both.

## Guidelines

- Choose the role for what an element is, not the color it should have: `fg-muted` for any supporting text, `border-muted` for the line between a list's items. Separate regions by space or a background, not a line.
- Use one role in both themes; the themes give it its grade.
- Disabled controls take 0.48 opacity, which WCAG exempts from contrast.
- Wrap the application's own portal content in `<Theme {...useTheme()}>`, so it takes the theme and contrast of where it opens.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Button](../components/button.md)
- [Drawer](../components/drawer.md)
- [ColorPicker](../components/color-picker.md)
- [Accessibility](../foundations/accessibility.md)
- [Badge](../components/badge.md)
