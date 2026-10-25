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

## Variants

### A condition of the page

An Alert that is there when the page loads describes it and offers the one thing people can do.

```tsx example=SectionAlert

```

### Background work

When the export ends, a toast with Download reaches people wherever they are, and the page keeps a link to the file too.

```tsx example=BackgroundTask

```

### Status in rows

One tone per status, everywhere.

```tsx example=StatusInRows

```

## When to use

### Which to use

Put each message where it belongs, at the volume it deserves.

| Message              | Use for                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| A field's error      | A value in a field that is wrong, as [forms](forms.md) show it.                     |
| An Alert on the page | A condition of the page, read with the page.                                        |
| An announced Alert   | Something that just happened and must interrupt.                                    |
| A toast              | The outcome of an action people started, announced politely.                        |
| A danger toast       | An action that failed where the page can't show it, with Try again.                 |
| A confirmation       | A decision people must make, in a [ConfirmDialog](../components/confirm-dialog.md). |
| A badge              | The state of a row, read with the row, in a [Badge](../components/badge.md).        |

```tsx do=StatusInWords caption="Each status in its own words, with the tone adding to them."

```

```tsx dont=StatusInColor caption="The same word in every tone: only the color tells them apart."

```

### One message per event

Put a message as close as it can be to what it is about, and say it once: a toast or a status text, not both, and a field's error without a toast too.

### Content

A toast names what happened to what, in the past tense, "Website refresh archived.", or the state a setting leaves, with one action at most. An Alert's title is the condition, and its one sentence says what to do. A failure says what happened, whether work is safe and what to do, "Couldn't load projects. Try again.", never an error code alone. A status is a word or two, the same everywhere, with no prefix such as Success or Error: the tone says it.

- "Invitation sent to jordan.kim@example.com."
- "On track", "At risk", "Blocked", "Done"

## Accessibility

Feedback doesn't move focus, except to the Alert after a refused form or a failed save, and to what replaces a control people used.

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

A toast with an `action`, such as `{ label: 'Download', onClick }`, stays until dismissed; call `toast.dismiss(id)` once it has run. Keep the result on the page too, such as a Link with `download`, since a toast can be dismissed, and say the progress in a `role="status"` message.

```tsx source=BackgroundTask

```

#### Alerts

A field's error is its `error` prop, as on the forms page. An Alert on the page from the start takes a `tone` and an `action`, and no `announce`, so it is read with the page; `announce` gives a warning or danger Alert the alert role, for one that appears because something just happened. After a refused form or failed save, a danger Alert with `tabIndex={-1}` and a ref takes focus.

```tsx source=SectionAlert

```

#### Status and counts

A Badge's `tone` adds to its words, one tone per status everywhere, such as `success` for On track and `warning` for At risk. A Drawer or Rail destination's `count` shows its unread items and is said with its label; 0 shows nothing. A count Badge's `aria-label` says what it counts, such as "12 unread".

### Composition

Status in rows is a List whose items take a Badge, with a RelativeTime in their description for when they changed; a page's details beside an Alert are a DescriptionList. A notification centre is a Badge with `count` on its trigger, a Popover and a List of the notifications.

```tsx source=StatusInRows

```

## Changelog

- **1.0.0**: The page is on the figure template, with the feedback and status wording of the content guidelines.
