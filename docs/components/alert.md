---
title: Alert
summary: An inline message about a page or a section, in an info, success, warning or error tone, with an optional action and dismiss button.
status: beta
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
    use: EmptyState
  - text: An error about one field of a form.
    use: TextField
  - text: A status beside a label, such as Draft or Blocked.
    use: Badge
  - text: A decision people must make before going on.
    use: Dialog
related:
  - toast
  - empty-state
  - badge
  - dialog
  - colors
components:
  - Alert
---

# Alert

## Overview

An alert is a message about a page or a section that stays in place, above the content it concerns, until it no longer applies. Its tone sets the tint, the border and the icon; the text stays in the primary text color, so the message reads the same in every tone. An alert can hold an action for the next step and a dismiss button, and it chooses its live role by tone: info and success alerts are polite status messages, and warnings and errors interrupt only with `announce`.

```tsx example=BlockedRelease

```

## Anatomy

1. **Container**: the tone's light tint with a hairline border in the tone, 1 rem corners and 1 rem padding. The ref and other `div` props reach it.
2. **Icon** (`icon`): the tone's icon in the tone color, 1.25 rem, beside the first line. `icon` replaces it, and `false` leaves it out.
3. **Title** (optional, `title`): a short heading in medium weight, 1 rem.
4. **Message** (optional, `children`): the body text, 0.9375 rem, 0.25 rem below the title.
5. **Action** (optional, `action`): a row below the message, 0.75 rem from it, that wraps its controls with 0.5 rem between them.
6. **Dismiss button** (with `onDismiss`): a 2 rem circle at the end of the first line, with a close icon in the tone color.

## Variants and sizes

| Tone      | Use for                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| `info`    | Something people should know about the page or section, such as a paused sync or planned maintenance. The default.  |
| `success` | A result that stays relevant, such as a plan that was shared, where a toast would leave too soon.                   |
| `warning` | Something that will cause a problem unless people act, such as storage that is almost full or a blocked release.    |
| `error`   | Something that failed or stopped working, such as a save that didn't go through or a service that isn't responding. |

- An alert fills the width of its container, and its text wraps, also within a long word or an address.
- The icon, the content and the dismiss button sit in three columns 0.75 rem apart; the content takes the room the other two leave.
- On touch screens the dismiss button grows to 2.75 rem.

## States and behaviour

- **Live role**: info and success alerts have the `status` role, a polite live region, whether `announce` is set or not. Warning and error alerts have no live role by default, since an alert that is there when the page loads should not interrupt; with `announce` they take the `alert` role and are announced at once.
- **Dismissing**: with `onDismiss`, a dismiss button named `dismissLabel` (Dismiss) shows; a press calls `onDismiss`, and the application removes the alert. The button's name also shows as its native tooltip. On hover and press its circle takes a tint of the tone.
- **Actions**: `action` holds any controls, such as a Button or a Link, and keeps their own states.

<!-- specimen: ToneMatrix -->

## Content guidelines

- Put the problem or the fact in the title, in a few words and sentence case, without a full stop: "Sync paused", "Storage almost full".
- Use the message for what it means and what people can do, in one or two sentences: "Uploads stop once the space runs out."
- Name an action after the next step: "Review blockers", "Upgrade storage". Offer one action, or two at most.
- Make the message clear without its color or icon; "Couldn’t save the draft" reads as an error in any tone.
- Translate `dismissLabel` where the interface is not in English.

## Do and don't

### Do

- Place the alert above the content it concerns, such as at the top of a page or a section.
- Remove an alert once it no longer applies, such as when the sync resumes.
- Set `announce` on a warning or an error that appears because of something people just did, such as a failed save.
- Let people dismiss an alert only when the message can safely be hidden.

### Don't

- Don't use an alert for brief feedback after an action; use [Toast](../components/toast.md).
- Don't stack several alerts about the same thing; combine them, or show the most urgent one.
- Don't set `announce` on an alert that is there when the page loads.
- Don't put a field's error in an alert alone; show it on the field with its `error`.

## Accessibility

### Keyboard

| Key                                             | Action                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the controls of the action, then to the dismiss button. |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Dismiss | Calls `onDismiss`.                                                     |

### envUI provides

- The `status` role on info and success alerts, and the `alert` role on warning and error alerts with `announce`, so they are announced without interrupting or at once.
- An icon for each tone, hidden from assistive technology, beside text in the primary text color, so the tone is not told by color alone.
- A native dismiss button named by `dismissLabel`, with the name as its tooltip, the shared focus ring and a 2.75 rem touch target on coarse pointers.

### You provide

- A title or message that makes sense without the tone's color and icon.
- Where focus goes after a dismissal, such as to the control the alert concerned, since the dismiss button leaves with the alert.
- `announce` only on an alert that appears because of something that just happened, rendered at that moment.
- `dismissLabel` in the application's language.

## Examples

### Tones

Info for something to know, success for a result that stays relevant, warning before a problem and error after one.

```tsx example=Tones

```

### Announce a failure

A save that fails shows an error alert with `announce`, so it is read at once. Dismissing it moves focus back to the button that saves.

```tsx example=SaveFailed

```

### Another icon, or none

`icon` replaces the tone's icon with one that says more, and `icon={false}` leaves it out for a short message.

```tsx example=CustomIcon

```

## Changelog

- **1.0.0**: `Notice` is `Alert`, with `AlertTone` and the `env-alert-*` classes; the page is `alert`.
- **0.5.0**: Notice, an inline banner in four tones with an action, a round dismiss button in its tone and `announce`.
