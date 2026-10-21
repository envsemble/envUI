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

A tooltip is a short label that appears beside a control while the pointer rests on it or it has keyboard focus: the name of an icon-only button, why a control is disabled, or a keyboard shortcut. It wraps one control, and closes when the pointer or focus leaves, on <kbd>Esc</kbd> and when the control is pressed.

While it is open, a control with a name of its own is described by the tooltip, so assistive technology reads the tooltip after the name; a tooltip that only repeats the name adds nothing. Touch screens don't show tooltips, so the control's accessible name or the page says what matters.

```tsx example=IconActions

```

## Anatomy

1. **Control** (`children`): the one control the tooltip describes, such as an IconButton, which takes the trigger's props and ref, and the Tooltip's own native props and ref. A disabled control is wrapped in a focusable element with a pill-shaped focus ring, since disabled controls take neither pointer nor focus events; for a button, link, tab or menu item, the wrapper takes the control's role, name and state and reports it disabled.
2. **Tooltip** (`content`): 0.875 rem text with 0.25 and 0.5 rem padding and 0.5 rem corners, in the neutral strong fill with light text, 0.375 rem from the control. It is at most 18 rem wide, or the window's width less 2 rem, and long words wrap anywhere. A Kbd inside takes light key caps for the dark fill.

## Variants and sizes

| Side                         | Use for                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `top` (default)              | Most controls.                                                                                                       |
| `bottom`                     | Controls at the top of a window or a pane, such as a toolbar, where the tooltip would cover the title above.         |
| `inline-start`, `inline-end` | A vertical rail of icon buttons, so the tooltip opens beside the rail, toward the content, in either text direction. |
| `left`, `right`              | A side that stays the same in right-to-left text.                                                                    |

Where the window has no room on its side, the tooltip flips to the opposite side.

## States and behaviour

- **Opening**: once the pointer rests on the control for `delay` milliseconds (400), and at once when the control gets keyboard focus. A tap, or focus from a pointer, doesn't open it.
- **Closing**: when the pointer leaves the control and the tooltip, when focus leaves the control, on <kbd>Esc</kbd>, and when the control is pressed, with a pointer, <kbd>Enter</kbd> or <kbd>Space</kbd>. <kbd>Esc</kbd> closes only the tooltip: focus stays on the control and an enclosing dialog stays open.
- **Hovering the tooltip**: the pointer can move from the control onto the tooltip, which stays open, so people can read or magnify it.
- **Disabled controls**: a control whose `disabled` prop is true is wrapped in an element that opens the tooltip on hover. Where the control is a named button, link, tab or menu item, the wrapper is a tab stop too: it takes that role and name with `aria-disabled`, and a button's or tab's `aria-pressed`, `aria-expanded`, `aria-haspopup` and `aria-selected` as they change, and stands in for the control, so it is announced once, as disabled. A control whose role needs a state of its own, such as a checkbox, radio, switch, slider or select, keeps its own role and state: its wrapper is no tab stop. When the control becomes enabled or disabled, such as a back button once there is somewhere to go, the tooltip follows it.
- **Menu and popover triggers**: a Tooltip can be the `trigger` of a Menu.Root, Popover, Dialog, Sheet or ConfirmDialog: it passes the props and ref they give their trigger, such as the press handler, `aria-haspopup`, `aria-expanded` and `aria-controls`, on to its control. Wrapped around one of those five, it goes to their `trigger` the same way; around any other component, even one with a `trigger` prop, it describes that component itself. While the control's own popup is open (`aria-expanded`), the tooltip stays closed, so <kbd>Esc</kbd> closes the menu or popover and the tooltip doesn't cover it; a press opens the popup once. When the popup closes, focus returns to the control without opening the tooltip, so one <kbd>Esc</kbd> is enough; the pointer entering the control, or focus from the keyboard after the next key press, opens it again.
- **HoverCard**: a Tooltip around a HoverCard, or as its `trigger`, shows no tooltip, and says so in the console while developing: the card opens on the same hover and focus, and the tooltip would cover it. Put what the tooltip would say in the card.
- **Controls with their own tooltip**: an icon-only CopyButton, an icon-only NavList item and a RelativeTime show their own tooltips, and leave it to a Tooltip around them.
- **Children it can't take**: the child is one element that takes props and a ref. Text, a Fragment, or a component that doesn't pass the ref on to its element shows no tooltip, and says so in the console while developing.
- **Description**: while the tooltip is open, a control with a name of its own, read from the page as the tooltip opens, also where its content names it, has `aria-describedby` pointing at it (`role="tooltip"`). A tooltip whose text is the control's name describes nothing.
- **Theme**: the tooltip renders in a portal at the end of the document, in the theme and text direction of its control. `className`, `style`, `ref`, data attributes and the other native props reach the control; `popupClassName` adds a class to the tooltip's popup. Where both the Tooltip and its control have an `id`, the control's `id` wins.
- **Motion**: the tooltip fades in and out; without a reduced-motion preference, it also grows from its control.

