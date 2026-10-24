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
  - The outcome of an action, or of work in the background
  - A state people should notice, on a page, a row or a destination
avoidWhen:
  - text: A value that is wrong in a form.
    see: forms
  - text: Content that is loading.
    see: loading
  - text: A region with nothing to show.
    see: empty-states
  - text: Undo after a delete, or a confirmation before one.
    see: destructive-actions
composes:
  - Toast
  - useToast
  - Alert
  - Badge
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
---

# Notifications and feedback

## Overview

Each message is announced at most once, and only what calls for action interrupts. The outcome of an action people started is a [toast](../components/toast.md).

```tsx example=SaveConfirmation

```

### How long a toast stays

A success or neutral toast closes after 5 seconds, paused while the pointer rests on it, it has focus or the window is in the background. A danger toast, and one with an action, stays until dismissed. Three show at a time; danger toasts always show.

## Variants

| Message                                      | Surface                                                                      | Announced               |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| A value in a field is wrong                  | The field's error, as in [forms](forms.md)                                   | With the field          |
| A form was refused, or a save failed         | A danger [Alert](../components/alert.md) at the top of the form, given focus | As it takes focus       |
| A condition of the page                      | An Alert on the page                                                         | No: read with the page  |
| Something just happened that must interrupt  | An Alert that announces itself                                               | As an alert             |
| The outcome of an action people started      | A toast                                                                      | Politely                |
| An action failed, and the page can't show it | A danger toast with Try again                                                | At once                 |
| A decision people must make                  | A [ConfirmDialog](../components/confirm-dialog.md)                           | As it opens, with focus |
| The state of a row, or new items at a place  | A [Badge](../components/badge.md), or a count on a destination               | No: read with the row   |

### A condition of the page

An Alert that is there when the page loads describes it and offers the one thing people can do.

```tsx example=SectionAlert

```

### Background work

When the export ends, a toast with Download reaches people wherever they are, and the page keeps a link, since a toast can be dismissed.

```tsx example=BackgroundTask

```

### Status in rows

One tone per status, everywhere.

```tsx example=StatusInRows

```

### Unread counts

A destination's count is read with its name, such as Inbox, 12 new, and a count of none shows nothing.

```tsx example=UnreadCount

```

## When to use

```tsx do=StatusInWords caption="Each status in its own words, with the tone adding to them."

```

```tsx dont=StatusInColor caption="The same word in every tone: only the color tells them apart."

```

### One message per event

Put a message as close as it can be to what it is about, and say it once: a toast or a status text, not both, and a field's error without a toast too.

### Never only in a toast

A toast can be missed or dismissed, so never put the only way to reach something, or a decision, in one.

### A notification centre

envUI has no notification centre yet; build one from a count, a [Popover](../components/popover.md) and a [List](../components/list.md).

### Content

A toast names what happened to what, in the past tense. A failure says what happened, whether work is safe and what to do, as [content](../foundations/content.md) describes. A status is a word or two, the same everywhere, with no prefix: the tone says it.

- "Invitation sent to jordan.kim@example.com."
- "On track", "At risk", "Blocked", "Done"
- Never "Success" or "Error" before a status

## Accessibility

Feedback doesn't move focus, except to the Alert after a refused form or failed save, and to what replaces a control people used. Toasts never take focus: <kbd>F6</kbd> moves to them and <kbd>Esc</kbd> dismisses one.

### envUI provides

- Toast regions with a polite status, danger toasts announced at once, and <kbd>F6</kbd> to reach them.
- Info and success Alerts as status messages; warning and danger ones take the alert role only with `announce`.
- Badges whose words carry the meaning, and a destination's count in its name, such as Inbox, 12 new.

### You provide

- One Toast.Provider at the root, and messages that make sense out of context.
- `announce` only on an Alert that appears because something just happened.
- An `aria-label` on every count whose number alone doesn't say what it counts.

## In code

### Usage

`useToast()` returns `show`, `dismiss` and `clear`. `show({ tone, message, action })` shows a toast and returns its id; `tone` is `neutral`, `success`, `info` or `danger`. A success or neutral toast closes after its `duration`, 5 seconds by default; a danger toast, and one with an `action`, stays until dismissed unless `duration` is set. The provider's `visibleLimit`, 3 by default, sets how many show at a time. One Toast.Provider at the application's root holds the toasts.

```tsx source=SaveConfirmation

```

#### Background work

A toast with an `action`, such as `{ label: 'Download', onClick }`, stays until dismissed; call `toast.dismiss(id)` once it has run. Keep the result on the page too, such as a Link with `download`, and say the progress in a `role="status"` message.

```tsx source=BackgroundTask

```

#### Alerts

A field's error is its `error` prop, as on the forms page. An Alert on the page from the start takes a `tone` and an `action`, and no `announce`, so it is read with the page; `announce` gives a warning or danger Alert the alert role, for one that appears because something just happened. After a refused form or failed save, a danger Alert with `tabIndex={-1}` and a ref takes focus.

```tsx source=SectionAlert

```

#### Status and counts

A Badge's `tone` adds to its words, one tone per status everywhere, such as `success` for On track and `warning` for At risk. A Drawer or Rail destination's `count` shows its unread items and is said with its label; 0 shows nothing. A count Badge's `aria-label` says what it counts, such as "12 unread".

```tsx source=UnreadCount

```

### Composition

Status in rows is a List whose items take a Badge, with a RelativeTime in their description for when they changed; a page's details beside an Alert are a DescriptionList. envUI has no notification centre yet: compose one from a Badge with `count`, a Popover and a List.

```tsx source=StatusInRows

```

## Changelog

- **1.0.0**: The page is on the figure template.
