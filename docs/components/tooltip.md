# Tooltip

## React usage

```tsx
import { Tooltip, IconButton, Button } from '@envsemble/envui';
import { Refresh } from '@envsemble/envui/icons/Refresh';

<Tooltip content="Refresh seats and members">
  <IconButton icon={<Refresh />} aria-label="Refresh seats and members" onClick={refresh} />
</Tooltip>

<Tooltip content="All seats are assigned">
  <Button disabled>Assign seat</Button>
</Tooltip>
```

### Props & contracts

| Name     | Contract                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| content  | Short supplementary text                                                                                                           |
| children | One control; a disabled control is wrapped so it can still be hovered and focused                                                  |
| side     | top (default), bottom, left, right, or inline-start and inline-end, which follow the text direction; flips to stay in the viewport |
| delay    | Hover delay in milliseconds before opening, 400 by default; focus opens at once                                                    |

## Guidelines

- A tooltip stays open while the pointer moves from its control onto it, so people can read or magnify it, and <kbd>Esc</kbd> closes it.
- Use tooltips for supplementary hints, such as the full name of an icon-only action or why a control is disabled. Never place the only copy of essential information in a tooltip.
- Tooltips open on hover and keyboard focus and close with <kbd>Esc</kbd>. Portals keep the originating theme. A control that becomes enabled or disabled keeps its tooltip, such as a back button once there is somewhere to go.
- An icon-only control still needs its own accessible name; the tooltip repeats it visually.

TypeScript declarations provide the complete public API.

## Related topics

- [Button](../components/button.md)
- [Menu](../components/menu.md)
- [Accessibility](../foundations/accessibility.md)
