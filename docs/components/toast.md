---
title: Toast
summary: Managed feedback with configurable duration, placement and stack capacity.
status: beta
since: 0.1.0
category: Feedback & overlays
aliases:
  - snackbar
  - notification
  - ToastProvider
  - flash message
related:
  - dialog
  - button
  - colors
  - accessibility
components:
  - Toast
  - useToast
---

# Toast

## Managed notifications

```tsx
import { Theme, Button, ActionGroup, Toast, useToast } from '@envsemble/envui';

function NotificationButtons() {
  const toast = useToast();
  return (
    <ActionGroup>
      <Button
        onClick={() =>
          toast.show({
            variant: 'success',
            message: 'Changes saved.',
            duration: 3000,
          })
        }
      >
        Show timed toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.show({
            variant: 'info',
            message: 'Export is ready.',
            duration: Infinity,
          })
        }
      >
        Show persistent toast
      </Button>
    </ActionGroup>
  );
}

<Theme theme="light">
  <Toast.Provider defaultPlacement="bottom-right" visibleLimit={2}>
    <NotificationButtons />
  </Toast.Provider>
</Theme>;
```

### Props & contracts

| Name                             | Contract                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| defaultPlacement                 | bottom-right stacks upward; top-center stacks downward                                                                    |
| visibleLimit                     | Positive integer, default 3 per placement; newest notices stay visible, with an older-notice count beyond the stack       |
| useToast().show(options)         | Returns the notification ID; accepts variant and message                                                                  |
| options.placement                | Override the provider’s default for a particular notification                                                             |
| options.action                   | {label, onClick}; notices with actions persist unless duration is set                                                     |
| options.dismissible              | true by default; adds a close button                                                                                      |
| options.duration                 | Visible milliseconds; restarts after overflow. Infinity or 0 persists. Defaults to 5000, or persistent for errors/actions |
| useToast().dismiss(id) / clear() | Dismiss one notification or clear all notifications                                                                       |

## Guidelines

- By default, neutral, success and info notices without actions expire after five seconds. Errors and notices with actions persist. Set duration in milliseconds to override either default, or Infinity to keep a notice until dismissed.
- New notices appear immediately at the bottom of the bottom-right stack or the top of the top-center stack. Set visibleLimit to cap each placement; older notices hide behind a CounterBadge beyond the stack (above it at the bottom right, below it and centered at the top center) and reappear as newer notices close.
- When notices arrive or leave, the others glide to their new place. A leaving notice steps out of the stack at once and fades where it was, so the stack moves once and never scrolls on the way; a notice revealed from the hidden ones fades in. With reduced motion the others move at once.
- A notice gets its full duration each time it returns from overflow. Hover or keyboard focus pauses only that notice; focusing the viewport with <kbd>F6</kbd> or leaving the window pauses its visible timers. A persistent notice does not pause other notices.
- Keep messages and actions short. Messages wrap to three lines; the full text stays in the title and the announcement.

TypeScript declarations provide the complete public API.

## Related topics

- [Dialog](../components/dialog.md)
- [Button](../components/button.md)
- [Colors & themes](../foundations/colors.md)
- [Accessibility](../foundations/accessibility.md)
