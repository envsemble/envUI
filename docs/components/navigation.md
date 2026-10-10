# Navigation items

## React usage

```tsx
import { NavigationItem } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';

<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />}>
  Home
</NavigationItem>

// Keep the same item when the sidebar is collapsed or expanded.
<NavigationItem href="#/home" selected={page === 'home'}
  icon={<Home />} iconOnly={collapsed} aria-label="Home">
  Home
</NavigationItem>
```

### Props & contracts

| Name                    | Contract                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| href                    | Renders a link; omit for a button action                                                         |
| selected / disabled     | Current destination and unavailable state                                                        |
| size                    | standard (default) or compact labels; both keep the navigation minimum height                    |
| iconOnly                | Hide the visible label and center the icon in a circular control; accepts sidebar collapse state |
| aria-label              | Required accessible destination name when iconOnly is enabled; icon is also required             |
| icon                    | Material Symbols fill automatically when selected; custom React icons are supported              |
| selectedIcon            | Optional selected variant for custom icons                                                       |
| children / native props | Destination label and link/button attributes                                                     |

## Guidelines

- The application owns routing and the selected destination. Use a meaningful destination label.
- Pass one Material Symbol. Navigation renders its filled variant when selected and its outline otherwise, including icons inside wrappers.
- Navigation labels, unselected icons and selected labels have independent color roles. Their defaults align with strong text, captions and link blue. Navigation fits its content with a 2.5 rem minimum height.
- Both label sizes use the shared 1 rem control icon size, matching labeled and icon-only buttons.
- Use iconOnly for a collapsed sidebar. Supply icon and aria-label; children can remain in place for the expanded label. The circle matches the navigation height and keeps selection, automatic icon fill, focus and disabled behavior.
- Selection keeps the gray/blue styling. Hover and pressed preserve the base hue and saturation and use the central lightness rule.

TypeScript declarations provide the complete public API.

## Related topics

- [Tabs](../components/tabs.md)
- [Direction links](../components/direction-links.md)
- [Icons & assets](../foundations/icons.md)
- [Colors & themes](../foundations/colors.md)
