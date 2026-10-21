---
title: Tooltip
summary: A short label beside a control on hover and keyboard focus, such as an icon-only button's name or why a control is disabled.
status: stable
since: 0.2.0
category: Feedback & overlays
aliases:
  - hint
  - tip
  - info tip
  - title
  - title attribute
  - hover text
  - hover label
useWhen:
  - Showing an icon-only control's name, such as a toolbar's Refresh button, for people who don't recognise the icon.
  - Saying why a control is disabled, such as All seats are assigned, beside the page's own account of it.
  - Showing a control's keyboard shortcut, such as Bold (Ctrl+B).
avoidWhen:
  - text: A preview of a person, a page or an item, with more than a line of text, on hover or focus.
    use: HoverCard
  - text: Content people interact with, such as a small form or a list of choices.
    use: Popover
  - text: Guidance people need to fill in a field, such as a format or a limit.
    use: TextField
  - text: Information people need that should stay visible, such as a warning about a limit.
    use: Alert
related:
  - button
  - hover-card
  - popover
  - accessibility
components:
  - Tooltip
---

# Tooltip

## Overview

A tooltip is a short label beside a control, shown while the pointer rests on it or it has keyboard focus.

```tsx example=IconActions

```

### Menu trigger

A Tooltip can be the `trigger` of a Menu.Root, Popover, Dialog, Drawer or ConfirmDialog, and stays closed while their popup is open.

```tsx example=MenuTrigger

```

### Keyboard shortcuts

Write the shortcut after the name, and give the control `aria-keyshortcuts`.

```tsx example=ShortcutHints

```

## Variants

| Side                         | Use for                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `top`                        | Most controls. The default.                                   |
| `bottom`                     | Controls at the top of a window or a pane, such as a toolbar. |
| `inline-start`, `inline-end` | A vertical rail, toward the content, in either direction.     |

### Beside a rail

```tsx example=RailOfIcons

```

## When to use

```tsx do=IconOnlyNamed caption="Name an icon-only control."

```

```tsx dont=RepeatsLabel caption="A tooltip that repeats a visible label."

```

```tsx do=DisabledReason caption="Say why a control is disabled in the page too."

```

```tsx dont=ReasonOnlyInTooltip caption="The reason only in a tooltip, which touch screens never show."

```

- Wrap a control that takes focus, never plain text or an icon.

### Content

```tsx do=ShortName caption="A few words, the same as the control’s accessible name."

```

```tsx dont=LongTooltip caption="A paragraph people must hold the pointer still to read."

```

## Accessibility

### Keyboard

| Key                                             | Action                                                  |
| ----------------------------------------------- | ------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the control, which opens its tooltip at once.  |
| <kbd>Esc</kbd>                                  | Closes the tooltip; focus and an enclosing dialog stay. |

### envUI provides

- `role="tooltip"`, describing a named control while it is open.
- A focusable wrapper around a disabled control, named as the control and reported disabled.
- A tooltip that stays open while the pointer moves onto it.

### You provide

- An accessible name on the control, such as `aria-label` on an icon-only button.
- The reason a control is disabled in the page too.
- A child that takes the trigger's props and ref, such as a Button or an IconButton.

## Changelog

- **1.0.0**: The tooltip describes a named control (`aria-describedby`) while it is open; a disabled button's, link's, tab's or menu item's wrapper carries its role, name, state and `aria-disabled`; a Kbd inside takes light key caps; native props and `ref` reach the control, so a Tooltip can be the `trigger` of a Menu.Root, Popover, Dialog, Drawer or ConfirmDialog, and goes to their trigger around one; it stays closed while the control's menu or popover is open, and when focus returns to the control as it closes; around a HoverCard it shows nothing; `popupClassName` styles the popup; it renders on PopupSurface, in the control's text direction.
- **0.5.0**: `side` takes `inline-start` and `inline-end`, which follow the text direction. A tooltip keeps opening on hover after its control becomes enabled or disabled.
- **0.3.0**: Tooltips grow from their control.
- **0.2.0**: Tooltip.
