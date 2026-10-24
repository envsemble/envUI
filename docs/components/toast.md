---
title: Toast
summary: Brief feedback after an action, such as Changes saved, at the edge of the window, announced and dismissed after a few seconds or by people.
status: stable
since: 0.1.0
category: Feedback & overlays
aliases:
  - snackbar
  - notification
  - flash message
  - toaster
  - ToastProvider
  - Toast.Provider
  - useToast
  - undo notification
useWhen:
  - Feedback after an action people started, such as Changes saved or Invitation sent.
  - An undo right after an action that took effect at once, such as archiving a project.
  - An action that failed and can be tried again, such as a save that didn't reach the server.
  - Work that finished in the background, such as an export becoming ready.
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
  - Toast
  - useToast
---

# Toast

## Overview

A toast is brief feedback after an action, at the edge of the window. Put one **Toast.Provider** near the root of the application; any component inside it calls **useToast** to `show` a notification.

```tsx example=SaveChanges

```

### Undo an action

A notification with an action stays until it is dismissed. Dismiss it with the id `show` returned once the action has run.

```tsx example=UndoArchive

```

### Try again after an error

A danger notification stays until it is dismissed, and is announced at once.

```tsx example=RetryAfterError

```

### Work that finished elsewhere

`duration: Infinity` keeps a notification until people dismiss it.

```tsx example=ExportReady

```

## Variants

```tsx example=Tones

```

| Tone      | Use for                                                |
| --------- | ------------------------------------------------------ |
| `neutral` | Routine feedback, such as Files archived. The default. |
| `success` | An action that worked, such as Invitation sent.        |
| `info`    | Something worth noticing that needs no action.         |
| `danger`  | An action that failed. It stays until it is dismissed. |

### Top center and a limit

`top-center` suits an application whose bottom corner is taken. `visibleLimit` hides older notifications behind a count.

```tsx example=TopCenter

```

## When to use

```tsx do=OneForMany open caption="One notification for an action on many items."

```

```tsx dont=OnePerItem open caption="A notification for each item: they stack up and hide each other."

```

- Keep what a notification offers reachable in the page too: it closes by itself.

### Content

- Label an action with a short verb, such as Undo or Try again; one action at most.

## Anatomy

```tsx anatomy=ToastAnatomy open

```

1. **Notification** (`env-toast`)
2. **Tone icon** (`env-toast-status-icon`, `tone`)
3. **Message** (`env-toast-message`, `message`)
4. **Action** (`env-toast-action`, `action`)
5. **Dismiss button** (`env-toast-dismiss`, `dismissible`)

Not shown: the count of hidden notifications, `env-toast-queued-count`.

### Colors

`--env-toast-container`, `--env-toast-content` and `--env-toast-outline` set the colors of one Toast, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

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

- One Toast.Provider around the components that call `useToast`.
- A message that makes sense read on its own.
- `dismiss(id)` once an action has run.

## Changelog

- **1.0.0**: `tone` for `variant`, with `danger` for `error`, and `ToastTone`; `bottom-end` for `bottom-right`, which follows the text direction, with the top-center stack centred in either direction; the region names, hidden count and dismiss button come from the provider's messages; danger notifications are alerts at once and always shown; the dismiss button is an IconButton with a cross; the manual `Toast` is gone.
- **1.0.0**: `ToastProvider` is `Toast.Provider`, and `useToast` keeps its name. The manual `Toast` component and `ToastProps` are no longer exported; show notifications with `useToast` inside `Toast.Provider`.
- **0.5.0**: The hidden count is a counter badge. A dismissed notification steps out of the stack at once and fades where it was, and one revealed from the hidden ones fades in. The regions no longer throw where the Web Animations API is missing, such as in jsdom.
- **0.4.0**: Notifications glide to their new place as others arrive and leave; the top-center hidden count sits below the stack, centred. The dismiss button settles when pressed.
- **0.3.0**: Notifications arrive from their screen edge.
- **0.2.0**: Messages wrap to three lines within 28 rem instead of truncating to one line.
- **0.1.0**: `ToastProvider` and `useToast`, with the bottom-right and top-center placements, a visible limit with a count of older notifications, durations and timers that pause; the manual `Toast`.
