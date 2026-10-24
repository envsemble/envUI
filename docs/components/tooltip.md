---
title: Tooltip
summary: A short label beside a control on hover and keyboard focus, such as an icon-only button's name or why a control is disabled.
status: stable
since: 0.2.0
category: Overlays
aliases:
  - hint
  - tip
  - info tip
  - title
  - title attribute
  - hover text
  - hover label
useWhen:
  - An icon-only control's name, such as Refresh
  - Why a control is disabled, beside the page's own account of it
  - A control's keyboard shortcut, such as Bold (<kbd>Ctrl</kbd>+<kbd>B</kbd>)
avoidWhen:
  - text: A preview of a person, a page or an item, with more than a line of text, on hover or focus.
    use: HoverCard
  - text: Content people interact with, such as a small form or a list of choices.
    use: Popover
  - text: Guidance people need to fill in a field, such as a format or a limit.
    use: TextField
  - text: Information people need that should stay visible, such as a warning about a limit.
    use: Alert
components:
  - Tooltip
---

# Tooltip

## Overview

```tsx example=IconActions

```

### Menu trigger

A tooltip can name the button that opens a menu, a popover, a dialog or a sheet, and stays closed while what it opens is open.

```tsx example=MenuTrigger

```

### Keyboard shortcuts

Write the shortcut after the control's name, such as Bold (<kbd>Ctrl</kbd>+<kbd>B</kbd>).

```tsx example=ShortcutHints

```

### Text

Text that isn't a control, such as an abbreviation, takes a quiet underline of round, well-spaced dots that says it shows more on hover or focus, and takes keyboard focus so the keyboard opens the tooltip too. The pointer stays the arrow over it, not the text cursor. Hover cards and relative times on text take the same underline. Buttons, icon buttons and links keep their own look.

```tsx example=TextAbbreviation

```

## Variants

### Sides

Where the window has no room, a tooltip flips to the other side.

| Side   | Use for                                                       |
| ------ | ------------------------------------------------------------- |
| Top    | Most controls. The default.                                   |
| Bottom | Controls at the top of a window or a pane, such as a toolbar. |
| Beside | A vertical rail, toward the content, in either direction.     |

```tsx example=RailOfIcons caption="Beside a rail of icons, toward the content."

```

## When to use

```tsx do=IconOnlyNamed open caption="Name an icon-only control."

```

```tsx dont=RepeatsLabel open caption="A tooltip that repeats a visible label."

```

```tsx do=DisabledReason open caption="Say why a control is disabled in the page too."

```

```tsx dont=ReasonOnlyInTooltip open caption="The reason only in a tooltip, which touch screens never show."

```

### Something to focus

A tooltip belongs to something people can focus, such as a button, never to an icon alone.

## Anatomy

```tsx anatomy=TooltipAnatomy open

```

1. **Tooltip** (`env-tooltip`, `content`)
2. **Control** (`env-icon-button`, `children`)

Not shown: the wrapper that lets a disabled control show a tooltip, and the dotted underline of text.

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

## In code

### Usage

Tooltip wraps the one control it describes, its `children`, such as an IconButton, which takes the trigger's props and ref; `content` is its text. While it is open, a control with a name of its own is described by it, through `aria-describedby`, so name an icon-only control with `aria-label` too. The pointer rests on the control for `delay`, 400 ms by default, before it opens, and keyboard focus opens it at once; `defaultOpen` starts it open.

```tsx source=IconActions

```

#### Side

`side` is `top`, the default, `bottom`, `left`, `right`, or `inline-start` and `inline-end`, which follow the text direction. Where the window has no room, it flips to the other side.

```tsx source=RailOfIcons

```

#### Menu trigger

A Tooltip can be the `trigger` of a Menu.Root, Popover, Dialog, Sheet or ConfirmDialog: its native props and `ref` reach the control, and it stays closed while their popup is open and as focus returns to the control. Around a HoverCard it shows nothing.

```tsx source=MenuTrigger

```

#### Keyboard shortcuts

Write the shortcut after the name in `content`, and give the control `aria-keyshortcuts` in ARIA's key names, such as `Control+B`.

```tsx source=ShortcutHints

```

#### Text and disabled controls

Text that isn't a control takes the dotted underline, `env-hover-detail`; give it `tabIndex={0}`, so keyboard focus opens the tooltip too. A disabled control sits in a wrapper, `env-tooltip-disabled-target`, that takes the pointer and focus for it, and carries its role, name, state and `aria-disabled`.

```tsx source=TextAbbreviation

```

### Customize

`--env-tooltip-container`, `--env-tooltip-content` and `--env-tooltip-outline` set the fill, the text and the edge of one Tooltip, through `style` or CSS. `popupClassName` adds a class to the popup, `env-tooltip`, beside its own; its positioner is `env-tooltip-positioner`.

## Changelog

- **1.0.0**: A text trigger, such as a focusable span or Text that holds text, takes a quiet dotted underline, `env-hover-detail`. The tooltip describes a named control (`aria-describedby`) while it is open; a disabled button's, link's, tab's or menu item's wrapper carries its role, name, state and `aria-disabled`; a Kbd inside takes light key caps; native props and `ref` reach the control, so a Tooltip can be the `trigger` of a Menu.Root, Popover, Dialog, Sheet or ConfirmDialog, and goes to their trigger around one; it stays closed while the control's menu or popover is open, and when focus returns to the control as it closes; around a HoverCard it shows nothing; `popupClassName` styles the popup; it renders on PopupSurface, in the control's text direction.
- **0.5.0**: `side` takes `inline-start` and `inline-end`, which follow the text direction. A tooltip keeps opening on hover after its control becomes enabled or disabled.
- **0.3.0**: Tooltips grow from their control.
- **0.2.0**: Tooltip.
