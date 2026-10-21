---
title: Notifications and feedback
summary: Tell people what happened, what state things are in and what needs them, in the place and at the volume each message deserves.
status: beta
since: 1.0.0
intent: Keep people informed
aliases:
  - notification
  - feedback
  - success message
  - status message
  - toast or alert
  - unread count
  - status badge
useWhen:
  - People need to know the outcome of something they did, or of work that ran in the background.
  - A page, a row or a destination has a state people should notice.
avoidWhen:
  - text: A value that is wrong in a form.
    see: forms
  - text: Content that is loading.
    see: loading
  - text: A region with nothing to show.
    see: empty-states
composes:
  - Toast
  - useToast
  - Alert
  - Badge
  - CounterBadge
  - Drawer
  - List
  - DescriptionList
  - RelativeTime
  - Button
  - Link
  - Select
  - TextField
  - Column
  - Row
  - Text
related:
  - loading
  - empty-states
  - destructive-actions
  - toast
  - alert
  - badge
---

# Notifications and feedback

## Overview

Use this pattern to choose where a message goes and how loudly it speaks. A message about a field belongs on the field, a condition of the page in an Alert on the page, the outcome of an action in a toast, and a state of a row or a destination in a Badge or a count beside it. Each is announced at most once, and only what needs people interrupts them.

```tsx example=SaveConfirmation

```

## Anatomy

Choose the surface by the message's scope, its urgency and whether people must act:

| Message                                              | Surface                                                                                 | Announced                         | Stays                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- | --------------------------- |
| A value in a field is wrong                          | The field's `error`                                                                     | With the field, when it has focus | Until the value is fixed    |
| A form was refused, or a save failed                 | An [Alert](../components/alert.md) `tone="danger"` at the top of the form, given focus  | Read as it takes focus            | Until the next submit       |
| A condition of the page, such as read-only           | An Alert on the page                                                                    | No: read with the page            | While the condition lasts   |
| Something just happened that interrupts, on the page | An Alert with `announce`, `tone="warning"` or `"danger"`                                | Yes, as an alert                  | Until resolved or dismissed |
| The outcome of an action people started              | A toast from [useToast](../components/toast.md), success or neutral                     | Politely                          | 5 seconds                   |
| The end of background work, with a next step         | A toast with an `action`, such as "Download"                                            | Politely                          | Until dismissed             |
| An action failed and the page can't show it          | A toast with `tone="danger"` and "Try again"                                            | At once, as an alert              | Until dismissed             |
| A decision people must make before going on          | A [Dialog](../components/dialog.md) or [ConfirmDialog](../components/confirm-dialog.md) | As it opens, with focus           | Until answered              |
| The state of a row or an object                      | A [Badge](../components/badge.md) beside its name                                       | No: read with the row             | While the state lasts       |
| New items behind a destination                       | A destination's `count` in a [Drawer](../components/drawer.md)                          | No: part of the item's name       | Until the items are seen    |

1. **Field errors:** on the field, as [Form layout and validation](forms.md) describes.
2. **Alert:** a title and one sentence, in its tone, with an `action` where there is one thing to do.
3. **Toast:** one short sentence, at most one action, shown from anywhere under one `Toast.Provider`.
4. **Badge:** a state in a word or two, in a tone that means the same everywhere.
5. **CounterBadge:** a count with an `aria-label` that says what it counts, such as beside a menu item; a destination of Bar, Rail or Drawer takes its `count` as a number instead.
6. **Status text:** a [Text](../foundations/typography.md) with `role="status"` for a quiet outcome beside its control, such as "Changes saved."

## States and behaviour

