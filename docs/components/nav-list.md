# Navigation lists

## React usage

```tsx
import { NavList } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Person } from '@envsemble/envui/icons/Person';

<NavList.Root aria-label="Main">
  <NavList.Item href="#/home" selected={page === 'home'} icon={<Home />}>
    Home
  </NavList.Item>
  <NavList.Item href="#/inbox" selected={page === 'inbox'} icon={<Inbox />}>
    Inbox
  </NavList.Item>
  <NavList.Group label="Settings">
    <NavList.Item href="#/profile" selected={page === 'profile'} icon={<Person />}>
      Profile
    </NavList.Item>
  </NavList.Group>
</NavList.Root>

// A single item, such as in AppShell's navigation.
<NavList.Item href="#/home" selected={page === 'home'}
  icon={<Home />}>
  Home
</NavList.Item>

// Inside AppShell, items follow the collapsed sidebar automatically.
// Elsewhere, set iconOnly yourself.
<NavList.Item href="#/home" selected={page === 'home'}
  icon={<Home />} iconOnly={collapsed} aria-label="Home">
  Home
</NavList.Item>
```

### Props & contracts

| Name                    | Contract                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| NavList.Root            | A plain list of items and groups; name it with aria-label when the page has several              |
| NavList.Group label     | A small heading that names the group's items; place groups inside NavList.Root                   |
| href                    | Renders a link through LinkProvider; omit for a button action                                    |
| selected / disabled     | Current destination and unavailable state                                                        |
| size                    | standard (default) or compact labels; both keep the navigation minimum height                    |
| iconOnly                | Hide the visible label and center the icon in a circular control; accepts sidebar collapse state |
| aria-label              | Required accessible destination name when iconOnly is enabled; icon is also required             |
| icon                    | Material Symbols fill automatically when selected; custom React icons are supported              |
| selectedIcon            | Optional selected variant for custom icons                                                       |
| trailing                | End content such as a CounterBadge; icon-only items show a small dot instead                     |
| children / native props | Destination label and link/button attributes                                                     |

## Guidelines

- NavList.Root is a plain list, not a landmark: place it in a nav element or a region that already is one, such as AppShell's sidebar. Items inside it and its groups render as list items, spaced like the sidebar navigation.
- The application owns routing and the selected destination. Use a meaningful destination label.
- Pass one Material Symbol. Navigation renders its filled variant when selected and its outline otherwise, including icons inside wrappers.
- Navigation labels, unselected icons and selected labels have independent color roles. Their defaults align with strong text, captions and link blue. Navigation fits its content with a 2.5 rem minimum height.
- Both label sizes use the shared 1 rem control icon size, matching labeled and icon-only buttons.
- Use iconOnly for a collapsed sidebar. Supply icon and aria-label; children can remain in place for the expanded label. The circle matches the navigation height and keeps selection, automatic icon fill, focus and disabled behavior. An icon-only item shows its label in a tooltip at its inline end on hover and keyboard focus, and a disabled one on hover, so it needs no Tooltip of its own; an application Tooltip around it replaces the label tooltip, so only one shows.
- Selection keeps the gray/blue styling. Hover and pressed preserve the base hue and saturation and use the central lightness rule.

TypeScript declarations provide the complete public API.

## Related topics

- [Tabs](../components/tabs.md)
- [Direction links](../components/direction-links.md)
- [Icons & assets](../foundations/icons.md)
- [Colors & themes](../foundations/colors.md)
- [Badges & counters](../components/badges.md)
