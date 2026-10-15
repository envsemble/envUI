# Colors & themes

## React usage

```tsx
import { Theme, Text, useTheme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

function ThemeLabel() {
  const theme = useTheme();
  return <Text>Current theme: {theme}</Text>;
}

<Theme theme="dark">
  <ThemeLabel />
</Theme>;
```

### Props & contracts

| Name                    | Contract                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Theme theme             | Required: light or dark; scopes tokens and provides React theme context                                    |
| Theme native props      | children, ref, className, style and native div attributes                                                  |
| useTheme()              | Returns the current theme, including across library portals                                                |
| ThemePreferenceProvider | Stores the preference, follows the system theme and other windows, and themes the document root; see setup |
| useThemePreference()    | preference (light, dark or system), resolved theme, setPreference and toggleTheme                          |
| ThemeToggle             | IconButton that switches between light and dark                                                            |

### Status tones

Status icons, short status text and badges share these tokens. Each keeps at least 4.5:1 contrast on the canvas, panes and rows in both themes, also over a badge’s subtle fill.

| Token                | Meaning                                             |
| -------------------- | --------------------------------------------------- |
| --color-tone-neutral | No particular state, such as archived               |
| --color-tone-accent  | The current or highlighted state, such as in review |
| --color-tone-success | Healthy or ready                                    |
| --color-tone-warning | Needs attention, such as blocked                    |
| --color-tone-danger  | Failed or destructive                               |
| --color-tone-done    | Completed work, in purple                           |
| --color-on-tone      | Text and icons on a solid tone fill                 |

```css
.work-status[data-status='blocked'] {
  color: var(--color-tone-warning);
}
```

## Guidelines

- Use separate semantic color roles for distinct primitive purposes, such as surfaces, rows, buttons, fields, navigation and feedback. Composed components reuse their underlying primitives’ colors. Derive hover and pressed states from each primitive’s base centrally.
- Light theme uses a white page canvas, cool pale panes, soft gray cards and rows, white direction links, and blue actions and selection.
- Use the same semantic color role for a component in both themes. Change the theme palette values rather than switching which role the component uses.
- Below 50% HSL lightness, add lightness; otherwise subtract it. Controls shift 10 points on hover and 20 on press; cards and selectable rows use gentler 6-point hover and 10-point pressed shifts. Results clamp to 0–100%. Disabled opacity is 0.48.
- Surfaces (canvas, panes, rows and cards) are opaque. Fills drawn on them are translucent layers of the text color, so they keep their tone on the canvas and stay distinct on every other surface:
  - Secondary buttons, tab rails, chips, switch tracks, meter tracks and skeletons use `--color-fill`: 6% in light and 12.5% in dark, with 17% and 29% (25% and 37.5% in dark) for hover and press.
  - Controls without a fill, such as inactive tabs and the avatar button, show `--color-state-layer-hover` (8%) and `--color-state-layer-pressed` (12%) layers.
- Each role keeps the same purpose across themes. Its hue, saturation and lightness can differ between palettes. Focus has its own role, with blue defaults in both themes.
- Tabs reuse the supplied Button or NavigationItem colors, and their rail uses Surface. Cards, dialog shells and standard menus reuse Surface tones; compact menus take the raised popup colors, like Popover and Select. IconButton and inline Link reuse Button variants; Select shares secondary Button and field colors.
- Navigation selection, radio selection, selected Select options and the chosen and current days of a calendar have separate roles. Card action strips, dialog backdrops, field validation and toast fills also have their own purposes; composed action buttons retain Button colors.
- Scope content with Theme. Nested boundaries and library portals retain the originating theme. Application-owned portal content needs an appropriate Theme boundary too.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Buttons](../components/buttons.md)
- [Navigation items](../components/navigation.md)
- [Color picker](../components/color-picker.md)
- [Accessibility](../foundations/accessibility.md)
- [Badges & counters](../components/badges.md)
