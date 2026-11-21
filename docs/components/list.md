---
title: List
summary: Items people scan, open or select, shown as rows.
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
  - Items people open, such as agents, documents or messages
  - Options people switch on and off, such as which alerts they get
avoidWhen:
  - text: Data compared across columns, or rows people sort by a value.
    use: Table
  - text: Settings with fields, such as a port or an address, which are a form.
    use: Field
  - text: Facts about one thing, as names and their values.
    use: DescriptionList
components:
  - List
examples:
  Agents: overview
  ListAnatomy: anatomy
  CurrentRow: example
  OpenFromRow: example
  SwitchRows: example
  TitleActions: example
---

# List

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

```tsx figure=CurrentRow

```

### Rows with a menu

```tsx figure=OpenFromRow motion

```

### Rows with switches

```tsx figure=SwitchRows

```

### A title with actions

```tsx figure=TitleActions

```

## Accessibility

### Keyboard

| Key                                                         | Action                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Space</kbd>, <kbd>Enter</kbd>                          | On a handle, lifts the row, or drops a lifted row.           |
| <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Home</kbd>, <kbd>End</kbd> | While a row is lifted, moves it one place, or to either end. |
| <kbd>Esc</kbd>, <kbd>Tab</kbd>                              | While a row is lifted, puts it back.                         |
| <kbd>Alt</kbd>+<kbd>↑</kbd>, <kbd>Alt</kbd>+<kbd>↓</kbd>    | On a row's link or button, moves the row one place at once.  |
