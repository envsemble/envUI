---
title: List
summary: A vertical list of rows, each with a title, a detail and an action.
status: stable
since: 1.0.0
category: Data display
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
  - Related items with a title, a detail and an action each, such as settings
  - Items that each open a page or a document, such as recent plans
  - The list beside an item's details, with its current row marked
avoidWhen:
  - text: Data compared across columns, or rows people sort by a value.
    use: Table
  - text: Destinations in an application's navigation.
    use: NavigationDrawer
  - text: A hierarchy people expand, such as folders.
    use: Tree
components:
  - List
examples:
  SettingsRows: overview
  OnAPane: example
  ExtraContent: example
  RowDensity: example
  ListAnatomy: anatomy
  OpenFromRow: example
  CurrentRow: example
  CheckedRows: example
  Reorder: example
  NarrowRows: example
---

# List

## Variants

### On a pane

```tsx figure=OnAPane

```

### More content

```tsx figure=ExtraContent

```

### Density

```tsx figure=RowDensity motion

```

## Anatomy

```tsx figure=ListAnatomy

```

1. **List** (`env-list`)
2. **Row** (`env-list-item`)
3. **Handle** (`env-list-item-handle`)
4. **Start** (`env-list-item-start`, `start`)
5. **Label** (`env-list-item-label`, `label`)
6. **Description** (`env-list-item-description`, `description`)
7. **End** (`env-list-item-end`, `end`)

## Behaviour

### Rows that open something

```tsx figure=OpenFromRow motion

```

### The current row

```tsx figure=CurrentRow

```

### Checked rows

```tsx figure=CheckedRows motion

```

### Put in order

```tsx figure=Reorder motion

```

### Adapting to width

```tsx figure=NarrowRows widths="32 16" sweep

```

## Accessibility

### Keyboard

| Key                                                         | Action                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Space</kbd>, <kbd>Enter</kbd>                          | On a handle, lifts the row, or drops a lifted row.           |
| <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Home</kbd>, <kbd>End</kbd> | While a row is lifted, moves it one place, or to either end. |
| <kbd>Esc</kbd>, <kbd>Tab</kbd>                              | While a row is lifted, puts it back.                         |
| <kbd>Alt</kbd>+<kbd>↑</kbd>, <kbd>Alt</kbd>+<kbd>↓</kbd>    | On a row's link or button, moves the row one place at once.  |
