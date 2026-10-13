# Tabs

## React usage

```tsx
import { Tabs, Button, Text } from '@envsemble/envui';

<Tabs
  aria-label="Project views"
  defaultValue="summary"
  keepMounted
  items={[
    {
      value: 'summary',
      button: <Button>Summary</Button>,
      content: <Text>A shared space for project plans and notes.</Text>,
    },
    {
      value: 'details',
      button: <Button>Details</Button>,
      content: <Text>The project is ready for review.</Text>,
    },
    {
      value: 'activity',
      button: <Button>Activity</Button>,
      content: <Text>The draft was updated today.</Text>,
    },
  ]}
/>;
```

### Props & contracts

| Name                           | Contract                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| items                          | Unique string value, button element, content and optional disabled for each tab                         |
| aria-label                     | Required name for the tab list                                                                          |
| value / defaultValue           | Controlled or initial selection; defaults to the first enabled item                                     |
| onValueChange                  | Receives the selected string, or null when no selection remains                                         |
| activation                     | automatic (default) selects on focus; manual requires <kbd>Enter</kbd> or <kbd>Space</kbd>              |
| fill                           | The selected panel takes the height left below the list, for canvases                                   |
| orientation                    | horizontal (default) with <kbd>←</kbd> and <kbd>→</kbd>, or vertical with <kbd>↑</kbd> and <kbd>↓</kbd> |
| keepMounted                    | Preserve inactive content state; default false unmounts it after transition                             |
| listClassName / panelClassName | Optional layout classes for the list and panels                                                         |
| renderList                     | Wraps the supplied tab list in a custom layout; render the list once                                    |
| Native div props               | className, style, ref and accessible attributes on the root                                             |

## Guidelines

- Use tabs for related views in one place. Tabs owns selection, linked panels and keyboard behavior; your application owns any URL synchronization.
- Use renderList to place the tab list alongside a heading or other content inside a Card. Keep panels outside that wrapper and render the supplied list once.
- Supply Button, IconButton, NavigationItem without href, or a custom component that forwards native button props and ref. Do not nest another control inside a tab. Icon-only tabs need an accessible name.
- The rail uses the filled Surface tone, with 0.25 rem padding and gaps. The selected tab retains its supplied Button or NavigationItem colors, including hover and pressed shades. Inactive tabs have a transparent fill and muted labels at rest; enabled inactive tabs use the rail’s subtle Surface hover shade. Official icons fill automatically when selected.
- <kbd>←</kbd> and <kbd>→</kbd> move between enabled tabs, or <kbd>↑</kbd> and <kbd>↓</kbd> when vertical; <kbd>Home</kbd> and <kbd>End</kbd> reach the ends. Use manual activation for content that takes time to load. Disabled tabs are skipped.
- Selection and panels transition over 0.16 s with shared easing. Reduced motion removes transitions. Inactive panels are hidden and inert; keepMounted preserves their local state.

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation items](../components/navigation.md)
- [Buttons](../components/buttons.md)
- [Icons & assets](../foundations/icons.md)
- [Accessibility](../foundations/accessibility.md)
