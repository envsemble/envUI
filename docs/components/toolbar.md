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
    use: Row
  - text: Buttons joined into one connected control, such as a main action and its menu.
    use: ButtonGroup
  - text: A choice of one view or filter, shown as a selected segment.
    use: SegmentedControl
  - text: An application's menus of commands, such as File and Edit.
    use: Menubar
  - text: A page's search, filters and primary action, where fields keep their arrow keys.
    use: PageHeader
related:
  - page-header
  - button
  - segmented-control
  - menubar
  - tooltip
components:
  - Toolbar
---

# Toolbar

## Overview

A toolbar holds the controls for one subject, such as an editor's formatting, as one tab stop that the arrow keys move through. `Toolbar.Button` is an icon button named by its `label`, which a tooltip shows with its `shortcut`; with `pressed` it is a toggle.

```tsx example=FormattingToolbar

```

### Buttons of your own

Buttons inside a toolbar take the `ghost` variant unless they set another. A Button of the application's own, such as a menu's trigger, keeps its own tab stop, outside the arrow keys' path.

## Variants

| Orientation  | Use for                                                          |
| ------------ | ---------------------------------------------------------------- |
| `horizontal` | Most toolbars; <kbd>←</kbd> and <kbd>→</kbd> move. The default.  |
| `vertical`   | A palette, such as drawing tools; <kbd>↑</kbd> and <kbd>↓</kbd>. |

```tsx example=DrawingTools caption="A vertical toolbar of toggles, where one tool stays chosen."

```

```tsx example=ViewControls caption="size=sm, on a pill Surface that floats over a diagram."

```

### Layouts

Not every bar of controls is a Toolbar. A bar with a field, a Select or labelled actions is a [Row](../components/row.md), where every control keeps its tab stop and fields keep their arrow keys.

| Bar                                         | Build it with                                                 |
| ------------------------------------------- | ------------------------------------------------------------- |
| Icon commands, such as formatting or tools  | `Toolbar.Root` with `Toolbar.Button`s                         |
| A page's search, filters and primary action | [PageHeader](../components/page-header.md)'s `toolbar`, a Row |
| A section's heading with its actions        | `<Row wrap align="center" justify="between">`                 |
| A table's search and actions                | A Row above the table, in the size of its rows                |
| Actions in a window's title bar             | A TopBar with `titleBar`: its `actions`, small ghost buttons  |

```tsx example=PageToolbar caption="A page's toolbar: a Row in PageHeader's toolbar, not a Toolbar."

```

## When to use

```tsx do=GroupedControls caption="Related controls in groups, with separators between them."

```

```tsx dont=UngroupedControls caption="Controls in no order: people search the whole row."

```

```tsx do=SameIconPressed caption="A toggle keeps its icon, pressed or not."

```

```tsx dont=IconSwapsPressed caption="A pressed toggle that changes its icon: people lose track of what it does."

```

- Mirror important actions in a menu or a shortcut.

### Labels

- Name each button after its action, such as Bold, not its icon.
- Name the toolbar after its subject, such as Formatting.

## Anatomy

```tsx anatomy=ToolbarAnatomy

```

1. **Toolbar** (`env-toolbar`)
2. **Group** (`env-toolbar-group`)
3. **Button** (`env-toolbar-button`, `icon`)
4. **Separator** (`env-toolbar-separator`)

Not shown: the tooltip, `env-toolbar-tooltip`.

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

## Changelog

- **1.0.0**: Toolbar, on Base UI's Toolbar.