- **During the work.** The control that started it shows `pending`; nothing else announces it. See [Loading](loading.md).
- **After an action.** A success or neutral toast closes after 5 seconds; the timer pauses while the pointer rests on it or it has keyboard focus, and while the window is in the background. A danger toast, and a toast with an action, stays until it is dismissed.
- **Background work.** Say on the page that the work runs and that people can carry on. When it ends, a toast with the next step as its action reaches them wherever they are, and the page keeps the result too, since a toast can be dismissed.
- **Conditions of the page.** An Alert that is there when the page loads describes it, and isn't announced. When its condition changes, change or remove the Alert. An Alert that appears because something just happened and must interrupt takes `announce`.
- **Announce once.** One message per event: a toast or a status text, not both; a field error, not a toast too. Info and success Alerts are status messages, so changing their text is announced; don't also move focus to one, or it is read twice. An Alert that takes focus is a warning or danger one without `announce`, which has no role and is read once, with focus.
- **Several at once.** Each toast placement shows three at a time by default; older ones wait behind a count of hidden notifications. Danger toasts always show.
- **Not covered: a notification centre.** envUI has no list of past notifications yet. CounterBadge, [Popover](../components/popover.md) and [List](../components/list.md) are the parts to build one from.

## Content guidelines

- Follow [Feedback and status](../foundations/content.md#feedback-and-status): a toast is a short sentence naming what happened to what, in the past tense, "Invitation sent to jordan.kim@example.com.", or the state a change leaves where the past tense says too little; an Alert has a title and one sentence.
- For a failure, follow [Error messages](../foundations/content.md#error-messages): say what happened, whether work is safe, and what to do.
- Name a status in a word or two, the same word everywhere: "On track", "At risk", "Blocked", "Done".
- Label a count with what it counts, "12 unread", not the number alone.
- Don't start a message with "Success" or "Error"; the tone says it.

## Do and don't

### Do

- Put a message as close as possible to what it is about.
- Keep the button's `pending` state for the work, and the toast for how it ended.
- Offer the next step in a toast for work that ends while people are elsewhere.
- Use the same tone for the same status everywhere.

### Don't

- Don't show a toast for a field's error, or for a condition of the page.
- Don't put the only way to reach something in a toast.
- Don't announce a message that was there when the page loaded.
- Don't rely on color alone: every Badge and tone has its words.
- Don't ask for a decision in a toast; use a dialog.

## Accessibility

### Focus and keyboard

Feedback doesn't move focus, with two exceptions: after a refused form or a failed save, focus moves to the Alert that says what went wrong, and when a control people used goes away, focus moves to what replaced it, such as the message that confirms a request. Toasts never take focus: <kbd>F6</kbd> moves to them, Tab moves through their actions, <kbd>Esc</kbd> dismisses one, and leaving returns focus to where it was.

### envUI provides

- Toast regions with a polite status that reads each new notification without moving focus, danger notifications announced at once as alerts, and <kbd>F6</kbd> to reach them.
- Timers that pause on hover, on keyboard focus and in a background window; notifications with an action or a danger tone that stay.
- Alerts whose info and success tones are status messages, and whose warning and danger tones take the alert role only with `announce`; tone icons hidden from assistive technology.
- Badges whose label carries the meaning, with decorative icons hidden.
- A destination's count as part of its name, such as Inbox, 12 new, in Bar, Rail and Drawer.

### You provide

- One Toast.Provider at the application's root.
- A message that makes sense out of context, and dismissing a toast once its action has run.
- `announce` only on an Alert that appears because of something that just happened.
- An `aria-label` on every CounterBadge whose number alone doesn't say what it counts.
- Focus for when a control people used goes away.

## Examples

### A condition of the page

A read-only project says so in a warning Alert that stays while the condition lasts. It is read with the page, not announced, and it offers the one thing people can do. Once the request is sent, its button goes, so focus moves to the Alert, which reads its new text once: a warning Alert without `announce` has no role, so the change isn't announced as well.

```tsx example=SectionAlert

```

### Background work

The export runs while people carry on. When it ends, a toast with a "Download" action reaches them, and the page keeps a link to the file.

```tsx example=BackgroundTask

```

### Status in rows

Each project's status is a Badge in its row, in one tone per status, with its words carrying the meaning.

```tsx example=StatusInRows

```

### Unread counts

A CounterBadge on a navigation item says how many new items wait there; its label says what it counts.

```tsx example=UnreadCount

```
