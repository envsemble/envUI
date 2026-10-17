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
  - A hierarchy people expand and collapse, such as folders and files in a workspace's sidebar.
  - Thousands of rows, such as a large project's files, which the tree keeps fast by rendering only the rows in view.
  - Rows people preview with a click and open to keep with a double click, as in a desktop editor.
avoidWhen:
  - text: An application's destinations, such as the pages in a sidebar, one or two levels deep.
    use: NavList
  - text: A flat list of items, each with its own actions.
    use: List
  - text: Records that share the same fields and that people compare.
    use: Table
  - text: Sections of content people show and hide in a page.
    use: Disclosure
related:
  - nav-list
  - list
  - menu
  - document-tabs
  - app-shell
  - accessibility
components:
  - Tree
---

# Tree

## Overview

A tree shows a hierarchy of rows that people expand and collapse, such as folders and files. It is built for large hierarchies: it scrolls itself and renders only the rows in view, so thousands of rows stay fast.

The application owns the data. It passes the visible rows in order, flattened, each with its `depth`, and updates them when a row expands or collapses; it also owns the selection and what opening a row does. The tree owns focus, keyboard navigation, type-ahead, scrolling and an optional context menu.

```tsx example=FileTree

```

## Anatomy

1. **Tree**: the scroll container, as tall as its parent, with 0.5 rem inline padding. It is one tab stop.
2. **Row** (an item of `items`): a full-width row with 0.5 rem corners, indented 0.75 rem per level of `depth`.
3. **Chevron** (with `expandable`): points to the inline end, and down while `expanded`. Rows without children keep its place, so labels line up.
4. **Icon** (optional, `icon`): decorative, 1 rem.
5. **Label** (`label`): the row's text on one line, ending with an ellipsis where it doesn't fit; `title` gives the row a native tooltip, such as the full path.
6. **Description** (optional, `description`): muted text after the label, such as a status, which gives way first when the row runs out of room.
7. **End content** (optional, `end`): at the row's end, such as a CounterBadge.
8. **Focus ring**: on the active row, only while the tree has keyboard focus.

## Variants and sizes

| Density | Use for                                                                           |
| ------- | --------------------------------------------------------------------------------- |
| `xs`    | The densest lists: 1.5 rem rows.                                                  |
| `sm`    | Dense desktop interfaces, such as a sidebar of files: 1.75 rem rows. The default. |
| `md`    | Fewer rows with more room, such as mailboxes: 2.25 rem rows.                      |
| `lg`    | 2.75 rem rows.                                                                    |

- Density changes only the rows' padding: the text is 0.875 rem and the icons 1 rem at every density. In the compact [scale](../foundations/scale.md) the text is 0.8125 rem and the rows keep the same 1.25 rem line, so none is taller than in the comfortable one: 1.5, 1.75, 1.875 and 2.125 rem from `xs` to `lg`, and a `sm` row is as tall as a compact menu row.
- On touch screens rows are at least 2.75 rem tall at every density.
- Rows take the navigation text color, with icons and chevrons in the muted navigation icon color. Hover and press show a translucent state layer; the selected row takes the navigation selection colors, its icon and chevron too, with their own hover and pressed tokens.

## States and behaviour

- **Visible rows**: `items` holds the rows that show, in order: an expanded row is followed by its visible descendants. Collapsing a row removes them from `items`; the tree reads `aria-level`, `aria-posinset` and `aria-setsize` from the order and the depths.
- **Expanding**: a press on the chevron, <kbd>→</kbd> on a collapsed row and <kbd>←</kbd> on an expanded one call `onExpandedChange` with the row and its new state; the application updates `items`. In right-to-left text the arrow keys are mirrored, and so is the chevron.
- **Opening and previewing**: a single click and <kbd>Space</kbd> call `onAction` with `preview: true`, and a double click and <kbd>Enter</kbd> with `preview: false`, as an editor previews a file in a tab before keeping it. Rows that expand call `onOpen` too, so the application decides whether that toggles them or opens an index document. A press on the chevron only expands.
- **Selection**: `value` marks the selected row, which takes the selection colors and scrolls into view, to the middle, when it changes, once its row is among `items` and the tree has a size. The tree doesn't select by itself; set `selectedId` from `onOpen`.
- **Focus**: the tree keeps focus and points `aria-activedescendant` at the active row, which the arrow keys move; the active row stays rendered while it scrolls out of view. It starts at the selected row and falls back to the selected or the nearest row when its row leaves `items`. A click makes a row active without the focus ring.
- **Type-ahead**: typing moves to the next row whose label starts with the typed text; keys typed within 0.6 s join, and a repeated first letter cycles through its matches. Rows match their `label` where it is a string, or their `textValue`.
- **Disabled rows**: `disabled` dims a row and reports `aria-disabled`; the keyboard still reaches it, but it neither opens nor expands.
- **Context menu**: with `contextMenu` the tree opens a ContextMenu on right click, long press, <kbd>Shift</kbd>+<kbd>F10</kbd> and the <kbd>Menu</kbd> key, for the row under the pointer or the active row, or for the empty area with `null`. Right click makes its row active, and once the menu closes, focus returns to the tree.
- **Keys for the application**: keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application, such as <kbd>Alt</kbd>+<kbd>←</kbd> for going back.
- **Size and scrolling**: the tree is as tall as its parent and scrolls itself, so give it a parent with a height, such as AppShell's `sidebarContent`. Only the rows in view, eight more on either side and the active row are in the document; a row's height is measured from the density, enlarged text and coarse pointers, also inside a dialog that scales in.

