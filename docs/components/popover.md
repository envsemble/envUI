---
title: Popover
summary: A floating panel beside its trigger for details or a small form; Esc or a press outside closes it.
status: stable
since: 0.5.0
category: Feedback & overlays
aliases:
  - popup
  - pop-up
  - flyout
  - overlay
  - dropdown panel
  - floating panel
  - toggletip
  - info popup
useWhen:
  - Details about something on the page that people open on demand, such as a document's history or what a setting means.
  - A small form beside the control it changes, such as renaming an item or choosing filters.
  - An explanation behind an icon button, such as a help mark beside a value.
avoidWhen:
  - text: A short name or hint for a control, shown on hover and focus.
    use: Tooltip
  - text: A preview of a link's destination, shown on hover.
    use: HoverCard
  - text: A list of actions or destinations.
    use: Menu
  - text: Choosing a value for a form field from a list.
    use: Select
  - text: A task that needs people's full attention or more room, or a consequence to confirm.
    use: Dialog
related:
  - tooltip
  - hover-card
  - menu
  - dialog
  - select
  - accessibility
components:
  - Popover
---

# Popover

## Overview

A popover is a floating panel that opens beside its trigger, for details people ask for or a small form that changes something nearby. It moves focus into itself as it opens, and closes with <kbd>Esc</kbd>, a press outside or when focus leaves it, so people return to what they were doing. Popover is built on Base UI's popover; it is not modal, so the rest of the page stays usable.

```tsx example=DocumentDetails

```

## Anatomy

1. **Trigger** (`trigger`): the control that opens and closes the popover, such as a Button or an IconButton. It reports that it opens a dialog and whether the popover is open.
2. **Surface**: the raised popup color with a hairline border, the level-2 shadow and 1.75 rem corners, 0.5 rem from the trigger. It has 1.5 rem padding and 0.75 rem between its parts, and the surface Dialog and HoverCard share.
3. **Title** (optional, `title`): a heading at the top in 1 rem medium-weight text, which names the popover.
4. **Content** (`children`): body text in 0.9375 rem, fields and actions; a function child receives `close`.

## Variants and sizes

| Width | Use for                                                         |
| ----- | --------------------------------------------------------------- |
| `md`  | Details and a field or two: up to 20 rem wide. The default.     |
| `lg`  | A longer form, or a field with actions beside it: up to 28 rem. |

- A popover is as wide as its content, from 12 rem up to its width, and never wider than the room beside its trigger: it keeps 0.5 rem from the window's edges. `width` is the widest it grows; for a fixed width, set `inline-size` through `className`.
- A popover taller than the room beside its trigger scrolls inside its surface.
- `side` places it below the trigger (the default), above it, to its left or right, or at the start or end of the line (`inline-start`, `inline-end`), which follow the text direction, and `align` lines it up with the trigger's start, centre (the default) or end. Where the window has no room, it flips to the other side.

## States and behaviour

- **Opening**: pressing the trigger opens the popover and sets the trigger's `aria-expanded`; pressing it again closes it. Focus moves to the popover's first field or control, or to the popover itself when it has none. The popover fades in and, without a reduced-motion preference, grows from its trigger.
- **Closing**: <kbd>Esc</kbd> closes the popover and returns focus to the trigger. A press outside closes it too; pressing another popover's trigger closes this one and opens the other. <kbd>Tab</kbd> past its last element closes it and moves focus on from the trigger; <kbd>Shift</kbd>+<kbd>Tab</kbd> from its first element returns to the trigger and keeps it open.
- **Closing from inside**: a function child receives `close`, for an action that should close the popover once it is done, such as a form's submit or a Cancel button; focus returns to the trigger.
- **Controlled or not**: `open` with `onOpenChange` controls the popover, which receives the requested state and, in its second argument, the `reason`, such as `escape-key` or `close-press`, each time it asks to open or close; otherwise it starts from `defaultOpen`, closed by default.
- **Not modal**: the page behind stays usable and scrollable, and isn't hidden from assistive technology.
- **Theme**: the popover renders in a portal at the end of the document, in the theme of the place it opens from, also inside a nested `Theme` or a dialog.

## Content guidelines

- Title a popover with what it describes or does, in sentence case: "Launch plan.md", "Billing periods", "Assignees".
- Keep the content short: a few lines of details, or one to three fields with their actions. Move anything longer to a [Dialog](../components/dialog.md).
- Name the primary action of a form after what it does, such as "Rename" or "Apply", and put it last.
- Name an icon-only trigger after what the popover holds: "About billing periods", not "Help".

## Do and don't

### Do

- Give every popover a `title`, or an `aria-label` where a visible title would repeat its trigger.
- Close the popover with `close` once its action is done, and show the result beside the trigger.
- Use the `lg` width for a form, so fields and actions can grow to 28 rem.
- Keep what the popover shows reachable elsewhere where it matters, since it is out of sight until opened.

### Don't

- Don't open a popover on hover; use [Tooltip](../components/tooltip.md) for a hint or [HoverCard](../components/hover-card.md) for a preview.
- Don't put a list of actions in a popover; use [Menu](../components/menu.md).
- Don't use a popover for a consequence people must confirm; use [Dialog](../components/dialog.md) or a ConfirmButton.

## Accessibility

### Keyboard

| Key                                                 | Action                                                                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger | Opens the popover and moves focus into it; on an open popover's trigger, closes it.                                                                                                               |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>     | Moves through the popover's content. <kbd>Tab</kbd> past its last element closes it and moves on from the trigger; <kbd>Shift</kbd>+<kbd>Tab</kbd> from its first element returns to the trigger. |
| <kbd>Esc</kbd>                                      | Closes the popover and returns focus to the trigger.                                                                                                                                              |

### envUI provides

- `aria-haspopup="dialog"` and `aria-expanded` on the trigger, and a popover with the `dialog` role, named by its title or by `aria-label`.
- Focus moved into the popover as it opens, and back to the trigger when <kbd>Esc</kbd> or `close` closes it.
- A popover that isn't modal, so the page stays usable and readable by assistive technology.
- The originating theme in the portal.

### You provide

- A `title`, or an `aria-label` when there is none.
- An accessible name on an icon-only trigger, such as "About billing periods".
- The actions inside, and a call to `close` when one is done.

## Examples

### A small form

A function child receives `close`: the form renames the document and closes the popover, and Cancel closes it without a change. The `lg` width lets the field grow to 28 rem.

```tsx example=RenameInPlace

```

### Controlled filters

`open` and `onOpenChange` control the popover: it starts from the filters in use each time it opens, and Apply closes it. The trigger counts the filters applied.

```tsx example=FilterTasks

```

### Help beside a value

An icon-only trigger, named after what it explains, opens the popover to its right with `side="right"`.

```tsx example=FieldHelp

```

## Changelog

- **1.0.0**: `width` is `md` or `lg`, the widest the popover grows as it sizes to its content; `side` takes `inline-start` and `inline-end`; `className`, `style`, `ref` and data attributes reach the surface, which renders on PopupSurface in the trigger's text direction.
- **1.0.0**: Popovers take the level-2 elevation, with its shadow and border.
- **0.5.0**: Popover, with a title, two widths and a close function for its content.