## Content guidelines

- Keep it to a few words or one short sentence, in sentence case, without ending punctuation for a name: "Refresh members", "Download as CSV".
- For an icon-only control, repeat its accessible name exactly, so what people see and what assistive technology reads match.
- For a disabled control, say why it is disabled and, where it helps, what would enable it: "All seats are assigned. Remove a member to invite someone else."
- Write a shortcut after the name, as the keys read on the keyboard, or as Kbd keys: "Bold (Ctrl+B)".
- Don't repeat a visible label in a tooltip; it adds nothing.

## Do and don't

### Do

- Give every icon-only control a tooltip with its name, in toolbars and dense places.
- Give the control its own accessible name, with `aria-label` on an icon-only control, and `aria-keyshortcuts` for a shortcut the tooltip shows.
- Say why a control is disabled on the page too, such as "5 of 5 seats assigned" beside it.

### Don't

- Don't put essential information, such as an error or a field's format, only in a tooltip.
- Don't put links, buttons or other controls in a tooltip; use [Popover](../components/popover.md).
- Don't use a tooltip for a preview of a person or a page; use [HoverCard](../components/hover-card.md).
- Don't wrap something that can't take focus, such as plain text or an icon; people using the keyboard can't reach its tooltip.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to or from the control. Keyboard focus opens its tooltip at once; a disabled control's wrapper is a tab stop too. |
| <kbd>Esc</kbd>                                  | Closes the tooltip. Focus stays on the control, and an enclosing dialog stays open.                                           |
| <kbd>Enter</kbd> or <kbd>Space</kbd>            | Activates the control and closes the tooltip; on a disabled control's wrapper, does nothing.                                  |

### envUI provides

- A tooltip that opens on keyboard focus as well as on hover, and closes on <kbd>Esc</kbd> without closing what it sits in.
- A tooltip that stays open while the pointer moves onto it, so people can read or magnify it.
- A focusable wrapper with a focus ring around a disabled control, so the keyboard reaches its tooltip, named as the control and reported disabled.
- `role="tooltip"`, and `aria-describedby` from a named control to the tooltip while it is open.
- Light text on the neutral strong fill, at 9:1 in both themes.
- The control's theme in the portal, and fades only with a reduced-motion preference.

### You provide

- An accessible name on the control, such as `aria-label` on an icon-only button: the tooltip describes the control while it is open, and names nothing. An icon-only menu or popover trigger is no exception.
- The reason a control is disabled in the page too, where people using a screen reader or a touch screen can find it.
- `aria-keyshortcuts` on a control whose tooltip shows a shortcut, and the shortcut's handling.
- A control as the child, which takes the trigger's props and ref, such as a Button or an IconButton.

## Examples

### Menu trigger

An icon-only button that opens a menu or a popover has a tooltip too: the Tooltip is the menu's `trigger`, and passes the menu button's props and ref on to the IconButton. A press opens the menu and closes the tooltip, which stays closed while the menu is open.

```tsx example=MenuTrigger

```

### Disabled control

A disabled button keeps its tooltip, through a focusable wrapper. The text below the button says the same for people who can't see the tooltip.

```tsx example=DisabledReason

```

### Keyboard shortcuts

The tooltip shows the shortcut after the name, below the toolbar; `aria-keyshortcuts` gives it to assistive technology.

```tsx example=ShortcutHints

```

### Beside a rail

`side="inline-end"` opens each tooltip beside a vertical rail of icon buttons, toward the content, also in right-to-left text.

```tsx example=RailOfIcons

```

## Changelog

- **1.0.0**: The tooltip describes a named control (`aria-describedby`) while it is open; a disabled button's, link's, tab's or menu item's wrapper carries its role, name, state and `aria-disabled`; a Kbd inside takes light key caps; native props and `ref` reach the control, so a Tooltip can be the `trigger` of a Menu.Root, Popover, Dialog, Sheet or ConfirmDialog, and goes to their trigger around one; it stays closed while the control's menu or popover is open, and when focus returns to the control as it closes; around a HoverCard it shows nothing; `popupClassName` styles the popup; it renders on PopupSurface, in the control's text direction.
- **0.5.0**: `side` takes `inline-start` and `inline-end`, which follow the text direction. A tooltip keeps opening on hover after its control becomes enabled or disabled.
- **0.3.0**: Tooltips grow from their control.
- **0.2.0**: Tooltip.
