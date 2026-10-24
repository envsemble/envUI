---
title: Table
summary: 'Semantic data tables on a rounded surface: sorting, resizable columns, selected rows and
  stacked rows in narrow containers.'
status: stable
since: 0.5.0
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
  - text: A few items, each with its own actions, that people don't compare field by field.
    use: List
  - text: A handful of key figures for a dashboard, such as revenue this month.
    see: key-figures
  - text: Items nested inside other items, such as folders and files.
    use: Tree
  - text: Arranging content in columns for layout, such as a set of summary cards.
    use: Grid
components:
  - Table
---

# Table

## Overview

Table's parts are the native table elements, inside a focusable region.

```tsx example=ProjectStatus

```

### Sort by a column

A header can sort the rows by its column: the application sorts them, and each sortable header shows the order.

```tsx example=SortableColumns

```

### Select rows

A selected row takes the selection colors, and a checkbox labelled with the row's name selects it.

```tsx example=SelectRows

```

### Resizable columns

People can resize columns by dragging the boundary at the end of a header, or with the arrow keys; a double click restores the starting widths.

```tsx example=ResizableColumns

```

### Sticky header

The header row can stay in view while the rows scroll beneath it, in a region of a set height.

```tsx example=StickyHeader

```

### Loading

While its rows load, a table shows as its own skeleton, as [Loading](../patterns/loading.md) shows.

## Variants

### Density

Density changes only the rows' padding; controls in cells keep the small height.

```tsx example=RowDensity

```

| Density     | Use for                   |
| ----------- | ------------------------- |
| Extra small | Logs.                     |
| Small       | Scanning many rows.       |
| Medium      | Most tables. The default. |
| Large       | Reading row by row.       |

### Cells

A cell can line its content up for comparing, keep it on one line, or head its row.

```tsx example=NumericColumns

```

| Cell        | Use for                                                       |
| ----------- | ------------------------------------------------------------- |
| Numeric     | Numbers that compare down a column, on the header cell too.   |
| At the end  | Other content at the end of its cell, such as actions.        |
| On one line | Short values that read badly broken, such as names and dates. |
| Row header  | A header cell that heads its row, such as Total.              |

## When to use

```tsx do=NumbersAligned caption="Numbers aligned to the end, so the digits line up down the column."

```

```tsx dont=NumbersUnaligned caption="Numbers aligned to the start: they can't be compared at a glance."

```

```tsx do=NamedStates caption="A Badge that names each state."

```

```tsx dont=ColorOnly caption="States told apart by color alone."

```

### Names

Name every table, with a caption above it or by a heading just before it.

### Opening a row

Open a row through a link or a button in one of its cells, and let the row highlight; never make the whole row pressable.

### Not a spreadsheet

A table has no editing cell by cell and no moving between cells with the arrow keys.

### The first cell

Start each row with the cell that identifies it, which titles the row when rows stack.

### No rows, many rows

Show an [empty state](../patterns/empty-states.md) when there are no rows, and [Pagination](pagination.md) for a long table.

## Anatomy

```tsx anatomy=TableAnatomy enlarge

```

1. **Region** (`env-table-region`)
2. **Caption** (`env-table-caption`, `caption`)
3. **Header row** (`env-table-head`)
4. **Header cell** (`env-table-header-cell`)
5. **Sort button** (`env-table-sort-button`, `onSortChange`)
6. **Row** (`env-table-body > env-table-row:last-child`)
7. **Cell** (`env-table-cell:last-child`)

Not shown: a column's resize handle, and a stacked cell's label.

## Adapting to width

By default the columns keep their width and the region scrolls sideways. A table can stack its rows instead: below 36 rem of its own width, each row becomes a block titled by its first cell, with each other value beside its column's name.

```tsx example=StackedRows widths="22 44"

```

### Sorting while stacked

While the header row is hidden, the application can offer the order another way, here with a select.

```tsx example=SortWhileStacked

```

## Accessibility

### Keyboard

| Key                                                                               | Action                                                                           |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                   | Moves to the scroll region, then to each sort button, resize handle and control. |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> on the region              | Scrolls a table that doesn't fit its region.                                     |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a sort button                             | Asks the application to sort the rows by the column.                             |
| <kbd>←</kbd> or <kbd>→</kbd> on a resize handle                                   | Moves the column's end by 1 percent, in the reading direction.                   |
| <kbd>Shift</kbd>+<kbd>←</kbd> or <kbd>Shift</kbd>+<kbd>→</kbd> on a resize handle | Moves the column's end by 5 percent.                                             |
| <kbd>Home</kbd>, <kbd>End</kbd> on a resize handle                                | Narrows the column to its smallest width, or widens it to its largest.           |

### envUI provides

