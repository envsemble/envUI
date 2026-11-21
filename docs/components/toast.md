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
avoidWhen:
  - text: A message about the page that stays while the situation lasts.
    use: Alert
  - text: A decision people make before anything happens, such as confirming a deletion.
    use: Dialog
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
---

# Toast

## Variants

### Tones

```tsx figure=Tones open

```

### Placements

```tsx figure=TopCenter motion

```

## Anatomy

```tsx figure=ToastAnatomy open width="21"

```

1. **Notification** (`env-toast`)
2. **Tone icon** (`env-toast-status-icon`, `tone`)
3. **Message** (`env-toast-message`, `message`)
4. **Action** (`env-toast-action`, `actions`)
5. **Dismiss button** (`env-toast-dismiss`, `dismissible`)

## Behaviour

### Undo

```tsx figure=UndoArchive motion

```

### Retry

```tsx figure=RetryAfterError motion

```

### Background work

```tsx figure=ExportReady motion

```

## Rules

```tsx figure=OneForMany open

```

## Accessibility

### Keyboard

| Key            | Action                                             |
| -------------- | -------------------------------------------------- |
| <kbd>F6</kbd>  | Moves focus to the notifications, and pauses them. |
| <kbd>Esc</kbd> | Dismisses the focused notification.                |
