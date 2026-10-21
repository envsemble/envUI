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

Feedback goes as close as it can to what it is about, and speaks only as loudly as it must: each message is announced at most once, and only what needs people interrupts them. The outcome of an action people started is a toast from [useToast](../components/toast.md).

```tsx example=SaveConfirmation

```

### How long a toast stays

A success or neutral toast closes after 5 seconds, paused while the pointer rests on it, it has focus or the window is in the background. A danger toast, and one with an action, stays until dismissed. Three show at a time; danger toasts always show.

## Variants

| Message                                      | Surface                                                                      | Announced               |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| A value in a field is wrong                  | The field's `error`, as in [forms](forms.md)                                 | With the field          |
| A form was refused, or a save failed         | A danger [Alert](../components/alert.md) at the top of the form, given focus | As it takes focus       |
| A condition of the page                      | An Alert on the page                                                         | No: read with the page  |
| Something just happened that must interrupt  | An Alert with `announce`                                                     | As an alert             |
| The outcome of an action people started      | A toast                                                                      | Politely                |
| An action failed, and the page can't show it | A danger toast with Try again                                                | At once                 |
| A decision people must make                  | A [ConfirmDialog](../components/confirm-dialog.md)                           | As it opens, with focus |
| The state of a row, or new items at a place  | A [Badge](../components/badge.md), or a destination's `count`                | No: read with the row   |

### A condition of the page

An Alert that is there when the page loads describes it and isn't announced; it offers the one thing people can do.

```tsx example=SectionAlert

```

### Background work

When the export ends, a toast with Download reaches people wherever they are, and the page keeps a link, since a toast can be dismissed.

```tsx example=BackgroundTask

```

### Status in rows

One tone per status everywhere, with words that carry the meaning without the color.

```tsx example=StatusInRows

```

### Unread counts

A CounterBadge's `aria-label` says what it counts, "12 unread".

```tsx example=UnreadCount

```

## When to use

```tsx do=StatusInWords caption="Each status in its own words, with the tone adding to them."

```

```tsx dont=StatusInColor caption="The same word in every tone: only the color tells them apart."

```

- Put a message as close as it can be to what it is about.
- One message per event: a toast or a status text, not both; a field's error, not a toast too.
- Never put the only way to reach something, or a decision, in a toast.
- envUI has no notification centre yet; CounterBadge, [Popover](../components/popover.md) and [List](../components/list.md) are its parts.

### Content

- A toast names what happened to what, in the past tense: "Invitation sent to jordan.kim@example.com."
- A failure says what happened, whether work is safe and what to do ([error messages](../foundations/content.md#error-messages)).
- A status in a word or two, the same everywhere: "On track", "At risk", "Blocked", "Done". No "Success" or "Error" prefix; the tone says it.

## Accessibility

Feedback doesn't move focus, except to the Alert after a refused form or failed save, and to what replaces a control people used. Toasts never take focus: <kbd>F6</kbd> moves to them and <kbd>Esc</kbd> dismisses one.

### envUI provides

- Toast regions with a polite status, danger toasts announced at once, and <kbd>F6</kbd> to reach them.
- Info and success Alerts as status messages; warning and danger ones take the alert role only with `announce`.
- Badges whose words carry the meaning, and a destination's count in its name, such as Inbox, 12 new.

### You provide

- One Toast.Provider at the root, and messages that make sense out of context.
- `announce` only on an Alert that appears because something just happened.
- An `aria-label` on every CounterBadge whose number alone doesn't say what it counts.

## Changelog

- **1.0.0**: The page is on the figure template.
