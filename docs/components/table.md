---
title: Table
summary: 'Semantic data tables on a rounded surface: sorting, resizable columns, selected rows and
  stacked rows in narrow containers.'
status: stable
since: 0.5.0
category: Content & guidance
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
  - People compare values across rows and columns, such as invoices by client, date and amount.
  - People scan, sort or select records that share the same fields, such as files, orders or members.
  - Figures read best side by side with their totals, such as hours and amounts per invoice.
avoidWhen:
  - text: A few items, each with its own actions, that people don't compare field by field.
    use: List
  - text: A handful of key figures for a dashboard, such as revenue this month.
    see: key-figures
  - text: Items nested inside other items, such as folders and files.
    use: Tree
  - text: Arranging content in columns for layout, such as a set of summaries.
    use: Card
  - text: A spreadsheet that people edit cell by cell and move through with the arrow keys.
related:
  - list
  - key-figures
  - badge
  - checkbox
  - pagination
  - empty-state
  - loading
  - typography
components:
  - Table
---

# Table

## Overview

A table shows records that share the same fields in rows and columns, for data people compare, sort and scan. Its parts are the native table elements, on a rounded surface inside a focusable region that scrolls sideways where the columns don't fit.

```tsx example=ProjectStatus

```

### Sort by a column

A header with `onSortChange` becomes a sort button. The application sorts the rows and gives each sortable header its `sortDirection`.

```tsx example=SortableColumns

```

### Select rows

`selected` reports a row's state and takes the selection colors; a Checkbox labelled with the row's name selects it. Pass `selected={false}` to the other rows.

```tsx example=SelectRows

```

### Resizable columns

With `resizableColumns` and column widths in percent, the boundary at the end of a header drags, or moves with the arrow keys; a double click restores the starting widths.

```tsx example=ResizableColumns

```

### Sticky header

`stickyHeader` keeps the header row in view while the rows scroll beneath it; give the region a height.

```tsx example=StickyHeader

```

### Loading

`skeleton` on `Table.Root` shows the table as its own skeleton until its rows arrive; render its rows over placeholder items, as [Loading](../patterns/loading.md) shows.

## Variants

| Option        | Use for                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| `density`     | `xs` for logs, `sm` for scanning, `md` by default, `lg` for reading row by row. |
| `numeric`     | Numbers that compare down a column, on the header cell too.                     |
| `align="end"` | Other content at the end of its cell, such as actions.                          |
| `nowrap`      | Short values that read badly broken, such as names and dates.                   |
| `scope="row"` | A header cell that heads its row, such as Total.                                |

Density changes only the rows' padding; controls in cells keep the small height.

```tsx example=RowDensity

```

`numeric` amounts line up down their column, and a header cell with `scope="row"` heads the totals.

```tsx example=NumericColumns

```

## When to use

```tsx do=NumbersAligned caption="numeric, so the digits line up down the column."

```

```tsx dont=NumbersUnaligned caption="Numbers aligned to the start: they can't be compared at a glance."

```

```tsx do=NamedStates caption="A Badge that names each state."

```

```tsx dont=ColorOnly caption="States told apart by color alone."

```

- Name every table with a `caption`, or an `aria-label` where a heading above names it.
- Open a row through a link or button in a cell, with `interactive` for the highlight, never a click handler on the row.
- Start each row with the cell that identifies it; it titles the row when rows stack.
- Show an [EmptyState](empty-state.md) when there are no rows, and [Pagination](pagination.md) for a long table.

## Anatomy

```tsx anatomy=TableAnatomy

```

1. **Region** (`env-table-region`)
2. **Caption** (`env-table-caption`, `caption`)
3. **Header row** (`env-table-head`)
4. **Header cell** (`env-table-header-cell`)
5. **Sort button** (`env-table-sort-button`, `onSortChange`)
6. **Row** (`env-table-body > env-table-row`)
7. **Cell** (`env-table-cell`)

Not shown: a resize handle, `env-table-column-resize`, and a stacked cell's label, `env-table-cell-label`.

## Adapting to width

By default the columns keep their width and the region scrolls sideways. With `narrowLayout="stack"`, below `stackBelow`, 36 rem of the region's own width, each row becomes a block titled by its first cell, with each other cell's `label` beside its value.

```tsx example=StackedRows widths="22 44"

```

`onStackedChange` reports the change, here to offer a Select for the order while the header row is hidden.

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

## Changelog

- **1.0.0**: The parts are members of the `Table` namespace: `Table` is `Table.Root`, and `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` are `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell` and `Table.Cell`; `TableSortDirection` is `Table.SortDirection`. The page is `table`, after the component. Table.HeaderCell's `onSort` is `onSortChange`, called with the order pressing asks for. A table named by `aria-labelledby` names its scroll region too, which was left unnamed. The sort and resize words come from `messages.table`.
- **0.6.0**: A table with `stickyHeader` no longer swallows the wheel: over a region without a height of its own, or scrolled to an end, the wheel scrolls the page.
- **0.5.0**: Table and its parts, with density, sticky headers, numeric cells and a focusable scroll region; sortable headers with `sortDirection` and `onSort`; resizable columns; selected rows; and stacked rows with `narrowLayout="stack"`, `stackBelow` and `onStackedChange`.
