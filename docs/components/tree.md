---
title: Tree
summary: A virtualized tree of rows for large hierarchies, such as file trees, with keyboard navigation and a context menu.
status: stable
since: 0.5.0
category: Navigation
aliases:
  - TreeView
  - tree view
  - TreeItem
  - file tree
  - file explorer
  - folder tree
  - outline
  - hierarchy
  - nested list
useWhen:
  - A hierarchy people expand and collapse, such as folders and files
  - Thousands of rows, such as a large project's files
  - Rows previewed with a click and opened to keep with a double click
avoidWhen:
  - text: An application's destinations, such as the pages in a sidebar, one or two levels deep.
    use: Drawer
  - text: A flat list of items, each with its own actions.
    use: List
  - text: Records that share the same fields and that people compare.
    use: Table
  - text: Sections of a page people show and hide, rather than items of a hierarchy.
    use: Accordion
components:
  - Tree
---

# Tree

## Overview

The application passes the visible rows in order, each at its depth, and owns expansion and selection; the tree owns focus, the keys and scrolling.

```tsx example=FileTree

```

### Opening and previewing

A click and <kbd>Space</kbd> preview a row, and a double click and <kbd>Enter</kbd> open it to keep, as an editor previews a file in a tab before keeping it. The tree doesn't select by itself: the application marks the row people opened.

### Actions in a context menu

A right click, a long press, <kbd>Shift</kbd>+<kbd>F10</kbd> or the <kbd>Menu</kbd> key open a menu for a row, or for the empty area. Offer the same actions in visible controls.

```tsx example=ContextMenuActions

```

### Thousands of rows

The tree stays fast by rendering only the rows in view. It is as tall as its parent, so give it a parent with a height.

```tsx example=ThousandsOfRows

```

## Variants

| Density     | Use for                                               |
| ----------- | ----------------------------------------------------- |
| Extra small | The densest lists.                                    |
| Small       | Dense desktop interfaces, such as files. The default. |
| Medium      | Fewer rows with more room, such as mailboxes.         |
| Large       | The most room, as tall as a touch target.             |

```tsx example=RowDensity caption="Medium, with counts at the end, a description and a disabled row."

```

## When to use

### Nothing to press in rows

Keep buttons, links and fields out of rows: their actions go in the context menu and a toolbar.

### Stable rows

Give rows stable identities, such as paths, so focus and selection stay on their rows.

## Anatomy

```tsx anatomy=TreeAnatomy enlarge

```

1. **Tree** (`env-tree`)
2. **Row** (`env-tree-item`)
3. **Chevron** (`env-tree-chevron`, `expandable`)
4. **Icon** (`env-tree-icon`, `icon`)
5. **Label** (`env-tree-label`, `label`)
6. **End** (`env-tree-end`, `end`)
7. **Description** (`env-tree-description`, `description`)

## Adapting to width

Rows keep one line: the description gives way first, then the label ends with an ellipsis.

```tsx example=NarrowTree widths="12 24"

```

## Accessibility

### Keyboard

| Key                                                       | Action                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>           | Moves focus to and from the tree, one tab stop.                                 |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                | Moves to the next or previous row.                                              |
| <kbd>Home</kbd>, <kbd>End</kbd>                           | Moves to the first or last row.                                                 |
| <kbd>Page Down</kbd>, <kbd>Page Up</kbd>                  | Moves by the rows that fit in view, less one.                                   |
| <kbd>→</kbd>                                              | Expands a row, or moves to its first child. <kbd>←</kbd> in right-to-left text. |
| <kbd>←</kbd>                                              | Collapses a row, or moves to its parent. <kbd>→</kbd> in right-to-left text.    |
| <kbd>Enter</kbd>                                          | Opens the active row.                                                           |
| <kbd>Space</kbd>                                          | Previews the active row.                                                        |
| A letter or digit                                         | Moves to the next row whose label starts with what was typed.                   |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd>        | Opens the context menu; <kbd>Esc</kbd> closes it and returns focus to the tree. |
| Keys with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> | Left to the application.                                                        |

