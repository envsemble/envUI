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

| Name               | Contract                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| Theme theme        | Required: light or dark; scopes tokens and provides React theme context |
| Theme native props | children, ref, className, style and native div attributes               |
| useTheme()         | Returns the current theme, including across library portals             |
| Theme preference   | The application owns selection, persistence and system preference       |

## Guidelines

- Use separate semantic color roles for distinct primitive purposes, such as surfaces, rows, buttons, fields, navigation and feedback. Composed components reuse their underlying primitives’ colors. Derive hover and pressed states from each primitive’s base centrally.
- Light theme uses colors sampled from Chrome Web Store and Google Ads: a white page canvas, cool pale panes, soft gray cards and rows, white direction links, and blue actions and selection.
- Use the same semantic color role for a component in both themes. Change the theme palette values rather than switching which role the component uses.
- Below 50% HSL lightness, add lightness; otherwise subtract it. Controls shift 10 points on hover and 20 on press; cards and selectable rows use gentler 2-point hover and 4-point pressed shifts. Results clamp to 0–100%. Disabled opacity is 0.48.
- Each role keeps the same purpose across themes. Its hue, saturation and lightness can differ between palettes. Focus has its own role, with blue defaults in both themes.
- Tabs reuse the supplied Button or NavigationItem colors, and their rail uses Surface. Cards, dialog shells and menus reuse Surface tones. IconButton and inline Link reuse Button variants; Select shares secondary Button and field colors.
- Navigation selection, radio selection and selected Select options have separate roles. Card action strips, dialog backdrops, field validation and toast fills also have their own purposes; composed action buttons retain Button colors.
- Scope content with Theme. Nested boundaries and library portals retain the originating theme. Application-owned portal content needs an appropriate Theme boundary too.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Buttons](../components/buttons.md)
- [Navigation items](../components/navigation.md)
- [Color picker](../components/color-picker.md)
- [Accessibility](../foundations/accessibility.md)
