---
title: Toast
summary: Brief feedback after an action, such as Changes saved, at the edge of the window, announced and dismissed after a few seconds or by people.
status: beta
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
related:
  - alert
  - dialog
  - button
  - progress
  - accessibility
components:
  - Toast
  - useToast
---

# Toast

## Overview

A toast is a brief notification at the edge of the window: feedback after an action, such as Changes saved, an undo, or a failure people can try again. It appears at once, is announced, and closes after five seconds unless it is an error or has an action.

Put one **Toast.Provider** near the root of the application. Any component inside it calls **useToast** for `show`, `dismiss` and `clear`; `show` takes the notification's `message`, `variant`, `action`, `placement`, `dismissible` and `duration`, and returns its id.

```tsx example=SaveChanges

```

## Anatomy

1. **Region**: one per placement, fixed 1 rem from the window's edges and clear of the safe areas, such as a phone's notch. Notifications stack 0.5 rem apart; a stack taller than the window scrolls inside its region.
2. **Notification**: at least 3 rem tall, with 0.5 rem corners and 0.5 and 0.75 rem padding, in the variant's strong fill with light text. It fits its content, up to 28 rem.
3. **Status icon** (success, info and error): a 1.125 rem check, info or warning icon before the message.
4. **Message** (`message`): 0.875 rem text, up to 24 rem wide and three lines. A longer message is cut off; its full text stays in its title and its announcement.
5. **Action** (optional, `action`): a primary Button with the action's `label`.
6. **Dismiss button** (unless `dismissible` is false): a round 2.5 rem icon button, named Dismiss notification, that shows its fill on hover and press.
7. **Hidden count**: a CounterBadge, such as +2, for the notifications beyond `visibleLimit`, above the stack at the bottom right and below it, centred, at the top center.

## Variants and sizes

| Variant   | Use for                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `neutral` | Routine feedback without a status, such as Files archived. It has no icon.                                                   |
| `success` | An action that worked, such as Invitation sent.                                                                              |
| `info`    | Something worth noticing that needs no action, such as a new version or a finished export.                                   |
| `error`   | An action that failed, such as a save that didn't reach the server. It stays until it is dismissed and is announced at once. |

- **Placements**: `bottom-right` (default) suits most feedback; notifications stack upward from the bottom corner at the end of the line, the newest at the bottom. `top-center` suits applications whose bottom corner is taken, such as by a composer or docked panels; notifications stack downward from the top, the newest at the top. `defaultPlacement` on Toast.Provider sets the placement, and a notification's `placement` overrides it. Each placement has its own region, stack and limit.
- **Limit**: `visibleLimit` (3) is the number of notifications each placement shows at once, a positive integer.
- **Size**: a notification is at least 3 rem tall and fits its content up to 28 rem, or the window's width less the region's insets. On touch screens its dismiss button is 2.75 rem.

## States and behaviour

- **Showing**: `show` adds the notification at once, at the bottom of the bottom-right stack or the top of the top-center stack, and the others glide to their new place. It fades in and, without a reduced-motion preference, arrives from its edge; with one, it only fades and the others move at once.
- **Duration**: neutral, success and info notifications without an action close after 5 seconds. Errors and notifications with an action stay until they are dismissed. `duration` sets the milliseconds instead, and `Infinity` or `0` keeps a notification until it is dismissed.
- **Pausing**: the time counts only while a notification is visible. Hovering it or focusing it with the keyboard pauses that notification; focusing the region with <kbd>F6</kbd> pauses every notification in it; leaving the window or hiding the page pauses them all.
- **Limit**: past `visibleLimit`, the newest notifications stay visible and older ones wait behind the hidden count. They come back as newer ones close, each with its full duration again, and fade in.
- **Dismissing**: the dismiss button, <kbd>Esc</kbd> in a notification, swiping it down or to the right by touch or with the mouse, `dismiss(id)` and `clear()` close notifications. A closing notification steps out of the stack at once and fades where it was, so the others move once.
- **Actions**: pressing an action runs its `onClick`, and the notification stays. Dismiss it there with the id `show` returned once the action has run, as an undo does.
- **Theme**: the regions render in a portal at the end of the document, in the theme of the place the provider is rendered.
- **Language**: the regions' names, the dismiss button's name and the hidden count are in English.

## Content guidelines

- Say what happened, with what it happened to, in a short sentence: "Invitation sent to Sam Lee." "Northwind launch archived."
- For an error, say what failed and what people can do: "Changes couldn't be saved. Check your connection and try again."
- Label an action with a short verb for what it does, such as Undo, Try again or View. One action at most.
- Keep the message to a sentence or two; it shows at most three lines.
- Don't start with "Success" or "Error"; the variant's color and icon say so.