- Native table elements, with `scope="col"` on header cells by default, and a focusable region named like the table.
- `aria-sort` on sortable headers, and sort buttons named by the header and what pressing does.
- Resize handles as focusable separators with their width in percent.
- `aria-selected` on rows with `selected`.
- Table roles kept while rows stack, with the header row still read and the stacked labels hidden.

### You provide

- A `caption` or an `aria-label` for every table.
- The sorting, the selection control and the row actions, named for the row they act on.
- A `label` on every cell after the first in a stacking table.
- The sort and resize words in the page's language, through `messages.table`.

## In code

### Usage

Table.Root renders a native table in a focusable scroll region, with Table.Head and Table.Body, their Table.Row elements, and Table.HeaderCell and Table.Cell in them. Name it with a `caption`, shown above the rows, or with an `aria-label`, or `aria-labelledby` where a heading above names it; the name reaches the region too. Header cells take `scope="col"` by default; set `scope="row"` on one that heads its row, such as Total.

```tsx source=ProjectStatus

```

#### Cells and density

`numeric` sets tabular figures aligned to the end, for numbers that compare down a column; put it on the header cell too, where a sort arrow then comes before the label. `align` is `start`, or `end` for other content at the end of its cell, such as actions, and the default with `numeric`. `nowrap` keeps short values on one line; with set column widths, what doesn't fit ends with an ellipsis. `density` on Table.Root is `xs`, `sm`, `md`, the default, or `lg`, and changes only the cells' padding; buttons, icon buttons and fields in the cells take the small control height.

```tsx source=NumericColumns

```

#### Sorting

`onSortChange` on a Table.HeaderCell makes the header a sort button, called with the order pressing asks for. The application sorts the rows and gives each sortable header its `sortDirection`, `ascending`, `descending` or `none`, which sets `aria-sort` and the arrow. `sortLabel` names the button.

```tsx source=SortableColumns

```

#### Selecting and opening rows

`selected` on a Table.Row reports `aria-selected` and takes the selection colors, with a bar at its start; pass `selected={false}` to the other rows, and select a row with a Checkbox labelled with its name. `interactive` highlights a row on hover and while focus is inside it, for rows that open through a link or a button in a cell; it adds no behaviour, and the row takes no click handler of its own.

```tsx source=SelectRows

```

#### Resizable columns

With `resizableColumns`, a handle at the end of each header cell but the last moves the boundary to the next column and keeps the table's width. It needs widths in percent, in column order and adding up to 100: `defaultColumnWidths` where the table owns them, or `columnWidths` with `onColumnWidthsChange`. `minColumnWidths` is the smallest width of each column, 5 percent by default. A double click on a handle restores the starting widths, and `resizeLabel` names it.

```tsx source=ResizableColumns

```

#### Sticky header and loading

`stickyHeader` keeps the header row at the top of the region while the rows scroll beneath it; the region then scrolls vertically too, so give it a height through `regionClassName` or the surrounding layout. `skeleton` on Table.Root shows the table as its own skeleton until its rows arrive; render its rows over placeholder items.

```tsx source=StickyHeader

```

#### Stacked rows

By default, `narrowLayout` is `scroll`: the columns keep their width and the region scrolls sideways. With `narrowLayout="stack"`, below `stackBelow`, 36 rem of the region's own width by default, a CSS length or a number of pixels, each body row becomes a block titled by its first cell, with each other cell's `label` beside its value, and the header row is visually hidden. A container query decides it, so the server's markup already stacks. `onStackedChange` reports the change, here to offer a Select for the order while the header row is hidden.

```tsx source=SortWhileStacked

```

### Composition

The region is `env-table-region`, around the caption, `env-table-caption`, the header row, `env-table-head`, with its header cells, `env-table-header-cell`, their sort buttons, `env-table-sort-button`, and resize handles, `env-table-column-resize`, and the body, `env-table-body`, with its rows, `env-table-row`, and cells, `env-table-cell`; a stacked cell's label is `env-table-cell-label`. Table is not a spreadsheet: it has no cell-by-cell editing or arrow-key movement between cells.

## Changelog

- **1.0.0**: The parts are members of the `Table` namespace: `Table` is `Table.Root`, and `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` are `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell` and `Table.Cell`; `TableSortDirection` is `Table.SortDirection`. The page is `table`, after the component. Table.HeaderCell's `onSort` is `onSortChange`, called with the order pressing asks for. A table named by `aria-labelledby` names its scroll region too, which was left unnamed. The sort and resize words come from `messages.table`.
- **0.6.0**: A table with `stickyHeader` no longer swallows the wheel: over a region without a height of its own, or scrolled to an end, the wheel scrolls the page.
- **0.5.0**: Table and its parts, with density, sticky headers, numeric cells and a focusable scroll region; sortable headers with `sortDirection` and `onSort`; resizable columns; selected rows; and stacked rows with `narrowLayout="stack"`, `stackBelow` and `onStackedChange`.
