---
title: Toast
summary: Brief feedback after an action, at the edge of the window.
status: stable
since: 1.0.0
category: Feedback
aliases:
  - snackbar
  - notification
  - flash message
  - toaster
  - ToastProvider
  - useToast
  - undo notification
useWhen:
  - Feedback after an action, such as Changes saved
  - An undo right after an action that took effect at once
  - An action that failed and can be tried again
  - Work that finished in the background, such as an export
avoidWhen:
  - text: A message about the page or a section that stays while the situation lasts, such as a plan's limit.
    use: Alert
  - text: A decision people make before anything happens, such as confirming a deletion.
    use: Dialog
  - text: A field's value that needs correcting.
    use: TextField
  - text: How much of a long task is done, such as an upload.
    use: Progress
  - text: Work that runs after a press, shown on the control that started it.
    use: Button
components:
  - ToastProvider
  - useToast
examples:
  SaveChanges:
    role: overview
    motion: true
  Tones: example
  TopCenter: example
  ToastAnatomy: anatomy
  UndoArchive: example
  RetryAfterError: example
  ExportReady: example
  OneForMany:
    role: do
    caption: One notification for an action on many items.
  OnePerItem:
    role: dont
    caption: 'A notification for each item: they stack up and hide each other.'
---

# Toast

## Variants

### Tones

| Tone    | Use for                                                |
| ------- | ------------------------------------------------------ |
| Neutral | Routine feedback, such as Files archived. The default. |
| Success | An action that worked, such as Invitation sent.        |
| Info    | Something worth noticing that needs no action.         |
| Danger  | An action that failed.                                 |

```tsx figure=Tones open

```

### Placements

Past a limit, older notifications wait behind a count, and danger notifications always show.

| Placement  | Use for                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| Bottom end | Most applications, at the bottom corner at the end of the line. The default. |
| Top center | An application whose bottom corner is taken.                                 |

```tsx figure=TopCenter motion

```

## Anatomy

```tsx figure=ToastAnatomy open

```

1. **Notification** (`env-toast`)
2. **Tone icon** (`env-toast-status-icon`, `tone`)
3. **Message** (`env-toast-message`, `message`)
4. **Action** (`env-toast-action`, `action`)
5. **Dismiss button** (`env-toast-dismiss`, `dismissible`)

Not shown: the count of hidden notifications.

## Behaviour

### Duration

Its timer pauses while the pointer rests on it or it has focus.

### Undo

A notification with an action stays until its action has run or people dismiss it.

```tsx figure=UndoArchive motion

```

### Retry

A danger notification stays until it is dismissed, and is announced at once.

```tsx figure=RetryAfterError motion

```

### Background work

A notification can stay until people dismiss it.

```tsx figure=ExportReady motion

```

## Rules

Keep what a notification offers reachable in the page too: it closes by itself.

```tsx figure=OneForMany open

```

```tsx figure=OnePerItem open

```

### Content

Label an action with a short verb, such as Undo or Try again, and give a notification one action at most.

## Accessibility

### Keyboard

| Key                                             | Action                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| <kbd>F6</kbd>                                   | Moves focus to the notifications, and pauses them.                        |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the notifications and their buttons, then back to the page. |
| <kbd>Esc</kbd>                                  | Dismisses the focused notification.                                       |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Runs the action, or dismisses with the dismiss button.                    |

### envUI provides

- A named region per placement, and a polite announcement of each notification.
- A danger notification as an `alert`, announced at once and never hidden behind the count.
- Timers that pause on hover, on focus and while the window is in the background.
- Fades only, under reduced motion.

### You provide

- One ToastProvider around the components that call `useToast`.
- A message that makes sense read on its own.
- `dismiss(id)` once an action has run.

## Compose

### Usage

Put one ToastProvider near the root of the application. Any component inside it calls `useToast()`, whose `show` shows a notification and returns its id, `dismiss(id)` dismisses one, and `clear()` dismisses them all. `show` takes the `message`, a short sentence that wraps to three lines, its `tone`, an `action`, a `placement`, `dismissible` and a `duration`.

```tsx source=SaveChanges

```

#### Tones

`tone` is `neutral`, the default, with no icon, `success`, `info` or `danger`. A danger notification stays until it is dismissed, is announced at once as an alert, and is never hidden behind the count.

A toast has no `warning` tone, unlike Alert: a warning needs attention where it applies, so it is an Alert on the page, not a notification that passes.

```tsx
toast.show({ tone: 'danger', message: 'Changes couldn’t be saved.' });
```

#### Actions and duration

`action` is one button, with its `label` and its `onClick`; the notification stays until it is dismissed, so call `dismiss` with the id `show` returned once the action has run.

- `duration` is how long it stays, in milliseconds: 5000 by default, or `Infinity` for danger notifications and those with an action.
- It counts only while the notification is visible, pauses on hover and keyboard focus, and starts again in full when it returns from behind the count.
- `Infinity` or `0` keeps it until it is dismissed, and a negative number throws a `RangeError`.
- `dismissible={false}` leaves out the dismiss button; it still closes after its duration, with <kbd>Esc</kbd> while focused and with `dismiss`.

```tsx
const id = toast.show({
  message: `${name} archived.`,
  action: {
    label: 'Undo',
    onClick: () => {
      restore(name);
      // The action doesn't close the notification by itself.
      toast.dismiss(id);
    },
  },
});
```

#### Placement and limit

ToastProvider's `defaultPlacement` is `bottom-end`, stacking upward from the bottom corner at the end of the line in the text direction, or `top-center`; `placement` on one notification overrides it. `limit`, 3 by default, is how many each placement shows at once.

```tsx
<ToastProvider defaultPlacement="top-center" limit={2}>
  <App />
</ToastProvider>
```

### Composition

The parts are each placement's region, `env-toast-viewport`, with `data-placement`; each notification, `env-toast`, with `data-tone`; its tone icon, `env-toast-status-icon`, its message, `env-toast-message`, its action, `env-toast-action`, and its dismiss button, `env-toast-dismiss`; the count of hidden notifications, `env-toast-queued-count`; and the announcements, `env-toast-announcer`. The region names, the hidden count and the dismiss button's name come from the provider's messages.

### Customize

A Toast draws an edge only at high contrast, unless its outline color sets one, and its container color takes the place of the tone's fill.

## Changelog

- **1.0.0-prerelease.5**: 16 px from its start edge to its icon or message, and 10 px between its parts.
- **1.0.0**: No edge outside high contrast, where the tone's edge bounds it, and an alert's corners, 1.25 rem. The notifications' theme boundary, `env-toast-portal-theme`, is `env-toast-theme`, as Popup's is `env-popup-theme`.
- **1.0.0**: `limit` for `visibleLimit`, as Base UI names it. `tone` for `variant`, with `danger` for `error`, and `ToastTone`; `bottom-end` for `bottom-right`, which follows the text direction, with the top-center stack centered in either direction; the region names, hidden count and dismiss button come from the provider's messages; danger notifications are alerts at once and always shown; the dismiss button is an IconButton with a cross; the manual `Toast` is gone.
- **1.0.0**: `ToastProvider` and `useToast` keep their names. The manual `Toast` component and `ToastProps` are no longer exported; show notifications with `useToast` inside `ToastProvider`.
