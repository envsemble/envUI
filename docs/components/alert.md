---
title: Alert
summary: An inline message about a page or a section, in an info, success, warning or danger tone, with an optional action and dismiss button.
status: stable
since: 0.5.0
category: Feedback & overlays
aliases:
  - Notice
  - banner
  - callout
  - inline message
  - inline notification
  - inline alert
  - message bar
  - info box
  - warning message
  - error message
useWhen:
  - A message about a page or a section stays until it no longer applies, such as a paused sync or a blocked release.
  - Something that just happened failed and the message should stay beside what it concerns, such as a save that didn't go through (`announce`).
  - A section needs a warning before people act in it, such as storage that is almost full.
avoidWhen:
  - text: Brief feedback after an action, such as Saved or Invitation sent.
    use: Toast
  - text: A region without content yet, such as an empty list or no search results.
    see: empty-states
  - text: An error about one field, shown on the field with its `error`.
    use: TextField
  - text: A status beside a label, such as Draft or Blocked.
    use: Badge
  - text: A decision people must make before going on.
    use: Dialog
components:
  - Alert
---

# Alert

## Overview

An alert is a message about a page or a section that stays above the content it concerns until it no longer applies.

```tsx example=BlockedRelease

```

### Announce a failure

`announce` reads a warning or danger alert at once, for one that appears because of something people just did. Info and success alerts are always read politely.

```tsx example=SaveFailed

```

## Variants

```tsx variants=Tones

```

1. **Info**
2. **Success**
3. **Warning**
4. **Danger**

| Tone      | Use for                                                               |
| --------- | --------------------------------------------------------------------- |
| `info`    | Something to know about the page, such as a paused sync. The default. |
| `success` | A result that stays relevant, where a toast would leave too soon.     |
| `warning` | A problem to come unless people act, such as storage almost full.     |
| `danger`  | Something that failed or stopped working.                             |

### Another icon, or none

`icon` replaces the tone's icon, and `icon={false}` leaves it out.

```tsx example=CustomIcon

```

## When to use

```tsx do=OneAlert caption="One alert per situation, with its next step."

```

```tsx dont=StackedAlerts caption="Several alerts about one situation."

```

- Remove an alert once it no longer applies.
- Offer `onDismiss` only where the message can safely be hidden.

## Anatomy

```tsx anatomy=AlertAnatomy

```

1. **Container** (`env-alert`)
2. **Icon** (`env-alert-icon`, `icon`)
3. **Title** (`env-alert-title`, `title`)
4. **Message** (`env-alert-message`, `children`)
5. **Action** (`env-alert-action`, `action`)
6. **Dismiss button** (`env-alert-dismiss`, `onDismiss`)

### Colors

`--env-alert-container`, `--env-alert-content`, `--env-alert-outline` and `--env-alert-icon` set the colors of one Alert, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors. [Customize colors](../customizing-colors.md) describes the roles.

## Accessibility

### Keyboard

| Key                                             | Action                                        |
| ----------------------------------------------- | --------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the action, then the dismiss button. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses the focused button.                   |

### envUI provides

- The `status` role on info and success alerts, and `alert` on warning and danger alerts with `announce`.
- An icon for each tone, hidden, beside text that carries the meaning.
- A dismiss button named by `dismissLabel`, in the provider's language.

### You provide

- A message that makes sense without its color and icon.
- `announce` only on an alert that appears because of something that just happened, never on one there when the page loads.
- Focus for after a dismissal, such as on the control the alert concerned.

## Changelog

- **1.0.0**: `tone="danger"` for `error`; the dismiss button is an IconButton with a cross, named Dismiss in the provider's language.
- **1.0.0**: `Notice` is `Alert`, with `AlertTone` and the `env-alert-*` classes; the page is `alert`.
- **0.5.0**: Notice, an inline banner in four tones with an action, a round dismiss button in its tone and `announce`.