## Content guidelines

- Name rows as their items are named, such as file names, and keep them short; put a full path in `title` where names truncate.
- Use `description` for one short fact, such as "Draft" or "Shared", and `end` for a count or a Badge.
- Give folders and documents icons that tell them apart, such as Folder and Description.
- Name the tree after what it holds, such as "Files" or "Mailboxes".

## Do and don't

### Do

- Give the tree a parent with a height, and only the visible rows as `items`.
- Keep ids stable across renders, such as paths, so focus and selection stay on their rows.
- Offer the actions of the context menu in visible controls too, such as buttons above the tree.
- Use the preview and open distinction where opening a row costs something, such as a tab.

### Don't

- Don't use a tree for an application's few destinations; use [NavList](../components/nav-list.md).
- Don't put buttons, links or fields inside rows; rows are not focusable, and their actions belong in the context menu and a toolbar.
- Don't make a context menu the only way to reach an action.
- Don't pass collapsed rows' descendants in `items`.

## Accessibility

### Keyboard

| Key                                                       | Action                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>           | Moves focus to and from the tree; the tree is one tab stop, and its active row has the focus ring.         |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                | Moves to the next or previous row, stopping at the ends.                                                   |
| <kbd>Home</kbd>, <kbd>End</kbd>                           | Moves to the first or last row.                                                                            |
| <kbd>Page Down</kbd>, <kbd>Page Up</kbd>                  | Moves by the rows that fit in view, less one.                                                              |
| <kbd>→</kbd>                                              | Expands a collapsed row; on an expanded row, moves to its first child. <kbd>←</kbd> in right-to-left text. |
| <kbd>←</kbd>                                              | Collapses an expanded row; on another row, moves to its parent. <kbd>→</kbd> in right-to-left text.        |
| <kbd>Enter</kbd>                                          | Opens the active row.                                                                                      |
| <kbd>Space</kbd>                                          | Previews the active row; while typing ahead, adds a space to the typed text.                               |
| A letter or digit                                         | Moves to the next row whose label starts with the characters typed.                                        |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd>        | Opens the context menu for the active row; <kbd>Esc</kbd> closes it and returns focus to the tree.         |
| Keys with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> | Left to the application.                                                                                   |

### envUI provides

- The tree pattern: a `tree` named by `aria-label`, and `treeitem` rows with `aria-level`, `aria-posinset`, `aria-setsize`, `aria-expanded` on rows that expand, `aria-selected` and `aria-disabled`.
- Focus management with `aria-activedescendant`: one tab stop, the active row kept in the document and scrolled into view, and its focus ring only for keyboard focus.
- Each row's description and end content read with its label, and decorative icons and chevrons hidden from assistive technology.
- The context menu's keys, with its row as the target, and focus back on the tree when it closes.
- Rows 2.75 rem tall on coarse pointers.

### You provide

- An `aria-label` for every tree, and its menu's name in the page's language, through EnvUIProvider's `messages.tree.actions` or `contextMenuLabel`.
- The visible rows, their expansion and the selection, and what opening and previewing do.
- A `textValue` for rows whose label is not plain text, so type-ahead finds them.
- Visible controls for the context menu's actions.
- An `aria-label` on end content whose number alone doesn't say what it counts, such as "12 unread" on a CounterBadge.

## Examples

### Actions in a context menu

Right-click a row, or press <kbd>Shift</kbd>+<kbd>F10</kbd>, for its actions, and the empty area for New document. The buttons above the tree offer the same actions.

```tsx example=ContextMenuActions

```

### Row density

`density="md"` gives the rows more room than the default `sm`, here with counts at the end, a detail and a disabled mailbox. Only the padding changes; the text and icons stay the same.

```tsx example=RowDensity

```

### Thousands of rows

Expanding every folder makes over 10,000 rows; only those in view are in the document.

```tsx example=ThousandsOfRows

```

## Changelog

- **1.0.0**: `selectedId` is `value` and `onOpen` is `onAction`, with `TreeActionOptions` (was `TreeOpenOptions`); a TreeItem's `detail` is `description` and its `trailing` is `end`. The context menu's default name comes from `messages.tree`, and the tree takes `ref` and `style`. A row's class is `env-tree-item` (was `env-tree-row`), and `env-tree-detail` and `-trailing` are `env-tree-description` and `-end`.
- **0.5.0**: Tree: a virtualized tree for thousands of rows, with keyboard navigation, type-ahead, preview and open callbacks, a context menu and two densities. Keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application.