### envUI provides

- A `tree` of `treeitem` rows with their level, position, size, expanded, selected and disabled states.
- One tab stop with `aria-activedescendant`, the active row kept rendered and in view.
- Each row's description and end read with its label; icons and chevrons hidden.
- Rows 2.75 rem tall on coarse pointers.

### You provide

- An `aria-label` for every tree, and the context menu's name in the application's language.
- The visible rows, their expansion, the selection, and what opening does.
- A `textValue` for rows whose label isn't plain text, and a name for a count in `end`.

## In code

### Usage

A Tree takes `items`, the visible rows in order, flattened: an expanded row is followed by its visible descendants. Each row has a stable, unique `id`, such as a path, which it carries as `data-id`; its `depth`, 0 for a top-level row, each level indenting it by 0.75 rem; its `label`; and an optional decorative `icon`, a muted `description`, such as a status or a path, `end` content, such as a Badge with a count, a native `title` tooltip, `textValue` for type-ahead where the label isn't plain text, and `disabled`, which keeps the row reachable by keyboard but stops it opening and expanding. Name the tree with `aria-label`, such as Files.

```tsx source=FileTree

```

#### Expanding

`expandable` gives a row a chevron, and `expanded` shows its children, the rows that follow it in `items`. `onExpandedChange` receives the row and its new state from a press on its chevron, <kbd>→</kbd> on a collapsed row and <kbd>←</kbd> on an expanded one, mirrored in right-to-left text; the application updates `items`, removing a collapsed row's descendants.

#### Opening, previewing and selection

`onAction` receives the row people open and `{ preview }`: `true` on a single click and <kbd>Space</kbd>, `false` on a double click and <kbd>Enter</kbd>. Expandable rows call it too, and disabled rows don't. The tree doesn't select by itself: set `value`, the selected row's id, from `onAction`; that row takes the navigation selection colors and scrolls into view when it changes.

#### Context menu

`contextMenu` returns the menu items for the row people right-click, long-press, or press <kbd>Shift</kbd>+<kbd>F10</kbd> or the <kbd>Menu</kbd> key on, or for the tree's empty area when the row is `null`; without it, the browser's own context menu stays. `contextMenuLabel` names the menu, Actions by default, from EnvUIProvider's `messages.tree.actions`.

```tsx source=ContextMenuActions

```

#### Thousands of rows

The tree renders only the rows in view, and is as tall as its parent: give the parent a height, or the tree one through `style`. `className`, `style` and `ref` reach the tree, the element that scrolls and holds focus.

```tsx source=ThousandsOfRows

```

#### Density

`density` is `xs`, `sm`, the default, `md` or `lg`. It changes only the rows' block padding, never the text or the icons: in the comfortable scale `sm` rows are 1.75 rem tall and `md` rows 2.25 rem, and under a coarse pointer every row is at least 2.75 rem.

```tsx source=RowDensity

```

### Composition

The parts are the tree, `env-tree`, and each row, `env-tree-item`, with its chevron, `env-tree-chevron`, icon, `env-tree-icon`, label, `env-tree-label`, description, `env-tree-description`, and end, `env-tree-end`. Keep buttons, links and fields out of rows, and put their actions in the context menu and a toolbar.

## Changelog

- **1.0.0**: `selectedId` is `value` and `onOpen` is `onAction`, with `TreeActionOptions` (was `TreeOpenOptions`); a TreeItem's `detail` is `description` and its `trailing` is `end`. The context menu's default name comes from `messages.tree`, and the tree takes `ref` and `style`. A row's class is `env-tree-item` (was `env-tree-row`), and `env-tree-detail` and `-trailing` are `env-tree-description` and `-end`.
- **0.5.0**: Tree: a virtualized tree for thousands of rows, with keyboard navigation, type-ahead, preview and open callbacks, a context menu and two densities. Keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application.
