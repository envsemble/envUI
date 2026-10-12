# Tooltips

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

| Name     | Contract                                                                          |
| -------- | --------------------------------------------------------------------------------- |
| content  | Short supplementary text                                                          |
| children | One control; a disabled control is wrapped so it can still be hovered and focused |
| side     | top (default), bottom, left or right; flips to stay in the viewport               |
| delay    | Hover delay in milliseconds before opening, 400 by default; focus opens at once   |

## Guidelines

- Use tooltips for supplementary hints, such as the full name of an icon-only action or why a control is disabled. Never place the only copy of essential information in a tooltip.
- Tooltips open on hover and keyboard focus and close with <kbd>Esc</kbd>. Portals keep the originating theme.
- An icon-only control still needs its own accessible name; the tooltip repeats it visually.

TypeScript declarations provide the complete public API.

## Related topics

- [Buttons](../components/buttons.md)
- [Menus](../components/menu.md)
- [Accessibility](../foundations/accessibility.md)
