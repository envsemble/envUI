---
title: Popover
summary: A floating panel for details or a small form beside its trigger.
status: beta
since: 0.5.0
category: Feedback & overlays
aliases:
  - popup
  - flyout
  - overlay
related:
  - tooltip
  - hover-card
  - menu
  - dialog
components:
  - Popover
---

# Popover

## React usage

```tsx
import { Button, Popover, Stack, Text, TextField } from '@envsemble/envui';

<Popover title="Roadmap.md" trigger={<Button variant="secondary">Details</Button>}>
  <Text tone="muted">Changed today by Alex. 3 open decisions, 1 blocked.</Text>
</Popover>

<Popover aria-label="Rename document" width="wide"
  trigger={<Button variant="secondary">Rename</Button>}>
  {(close) => (
    <form onSubmit={(event) => { event.preventDefault(); rename(event.currentTarget); close(); }}>
      <Stack gap={3}>
        <TextField label="Name" name="name" defaultValue={name} />
        <Button type="submit">Rename</Button>
      </Stack>
    </form>
  )}
</Popover>
```

### Props & contracts

| Name                              | Contract                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------- |
| trigger                           | The opening control; it receives aria-expanded and the ref                    |
| title / aria-label                | A heading that names the popover, or an accessible name without one           |
| children                          | Content, or a function that receives close for actions inside                 |
| side / align                      | Placement relative to the trigger; bottom and center by default; flips to fit |
| open / defaultOpen / onOpenChange | Controlled or uncontrolled visibility                                         |
| width                             | standard (default, about 20 rem) or wide (about 28 rem)                       |
| className                         | Extra class on the panel                                                      |

## Guidelines

- Use a popover for details or a small form beside the control that opened it. Use Tooltip for a short hint, Menu for a list of actions and Dialog for a task that needs the whole window.
- <kbd>Esc</kbd> and a press outside close the popover and return focus to the trigger. Focus moves into the popover when it opens; <kbd>Tab</kbd> moves through its content.
- The panel uses the raised popup colors with a hairline border and the menu's corners, and keeps the originating theme in its portal.
- Close the popover from inside with the close function once its action completes.

TypeScript declarations provide the complete public API.

## Related topics

- [Tooltip](../components/tooltip.md)
- [HoverCard](../components/hover-card.md)
- [Menu](../components/menu.md)
- [Dialog](../components/dialog.md)
