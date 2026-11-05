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
  - text: An application's destinations, such as the pages in a sidebar, one or two levels deep.
    use: NavigationDrawer
  - text: A flat list of items, each with its own actions.
    use: List
  - text: Records that share the same fields and that people compare.
    use: Table
  - text: Sections of a page people show and hide, rather than items of a hierarchy.
    use: Accordion
components:
  - Tree
examples:
  FileTree: overview
  RowDensity:
    role: example
    caption: Counts at the end, a description and a disabled row, at each density.
  TreeAnatomy: anatomy
  ContextMenuActions: example
  NarrowTree: example
---

# Tree

## Variants

### Density

Density changes only the room around a row's text, never the text or the icons.

| Density     | Use for                                               |
| ----------- | ----------------------------------------------------- |
| Extra small | The densest lists.                                    |
| Small       | Dense desktop interfaces, such as files. The default. |
| Medium      | Fewer rows with more room, such as mailboxes.         |
| Large       | The most room, as tall as a touch target.             |

```tsx figure=RowDensity motion

```

## Anatomy

```tsx figure=TreeAnatomy enlarge

```

1. **Tree** (`env-tree`)
2. **Row** (`env-tree-item`)
3. **Chevron** (`env-tree-chevron`, `expandable`)
4. **Icon** (`env-tree-icon`, `icon`)
5. **Label** (`env-tree-label`, `label`)
6. **End** (`env-tree-end`, `end`)
7. **Description** (`env-tree-description`, `description`)

## Behaviour

### Opening and previewing

A click and <kbd>Space</kbd> preview a row, and a double click and <kbd>Enter</kbd> open it to keep, as an editor previews a file in a tab before keeping it.

- A disabled row can be reached with the keyboard, but doesn't open or expand.

<!-- specimen: OpeningAndPreviewing -->

### Actions in a context menu

A right click, a long press, <kbd>Shift</kbd>+<kbd>F10</kbd> or the <kbd>Menu</kbd> key open a menu for a row, or for the empty area. Offer the same actions in visible controls.

```tsx figure=ContextMenuActions motion

```

### Thousands of rows

The tree draws only the rows in view, so it stays quick with tens of thousands of rows.

- It is as tall as the space it is given, and scrolls itself.

### Adapting to width

Rows keep one line: the description gives way first, then the label ends with an ellipsis.

```tsx figure=NarrowTree widths="24 12" sweep

```

## Rules

A row is one item of the hierarchy, and its actions live outside it.

### Controls in rows

Keep buttons, links and fields out of rows: their actions go in the context menu and a toolbar.

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

## Compose

### Usage

```tsx
<Tree
  aria-label="Files"
  items={[
    {
      value: 'src',
      depth: 0,
      label: 'src',
      icon: <IconFolder />,
      expandable: true,
      expanded: true,
    },
    { value: 'src/index.ts', depth: 1, label: 'index.ts', icon: <IconDescription /> },
  ]}
  value={selected}
  onAction={(row) => setSelected(row.value)}
  onExpandedChange={(row, open) => toggle(row.value, open)}
/>
```

`items` are the visible rows in order, flattened: an expanded row is followed by its visible descendants. Each row, a `TreeItem`, has a stable, unique `value`, such as a path, which it carries as `data-id`; its `depth`, 0 for a top-level row, each level indenting it by 0.75 rem; its `label`; and an optional decorative `icon`, a muted `description`, such as a status or a path, `end` content, such as a Badge with a count, a native `tooltip`, `textValue` for type-ahead where the label isn't plain text, and `disabled`.

#### Expanding

`expandable` gives a row a chevron, and `expanded` shows its children, the rows that follow it in `items`. `onExpandedChange` receives the row and its new state from a press on its chevron, <kbd>→</kbd> on a collapsed row and <kbd>←</kbd> on an expanded one, mirrored in right-to-left text; the application updates `items`, removing a collapsed row's descendants.

#### Opening, previewing and selection

`onAction` receives the row people open and `{ preview }`, a `TreeActionDetails`: `true` on a single click and <kbd>Space</kbd>, `false` on a double click and <kbd>Enter</kbd>. Expandable rows call it too, and disabled rows don't. The tree doesn't select by itself: set `value`, the selected row's value, from `onAction`; that row takes the navigation selection colors and scrolls into view when it changes.

#### Context menu

`contextMenu` returns the menu items for the row, or for the tree's empty area when the row is `null`; without it, the browser's own context menu stays. `contextMenuLabel` names the menu.

#### Thousands of rows

```tsx
<div style={{ blockSize: '16rem' }}>
  <Tree
    aria-label="Build logs"
    items={rows}
    onAction={(row) => setSelected(row.value)}
    onExpandedChange={(row, open) => toggle(row.value, open)}
  />
</div>
```

The tree renders only the rows in view, and is as tall as its parent: give the parent a height, or the tree one through `style`. Build `rows` in a `useMemo` from the expanded set, such as 50 folders of 200 logs each, over 10,000 rows when all are open. `className`, `style` and `ref` reach the tree, the element that scrolls and holds focus.

#### Density

`density` is `xs`, `sm`, the default, `md` or `lg`, the rows' block padding: in the comfortable scale `sm` rows are 1.75 rem tall and `md` rows 2.25 rem, and under a coarse pointer every row is at least 2.75 rem.

## Changelog

- **1.0.0**: `selectedId` is `value` and `onOpen` is `onAction`, with `TreeActionDetails`; a TreeItem's `detail` is `description` and its `trailing` is `end`. The context menu's default name comes from `messages.tree`, and the tree takes `ref` and `style`. A row's class is `env-tree-item` (was `env-tree-row`), and `env-tree-detail` and `-trailing` are `env-tree-description` and `-end`; a description keeps more room from its label.
- **1.0.0-prerelease.6**: A row under the pointer takes `--env-color-bg-row-hover`, a step quieter than the selection in light, so the selected row always reads strongest.
- **1.0.0-prerelease.5**: A row is keyed by `value`, which the tree's `value` names, where it had `id`, and its native tooltip is `tooltip`, where it was `title`. `TreeActionOptions` is `TreeActionDetails`. The tree takes the native props, such as `id` and `data-*`.
