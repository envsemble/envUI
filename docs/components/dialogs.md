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

| Name                              | Contract                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| trigger / title / description     | Launch control and accessible modal labeling                                                                          |
| children / actions                | General content and shared controls                                                                                   |
| closeLabel                        | Built-in dismissal label; defaults to Close                                                                           |
| placement                         | center (default) or right; right is a full-height side panel with a header close button                               |
| modal                             | true (default) traps focus, blocks outside interaction and locks page scroll; false permits interaction with the page |
| disablePointerDismissal           | false by default; true keeps an inspector open on outside presses or focus changes                                    |
| open / defaultOpen / onOpenChange | Controlled or uncontrolled visibility                                                                                 |
| DialogClose                       | Additional dismissal action; shared button props                                                                      |
| initialFocus / finalFocus         | Optional focus refs                                                                                                   |

## Guidelines

- Use a centered modal for a focused confirmation or short form. Use a right panel to inspect content; set modal=false when its source page should remain interactive.
- Centered dialogs include a footer dismissal; right panels include a header close button. Escape closes either placement and focus returns to the trigger or finalFocus ref.
- Modal dialogs trap focus; non-modal panels do not. Portals preserve the originating theme.
- The application owns validation, saving, async work and whether completion closes the dialog.
- While async work is pending, preserve the application's dismissal rules through controlled open/onOpenChange and disabled actions. Restore focus to the intended trigger or finalFocus target.

TypeScript declarations provide the complete public API.

## Related topics

- [Toasts](../components/toasts.md)
- [Text fields](../components/fields.md)
- [Stacks & action groups](../components/layout.md)
- [Accessibility](../foundations/accessibility.md)
