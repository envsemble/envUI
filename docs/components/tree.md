---
title: Tree
summary: A tree of rows for large hierarchies, such as file trees, with keyboard navigation and a context menu.
status: stable
since: 1.0.0
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
  - text: An application's destinations, one or two levels deep.
    use: NavigationDrawer
  - text: A flat list of items, each with its own actions.
    use: List
  - text: Records that share the same fields and that people compare.
    use: Table
components:
  - Tree
examples:
  FileTree: overview
  RowDensity: example
  TreeAnatomy: anatomy
  ContextMenuActions: example
  MatchedLetters: example
  NarrowTree: example
---

# Tree

## Variants

### Density

```tsx figure=RowDensity motion

```

## Anatomy

```tsx figure=TreeAnatomy enlarge

```

1. **Tree** (`env-tree`)
2. **Row** (`env-tree-item`)
3. **Chevron** (`env-tree-chevron`, `expandable`)
4. **Start** (`env-tree-start`, `start`)
5. **Label** (`env-tree-label`, `label`)
6. **End** (`env-tree-end`, `end`)
7. **Description** (`env-tree-description`, `description`)

## Behaviour

### Opening and previewing

<!-- specimen: OpeningAndPreviewing -->

### Actions in a context menu

```tsx figure=ContextMenuActions motion

```

### Content in a name

```tsx figure=MatchedLetters

```

### Adapting to width

```tsx figure=NarrowTree widths="24 12" sweep

```

## Accessibility

### Keyboard

| Key                                                       | Action                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                | Moves to the next or previous row.                                              |
| <kbd>Home</kbd>, <kbd>End</kbd>                           | Moves to the first or last row.                                                 |
| <kbd>Page Down</kbd>, <kbd>Page Up</kbd>                  | Moves by the rows that fit in view, less one.                                   |
| <kbd>→</kbd>                                              | Expands a row, or moves to its first child. <kbd>←</kbd> in right-to-left text. |
| <kbd>←</kbd>                                              | Collapses a row, or moves to its parent. <kbd>→</kbd> in right-to-left text.    |
| <kbd>Enter</kbd>                                          | Opens the active row.                                                           |
| <kbd>Space</kbd>                                          | Previews the active row.                                                        |
| A letter or digit                                         | Moves to the next row whose label or text value starts with what was typed.     |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd>        | Opens the context menu; <kbd>Esc</kbd> closes it and returns focus to the tree. |
| Keys with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> | Left to the application.                                                        |
