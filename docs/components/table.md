---
title: Table
summary: A shell for rows of anything; the frame, the rows, their states and layout are the table's, and what goes in the cells is yours.
status: stable
since: 1.0.0
category: Data display
aliases:
  - data table
  - grid
  - data grid
  - sortable table
  - TableHead
  - TableBody
  - TableRow
  - TableHeaderCell
  - TableCell
useWhen:
  - Values compared across rows and columns, such as invoices by client and date
  - Records with the same fields to scan, sort or select, such as files or orders
  - Figures side by side with their totals, such as hours per invoice
avoidWhen:
  - text: A few items with their own actions, not compared field by field.
    use: List
  - text: Items nested inside other items, such as folders and files.
    use: Tree
  - text: Arranging content in columns for layout, such as a set of summary cards.
    use: Grid
components:
  - Table
examples:
  WorkItems:
    role: overview
    stage: shaded
  RowDensity: example
  NumericColumns: example
  TableAnatomy: anatomy
  SortableColumns: example
  HeaderEndAndTotals: example
  SelectRows: example
  ResizableColumns: example
  StickyHeader: example
  StackedRows: example
  WorkItemsWithParts: example
---

# Table

## Variants

### Density

```tsx figure=RowDensity motion

```

### Cells

```tsx figure=NumericColumns

```

## Anatomy

```tsx figure=TableAnatomy enlarge

```

1. **Region** (`env-table-region`)
2. **Caption** (`env-table-caption`, `caption`)
3. **Header row** (`env-table-head`)
4. **Header cell** (`env-table-header-cell`)
5. **Sort button** (`env-table-sort-button`, `onSortChange`)
6. **Row** (`env-table-body > env-table-row:last-child`)
7. **Cell** (`env-table-cell:last-child`)

## Behaviour

### Sort by a column

```tsx figure=SortableColumns motion

```

### Header actions and totals

```tsx figure=HeaderEndAndTotals

```

### Select rows

```tsx figure=SelectRows

```

### Resizable columns

```tsx figure=ResizableColumns motion

```

### Rows with parts

```tsx figure=WorkItemsWithParts

```

### Sticky header

```tsx figure=StickyHeader motion

```

### Loading

<!-- specimen: Loading -->

### Adapting to width

```tsx figure=StackedRows widths="44 22" sweep

```

## Accessibility

### Keyboard

| Key                                                                               | Action                                                                 |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> on the region              | Scrolls a table that doesn't fit its region.                           |
| <kbd>←</kbd> or <kbd>→</kbd> on a resize handle                                   | Moves the column's end by 1 percent, in the reading direction.         |
| <kbd>Shift</kbd>+<kbd>←</kbd> or <kbd>Shift</kbd>+<kbd>→</kbd> on a resize handle | Moves the column's end by 5 percent.                                   |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> on a resize handle                       | Widens or narrows the column by 5 percent.                             |
| <kbd>Home</kbd>, <kbd>End</kbd> on a resize handle                                | Narrows the column to its smallest width, or widens it to its largest. |
