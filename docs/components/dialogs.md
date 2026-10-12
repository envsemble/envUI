# Dialogs

## React usage

```tsx
import { Dialog, Button, Text } from '@envsemble/envui';

<Dialog trigger={<Button variant="secondary">View project</Button>}
  title="Sample project" description="Project details" closeLabel="Close">
  <Text>Shared plans, milestones and responsibilities for the project.</Text>
</Dialog>

<Dialog trigger={<Button variant="secondary">Inspect project</Button>}
  title="Project details" placement="right" modal={false} disablePointerDismissal>
  <Text>Shared plans and people for the sample project.</Text>
</Dialog>
```

### Props & contracts

| Name                              | Contract                                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| trigger / title / description     | Launch control and accessible modal labeling                                                                                       |
| children / actions                | General content and shared controls                                                                                                |
| closeLabel                        | Built-in dismissal label; defaults to Close                                                                                        |
| placement                         | center (default), top or right; top opens near the top of the window, right is a full-height side panel with a header close button |
| size                              | standard (default, about 28 rem) or wide (about 44 rem) for content-heavy centered and top dialogs                                 |
| modal                             | true (default) traps focus, blocks outside interaction and locks page scroll; false permits interaction with the page              |
| disablePointerDismissal           | false by default; true keeps an inspector open on outside presses or focus changes                                                 |
| open / defaultOpen / onOpenChange | Controlled or uncontrolled visibility                                                                                              |
| DialogClose                       | Additional dismissal action; shared button props                                                                                   |
| initialFocus / finalFocus         | Optional focus refs                                                                                                                |
| pending                           | Work is in progress: Escape, outside presses and the built-in close button cannot dismiss the dialog                               |

## Guidelines

- Use a centered modal for a focused confirmation or short form. Use a right panel to inspect content; set modal=false when its source page should remain interactive.
- Use placement top for search-like dialogs, so results can grow downward without moving the field, and size wide for tables, comparisons and longer forms. For quick open, use CommandPalette.
- Centered dialogs include a footer dismissal; right panels include a header close button. Escape closes either placement and focus returns to the trigger or finalFocus ref.
- Modal dialogs trap focus; non-modal panels do not. Portals preserve the originating theme.
- The application owns validation, saving, async work and whether completion closes the dialog.
- While async work is pending, set pending so the dialog cannot be dismissed, and set pending on the action that started it. Restore focus to the intended trigger or finalFocus target.
- Compose forms in a dialog from envUI's fields: floating-label inputs with their validation messages, Select with its label above, and RadioGroup rows for a choice. The catalogue's dialogs page shows a form, a choice and a typed confirmation.

TypeScript declarations provide the complete public API.

## Related topics

- [Toasts](../components/toasts.md)
- [Command palette](../components/command-palette.md)
- [Text fields](../components/fields.md)
- [Stacks & action groups](../components/layout.md)
- [Accessibility](../foundations/accessibility.md)
