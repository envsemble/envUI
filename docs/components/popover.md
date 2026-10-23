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
components:
  - Popover
---

# Popover

## Overview

A popover is a floating panel beside its trigger, for details people ask for or a small form that changes something nearby. It takes focus as it opens and closes with <kbd>Esc</kbd>, a press outside or when focus leaves it; it isn't modal, so the page stays usable.

```tsx example=DocumentDetails open stage=raised

```

### A small form

A function child receives `close`, to close the popover once its action is done.

```tsx example=RenameInPlace open stage=raised

```

### Controlled

`open` and `onOpenChange` control the popover, here starting from the filters in use each time it opens.

```tsx example=FilterTasks

```

## Variants

| Width | Use for                                                |
| ----- | ------------------------------------------------------ |
| `md`  | Details and a field or two, up to 20 rem. The default. |
| `lg`  | A longer form, up to 28 rem.                           |

A popover is as wide as its content up to its width. `side` places it below its trigger, above, beside it or at the inline start or end, and `align` lines it up; it flips where there is no room.

```tsx example=FieldHelp open stage=raised caption="side right, beside a value it explains."

```

## When to use

```tsx do=ShortHelp open stage=raised caption="A few lines, which people read at a glance."

```

```tsx dont=LongHelp open stage=raised caption="Paragraphs of help: too much to read beside the page."

```

- One to three fields at most in a form, with the action last.
- Give every popover a `title`, or an `aria-label` where a title would repeat its trigger.
- Name an icon-only trigger after what the popover holds, such as About billing periods.
- Keep what matters reachable elsewhere: a popover is out of sight until opened.

## Anatomy

```tsx anatomy=PopoverAnatomy open stage=raised

```

1. **Popover** (`env-popover`)
2. **Title** (`env-popover-title`, `title`)
3. **Content** (`env-popover > env-text`, `children`)
4. **Trigger** (`env-icon-button`, `trigger`)

## Accessibility

### Keyboard

| Key                                                 | Action                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger | Opens the popover and moves focus in; on an open popover's trigger, closes it. |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>     | Moves through the popover; past its last element it closes and moves on.       |
| <kbd>Esc</kbd>                                      | Closes the popover and returns focus to the trigger.                           |

### envUI provides

- `aria-haspopup="dialog"` and `aria-expanded` on the trigger, and a `dialog` named by its title.
- Focus moved in on open, and back to the trigger when <kbd>Esc</kbd> or `close` closes it.
- The theme of its trigger in the portal.

### You provide

- A `title` or an `aria-label`, and a name for an icon-only trigger.
- The actions inside, and a call to `close` when one is done.

## Changelog

- **1.0.0**: `width` is `md` or `lg`, the widest the popover grows as it sizes to its content; `side` takes `inline-start` and `inline-end`; `className`, `style`, `ref` and data attributes reach the surface, which renders on PopupSurface in the trigger's text direction.
- **1.0.0**: Popovers take the level-2 elevation edge, with no shadow.
- **0.5.0**: Popover, with a title, two widths and a close function for its content.