## Do and don't

### Do

- Put one Toast.Provider near the root of the application, and show notifications from anywhere inside it.
- Show a notification for the result of an action people started, and keep the feedback on the control while the work runs, with its `pending` state.
- Offer Undo for an action that takes effect at once, and dismiss the notification when it runs.
- Show one notification for an action on many items, such as "4 invitations sent".

### Don't

- Don't ask for a decision in a toast; use [Dialog](../components/dialog.md).
- Don't use a toast for a message about the page that lasts, such as a plan's limit; use [Alert](../components/alert.md).
- Don't put the only way to reach something in a notification that closes by itself; keep it in the page too.
- Don't show a toast for a field's error; show it on the field with `error`.

## Accessibility

### Keyboard

| Key                                                        | Action                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>F6</kbd>                                              | Moves focus to a region that shows notifications, the bottom-right one first; pressed again while both placements show notifications, to the other. Its notifications pause while focus is in the region.                                                                                      |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>            | In a region, moves focus through its notifications, newest first, and their action and dismiss buttons. Tab past the last one, or Shift+Tab on the region, returns focus to where it was before <kbd>F6</kbd>. Without <kbd>F6</kbd>, Tab reaches the notifications after the end of the page. |
| <kbd>Esc</kbd>                                             | With focus in a notification, dismisses it. Focus moves to the next notification, or back to where it was before <kbd>F6</kbd>.                                                                                                                                                                |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the action         | Runs the action; the notification stays until it is dismissed.                                                                                                                                                                                                                                 |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the dismiss button | Dismisses the notification. Focus moves to the next notification, or back to where it was before <kbd>F6</kbd>.                                                                                                                                                                                |

### envUI provides

- A region for each placement, named Bottom right notifications and Top center notifications, that announces new notifications politely (`aria-live="polite"`) without moving focus.
- Errors announced at once through a visually hidden alert, which keeps their message while focus is outside the region.
- Each notification as a non-modal `dialog`, an `alertdialog` for errors, named by its message.
- The hidden count as a status, such as "2 older notifications hidden".
- <kbd>F6</kbd> to reach the notifications, and focus that moves to the next notification as one closes and returns to where it was as people leave.
- Time to read and act: timers that pause on hover, keyboard focus and while the window is in the background, and notifications with an action or an error that stay until they are dismissed.
- A dismiss button named Dismiss notification, with a focus ring in the notification's text color, and text at least 4.5:1 on every fill.
- Fades only, with a reduced-motion preference.

### You provide

- One Toast.Provider around the components that call `useToast`.
- A message that makes sense on its own, read out of context.
- Dismissing a notification once its action has run, with `dismiss(id)`.
- Another way to reach what a notification offers, such as the archived project in its list, since notifications close.
- A `duration` long enough to read the message, or none, for a notification people need to act on.

## Examples

### Variants

Each variant has its fill and icon. The error stays until it is dismissed; the others close after five seconds.

```tsx example=Variants

```

### Undo an action

Archiving takes effect at once, and the notification offers Undo. The action restores the project and dismisses the notification with the id `show` returned.

```tsx example=UndoArchive

```

### Try again after an error

The first attempt fails. The error stays until it is dismissed, and Try again dismisses it and publishes again.

```tsx example=RetryAfterError

```

### Work that finished elsewhere

`duration: Infinity` keeps a notification until people dismiss it, for work that ends while they may be looking elsewhere.

```tsx example=ExportReady

```

### Top center and a limit

`defaultPlacement="top-center"` stacks notifications downward from the top. With `visibleLimit={2}`, a third reminder hides the oldest behind a count until a newer one closes.

```tsx example=TopCenter

```

## Changelog

- **1.0.0**: `ToastProvider` is `Toast.Provider`, and `useToast` keeps its name. The manual `Toast` component and `ToastProps` are no longer exported; show notifications with `useToast` inside `Toast.Provider`.
- **0.5.0**: The hidden count is a counter badge. A dismissed notification steps out of the stack at once and fades where it was, and one revealed from the hidden ones fades in. The regions no longer throw where the Web Animations API is missing, such as in jsdom.
- **0.4.0**: Notifications glide to their new place as others arrive and leave; the top-center hidden count sits below the stack, centred. The dismiss button settles when pressed.
- **0.3.0**: Notifications arrive from their screen edge.
- **0.2.0**: Messages wrap to three lines within 28 rem instead of truncating to one line.
- **0.1.0**: `ToastProvider` and `useToast`, with the bottom-right and top-center placements, a visible limit with a count of older notifications, durations and timers that pause; the manual `Toast`.
