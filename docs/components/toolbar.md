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
  - Controls for one subject, such as an editor's formatting
  - Many icon-only actions that would each take a tab stop
  - A palette whose chosen tool stays chosen, such as drawing tools
avoidWhen:
  - text: A form's or a dialog's actions, which keep a tab stop each.
    use: Row
  - text: Buttons joined into one connected control, such as a main action and its menu.
    use: ButtonGroup
  - text: A choice of one view or filter, shown as a selected segment.
    use: SegmentedControl
  - text: An application's menus of commands, such as File and Edit.
    use: Menubar
  - text: A page's search, filters and primary action, where fields keep their arrow keys.
    use: PageHeader
components:
  - Toolbar
---

# Toolbar

## Overview

Each button is an icon, whose name and shortcut show in a tooltip; a button can also be a toggle that stays pressed.

```tsx example=FormattingToolbar

```

### Buttons of your own

Buttons inside a toolbar take the ghost look unless they set another. A button of the application's own, such as a menu's trigger, keeps its own tab stop, outside the arrow keys' path.

## Variants

### Orientation

| Orientation | Use for                                                                             |
| ----------- | ----------------------------------------------------------------------------------- |
| Horizontal  | Most toolbars, moved through with <kbd>←</kbd> and <kbd>→</kbd>. The default.       |
| Vertical    | A palette, such as drawing tools, moved through with <kbd>↑</kbd> and <kbd>↓</kbd>. |

```tsx example=DrawingTools caption="A vertical toolbar of toggles, where one tool stays chosen."

```

### Sizes

The buttons come in the three control heights of the [scale](../foundations/scale.md), or take the height of the toolbar's container.

```tsx example=ViewControls caption="Small buttons, on a rounded surface that floats over a diagram."

```

### Layouts

Not every bar of controls is a Toolbar. A bar with a field, a Select or labelled actions is a [Row](row.md), where every control keeps its tab stop and fields keep their arrow keys.

| Bar                                         | Build it with                                          |
| ------------------------------------------- | ------------------------------------------------------ |
| Icon commands, such as formatting or tools  | A Toolbar of its buttons                               |
| A page's search, filters and primary action | A Row in the toolbar of a [PageHeader](page-header.md) |
| A section's heading with its actions        | A Row that wraps, with the actions at the end          |
| A table's search and actions                | A Row above the table, in the size of its rows         |
| Actions in a window's title bar             | A TopBar as a title bar, with small ghost buttons      |

```tsx example=PageToolbar caption="A page's toolbar: a Row in PageHeader's toolbar, not a Toolbar."

```

## When to use

```tsx do=SameIconPressed caption="A toggle keeps its icon, pressed or not."

```

```tsx dont=IconSwapsPressed caption="A pressed toggle that changes its icon: people lose track of what it does."

```

### Another way to each action

Offer the important actions in a menu or a shortcut too.

### Labels

Name each button after its action, such as Bold rather than its icon, and the toolbar after its subject, such as Formatting.

## Anatomy

```tsx anatomy=ToolbarAnatomy

```

1. **Toolbar** (`env-toolbar`)
2. **Group** (`env-toolbar-group`)
3. **Button** (`env-toolbar-button`, `icon`)
4. **Separator** (`env-toolbar-separator`)

Not shown: the tooltip.

## Accessibility

### Keyboard

| Key                                             | Action                                                     |
| ----------------------------------------------- | ---------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into the toolbar, to the control last used, and out. |
| <kbd>←</kbd>, <kbd>→</kbd>                      | Moves between controls of a horizontal toolbar.            |
| <kbd>↑</kbd>, <kbd>↓</kbd>                      | Moves between controls of a vertical toolbar.              |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses the button, or follows the link.                   |
| <kbd>Esc</kbd>                                  | Closes the tooltip.                                        |

### envUI provides

- `role="toolbar"` with `aria-orientation`, and a group role on each group.
- One tab stop, with disabled buttons out of the arrow keys' path.
- Names from `label`, `aria-pressed` on toggles and `aria-keyshortcuts` from `shortcut`.

### You provide

- An `aria-label` on the toolbar, and on groups that share a name.
- The behaviour behind each button and shortcut.

## In code

### Usage

Toolbar.Root, named by its `aria-label`, holds Toolbar.Button, Toolbar.Link, Toolbar.Group and Toolbar.Separator. A Toolbar.Button takes its `icon` and its `label`, which names it and shows in its tooltip with its `shortcut`, such as `Ctrl+B`, announced as `aria-keyshortcuts`; with `pressed` it is a toggle, announced as pressed and drawn selected. Its `variant` is Button's, `ghost` by default from the toolbar, and `pending` replaces the icon with a spinner. A Toolbar.Link takes an `href`, through the link component of `LinkProvider`, with its `icon` and `label`. A Toolbar.Group, named by its own `aria-label`, holds controls that belong together.

```tsx source=FormattingToolbar

```

#### Orientation and size

`orientation` is `horizontal`, the default, or `vertical`, and sets which arrow keys move. `size` is `sm`, `md` or `lg`; without it the buttons take their container's control height. `loopFocus`, on by default, moves from the last control to the first and back. `disabled` on Toolbar.Root or a Toolbar.Group disables every control inside.

```tsx source=ViewControls

```

#### Buttons of your own

Buttons inside a toolbar take the `ghost` variant unless they set another. A Button of the application's own, such as a Menu.Root's trigger, keeps its own tab stop, outside the arrow keys' path.

#### Other bars

A bar with a field, a Select or labelled actions is a Row: `<Row wrap align="center" justify="between">` for a section's heading and its actions, PageHeader's `toolbar` for a page's search, filters and primary action, and a TopBar with `titleBar` for a window's title bar, with small ghost buttons in its `actions`.

```tsx source=PageToolbar

```

### Composition

The parts are the toolbar, `env-toolbar`; its groups, `env-toolbar-group`; its buttons and links, `env-toolbar-button`; its separators, `env-toolbar-separator`; and a button's tooltip, `env-toolbar-tooltip`. `render` on Toolbar.Root or Toolbar.Group renders it as another element, such as a ButtonGroup that connects its buttons, or onto a Surface that floats it.

## Changelog

- **1.0.0**: Toolbar, on Base UI's Toolbar.
