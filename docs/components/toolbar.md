---
title: Toolbar
summary: A row, or a column, of controls for one subject, one tab stop from the page, moved through with the arrow keys.
status: beta
since: 1.0.0
category: Actions
aliases:
  - toolbar
  - formatting bar
  - action bar
  - button bar
  - tool palette
useWhen:
  - A set of controls acts on one subject, such as an editor's formatting or a diagram's view.
  - Many icon-only actions sit together and would make a long tab sequence one by one.
  - A tool is chosen from a palette and stays chosen, such as a drawing tool.
avoidWhen:
  - text: A form's or a dialog's actions, which keep a tab stop each.
    use: Stack
  - text: Buttons joined into one connected control, such as a main action and its menu.
    use: ButtonGroup
  - text: A choice of one view or filter, shown as a selected segment.
    use: SegmentedControl
  - text: An application's menus of commands, such as File and Edit.
    use: Menubar
related:
  - button
  - segmented-control
  - menubar
  - tooltip
components:
  - Toolbar
---

# Toolbar

## Overview

A toolbar holds the controls for one subject, such as an editor's formatting, in a row or a column. It is one tab stop: <kbd>Tab</kbd> reaches its current control, and the arrow keys move between its controls, as the APG toolbar pattern describes. It is built on Base UI's Toolbar.

`Toolbar.Button` is an icon-only button named by its `label`, which a tooltip shows with its `shortcut`. With `pressed` it is a toggle, such as Bold, drawn selected and announced as pressed. Buttons inside a toolbar take the `ghost` variant unless they set another, also a Button of the application's own, such as a menu's trigger; such a button keeps a tab stop of its own, outside the arrow keys' path.

```tsx example=FormattingToolbar

```

## Anatomy

1. **Root** (`Toolbar.Root`): the row or column, named with `aria-label`; `orientation`, `size` and `disabled` apply to everything inside.
2. **Group** (`Toolbar.Group`): controls that belong together, such as the text styles, with an optional name.
3. **Separator** (`Toolbar.Separator`): a line between groups, across the toolbar's direction.
4. **Button** (`Toolbar.Button`): an icon-only button with `icon`, `label`, and optionally `pressed` and `shortcut`.
5. **Link** (`Toolbar.Link`): an icon-only link with `href`, `icon` and `label`.
6. **Tooltip**: the label, and the shortcut as keys, on hover and keyboard focus.

## Variants and sizes

- **Orientation**: `horizontal`, the default, runs left to right in the reading direction and answers <kbd>←</kbd> and <kbd>→</kbd>; `vertical` runs top to bottom and answers <kbd>↑</kbd> and <kbd>↓</kbd>, such as a palette of drawing tools.
- **Size**: `size` gives the buttons inside the control height of `sm`, `md` or `lg`, 2, 2.5 or 3 rem in the comfortable scale; without it, they take the control height of their container. Use `sm` for a toolbar that floats over dense content.
- **Pressed**: a pressed toggle takes the selected fill, `--env-color-bg-selected`, with the selected label color.
- A toolbar keeps its controls on one line; give it room or fewer controls rather than letting it wrap.

## States and behaviour

- **Focus**: one control holds the tab stop. The arrow keys move it, and from the last control back to the first, unless `loopFocus` is false. The toolbar remembers the control people left.
- **Disabled**: a disabled button leaves the arrow keys' path and shows no tooltip; `disabled` on the root or a group disables every control in it.
- **Tooltips**: each button's label, and its shortcut as key caps, show on hover after a moment and at once on keyboard focus, and close on <kbd>Esc</kbd>.
- **Shortcuts**: `shortcut` is shown and announced (`aria-keyshortcuts`); the application handles the keys themselves.

## Content guidelines

- Name each button after its action, such as "Bold" or "Zoom in", not its icon.
- Name the toolbar after its subject, such as "Formatting" or "Diagram view".
- Write shortcuts with their keys joined by +, as the platform writes them, such as Ctrl+B.

## Do and don't

### Do

- Group related controls, and put separators between the groups.
- Use `pressed` for controls that turn something on and off, and keep their icon the same in both states.
- Keep the most used controls first in the reading order.

### Don't

- Don't put text fields or other controls that use the arrow keys themselves in a toolbar; place them beside it.
- Don't make a toolbar the only way to reach an action that people need without a pointer; mirror important actions in a menu or a shortcut.
- Don't wrap a form's actions in a toolbar; they keep a tab stop each.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus into the toolbar, to the control that holds its tab stop, and out.            |
| <kbd>→</kbd>, <kbd>←</kbd>                      | In a horizontal toolbar, moves to the next or previous control, in the reading direction. |
| <kbd>↓</kbd>, <kbd>↑</kbd>                      | In a vertical toolbar, moves to the next or previous control.                             |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses the focused button, or follows the focused link.                                  |
| <kbd>Esc</kbd>                                  | Closes the focused control's tooltip.                                                     |

### envUI provides

- `role="toolbar"` with `aria-orientation`, and a group role on each `Toolbar.Group`.
- A roving tab stop, so the toolbar is one stop in the tab order.
- Each button's name from `label`, `aria-pressed` on toggles and `aria-keyshortcuts` from `shortcut`.
- Disabled buttons out of the arrow keys' path.

### You provide

- An `aria-label` on the root, and on each group whose controls share a name.
- The behaviour behind each button and shortcut.

## Examples

### Diagram controls

A pill Surface rendered as the toolbar floats it over a diagram, with small buttons and a link to help.

```tsx example=ViewControls

```

### Drawing tools

A vertical toolbar of toggles, where one tool stays chosen.

```tsx example=DrawingTools

```

## Changelog

- **1.0.0**: Toolbar, on Base UI's Toolbar.
