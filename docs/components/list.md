---
title: List
summary: A vertical list of connected rows, each with a title, a detail and an action, that can open what it names, show the current one and be put in order.
status: stable
since: 0.1.0
category: Layout & surfaces
aliases:
  - GroupedRows
  - Row
  - ConnectedRows
  - list item
  - grouped list
  - settings list
  - rows
  - item list
  - list view
  - reorderable list
  - sortable list
  - drag and drop list
  - selectable rows
useWhen:
  - Related items with a title, a short detail and an action each, such as the sections of a settings page.
  - Items that each open a page or a document, such as recent plans (`interactive`).
  - A short set of results or members under a search field.
  - The list beside an item's details, with its current row marked (`selected`).
  - Items people put in their own order, such as the slides of a deck or an agenda (`onReorder`).
avoidWhen:
  - text: Data compared across columns, or rows people sort by a value.
    use: Table
  - text: Destinations in an application's navigation.
    use: Drawer
  - text: A hierarchy people expand, such as folders.
    use: Tree
  - text: One choice from a few options shown as rows.
    use: Radio
  - text: Content about one subject that stands on its own.
    use: Card
related:
  - card
  - table
  - drawer
  - surface
  - radio
  - spacing
components:
  - List
---

# List

## Overview

A list is a column of connected rows, each with a label, a description and an action at its end.

```tsx example=SettingsRows

```

### Rows that open something

With `interactive`, the link marked `data-row-target` covers its row. The row's other controls take `position: relative` to stay above it.

```tsx example=OpenFromRow

```

### The current row

`selected` marks the row whose details show beside the list, with `aria-current`.

```tsx example=CurrentRow

```

### Checked rows

A checkbox in `start` chooses rows for an action on several at once.

```tsx example=CheckedRows

```

### Put in order

`onReorder` gives each row a handle: drag it, or press <kbd>Space</kbd> and move the row with the arrow keys. The list reports the move, and the application moves the item.

```tsx example=Reorder

```

## Variants

```tsx example=OnAPane caption="In a muted Surface that holds only lists, the rows take the raised fill."

```

```tsx example=ExtraContent caption="Children follow the description, such as a status."

```

`density`, from `xs` to `lg`, changes only the rows' block padding.

## When to use

```tsx do=OneTarget caption="One link per row, which covers the row."

```

```tsx dont=SeveralTargets caption="Several links in a row: a press could open any of them."

```

### Content

```tsx do=SameActions caption="The same kind of action at the end of every row."

```

```tsx dont=MixedActions caption="A different action on each row: people can't scan them."

```

- Keep the description to one fact that tells items apart, such as who changed it and when.
- Name a repeated action after its row, such as More actions for Roadmap.

## Anatomy

```tsx anatomy=ListAnatomy

```

1. **List** (`env-list`)
2. **Row** (`env-list-item`)
3. **Handle** (`env-list-item-handle`)
4. **Start** (`env-list-item-start > env-avatar`, `start`)
5. **Content** (`env-list-item-content`, `label`)
6. **Description** (`env-list-item-content > small`, `description`)
7. **Action** (`env-list-item > env-button:last-child`, `action`)

## Adapting to width

Labels and descriptions wrap, and an action that no longer fits beside the text moves below it.

```tsx example=NarrowRows widths="16 32"

```

## Accessibility

### Keyboard

| Key                                                                      | Action                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                          | Moves through the handles, links and controls of rows. |
| <kbd>Space</kbd>, <kbd>Enter</kbd> on a handle                           | Lifts the row, or drops a lifted row.                  |
| <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Home</kbd>, <kbd>End</kbd> while lifted | Moves the row one place, or to either end.             |
| <kbd>Esc</kbd>, <kbd>Tab</kbd> while lifted                              | Puts the row back.                                     |
| <kbd>Alt</kbd>+<kbd>↑</kbd>, <kbd>Alt</kbd>+<kbd>↓</kbd> on a row target | Moves the row one place at once.                       |

### envUI provides

- A native `ul` of `li` rows, announced with their count.
- `aria-current="true"` on the current row's target.
- Handles named Reorder and the row's label, described by how to move without a pointer.
- A polite announcement of each step of a move, with the position and the count.

### You provide

- A name for the list where its heading doesn't give one.
- One link or button marked `data-row-target` in an interactive row, with `draggable={false}` on a link.
- Names for a start checkbox and for actions, which say which row they act on.
- `textValue` on a reorderable row whose label isn't plain text, and the move in `onReorder`.

## Changelog

- **1.0.0**: List.Item takes `selected` for the current row, marked in the server's HTML, `start` for content before the label, such as an avatar or a checkbox, and `textValue`; List.Root takes `onReorder`, which moves rows by a drag handle, by keyboard, by a press and by pointer, with announcements. `GroupedRows` is `List.Root` and `Row` is `List.Item`, with the `env-list` and `env-list-item` classes; the page is `list`. List.Item's `title` is `label` and its `detail` is `description`. List.Root's `contrast` is gone: put the list directly in `<Surface background="muted" padding={3}>`, where its rows take the raised fill.
- **0.5.0**: `interactive` rows, which react to hover, focus inside them and presses, and open from anywhere through a `data-row-target`.
- **0.1.0**: GroupedRows and Row, with connected corners.
