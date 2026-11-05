---
title: Table
summary: Records in rows and columns, which people can sort and select.
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
examples:
  ProjectStatus:
    role: overview
    stage: shaded
  RowDensity: example
  NumericColumns: example
  TableAnatomy: anatomy
  SortableColumns: example
  SelectRows: example
  ResizableColumns: example
  StickyHeader: example
  StackedRows: example
  NumbersAligned:
    role: do
    caption: Numbers aligned to the end, so the digits line up down the column.
  NumbersUnaligned:
    role: dont
    caption: "Numbers aligned to the start: they can't be compared at a glance."
---

# Table

## Variants

### Density

Density changes only the rows' padding. Controls in cells keep the small height.

```tsx figure=RowDensity motion

```

| Density     | Use for                   |
| ----------- | ------------------------- |
| Extra small | Logs.                     |
| Small       | Scanning many rows.       |
| Medium      | Most tables. The default. |
| Large       | Reading row by row.       |

### Cells

A cell can line its content up for comparing, keep it on one line, or head its row.

```tsx figure=NumericColumns

```

| Cell        | Use for                                                       |
| ----------- | ------------------------------------------------------------- |
| Numeric     | Numbers that compare down a column, on the header cell too.   |
| At the end  | Other content at the end of its cell, such as actions.        |
| On one line | Short values that read badly broken, such as names and dates. |
| Row header  | A header cell that heads its row, such as Total.              |

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

Not shown: a column's resize handle, and a stacked cell's label.

## Behaviour

### Sort by a column

A header can sort the rows by its column. The sorted column shows its order; the other sortable headers show their arrow while the pointer is over the header row or one has keyboard focus, and always on touch.

```tsx figure=SortableColumns motion

```

### Select rows

A selected row takes the selection fill.

- A checkbox labelled with the row's name selects it.
- A row selected without a checkbox in its first cell, such as the one open in a detail pane, also takes a bar at its start.

```tsx figure=SelectRows

```

### Resizable columns

People can resize columns by dragging the boundary at the end of a header, or with the arrow keys. A double click restores the starting widths.

```tsx figure=ResizableColumns motion

```

### Sticky header

The header row can stay in view while the rows scroll beneath it, in a region of a set height.

```tsx figure=StickyHeader motion

```

### Loading

While its rows load, a table shows as its own skeleton, as [Loading](../patterns/loading.md) shows.

<!-- specimen: Loading -->

### Adapting to width

By default the columns keep their width and the region scrolls sideways.

- A table can stack its rows instead where it is narrow, such as on a phone.
- Each row then becomes a compact block. Its first cell titles it, with the next value, such as a status, beside it.
- The other cells sit two to a line, under their columns' names.

```tsx figure=StackedRows widths="44 22" sweep

```

## Rules

Numbers line up and states have names, so rows compare at a glance.

```tsx figure=NumbersAligned

```

```tsx figure=NumbersUnaligned

```

### States

Name each state in words, such as in a Badge, never by color alone.

### Names

Name every table, with a caption above it or by a heading just before it.

### Editing

A table has no editing cell by cell and no moving between cells with the arrow keys.

### Row titles

Start each row with the cell that identifies it, which titles the row when rows stack.

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

## Compose

### Usage

Table's parts are the native table elements, inside a focusable region. Name every Table.Root with a `caption`, an `aria-label` or `aria-labelledby`; the name reaches its scroll region too. Header cells are `scope="col"`; set `scope="row"` on one that heads its row, such as Total. Put `numeric` on a number column's header cell and cells, and `nowrap` on short values such as names and dates.

```tsx source=ProjectStatus

```

`density` on Table.Root changes only the cells' padding; controls in cells take the small height.

A Link in a cell, such as the name that opens a row, takes the cell's text color, so a column of names doesn't read as a column of blue; its underline shows under the pointer and with keyboard focus. A secondary line under a cell's text, `<Text variant="caption">`, keeps to one line and ends in an ellipsis where its column is narrower; give it a `title` with the full text when that can happen.

#### Sorting

The application sorts the rows. `onSortChange` on a header cell makes it a sort button, called with the order pressing asks for, and `sortDirection` shows the current order on every sortable header:

```tsx
<Table.HeaderCell
  sortDirection={sort.column === 'name' ? sort.direction : 'none'}
  onSortChange={(direction) => setSort({ column: 'name', direction })}
>
  Name
</Table.HeaderCell>
```

#### Selecting and opening rows

`selected` on a Table.Row reports `aria-selected`; pass `selected={false}` to the other rows, and select with a Checkbox labelled with the row's name. `interactive` only highlights a row that opens through a link or a button in a cell; the row takes no click handler.

#### Resizable columns

`resizableColumns` needs widths in percent that add up to 100, in column order: `defaultColumnWidths`, or `columnWidths` with `onColumnWidthsChange`, which receives `{ committed }`, a `ResizeDetails`, as Panes' and Sheet's width callbacks do: `false` while people drag and `true` once a change is complete, the widths to save.

```tsx
<Table.Root aria-label="Files" resizableColumns defaultColumnWidths={[40, 25, 20, 15]}>
  …
</Table.Root>
```

#### Sticky header and loading

`stickyHeader` makes the region scroll vertically, so give it a height through `regionClassName` or its layout. `skeleton` shows the table as its own skeleton over placeholder rows until they arrive, without the selection's fill or bar.

#### Stacked rows

`narrowLayout="stack"` stacks the body rows below `stackBelow`, the region's own width. It works by a container query, so server markup already stacks.

- Give every cell after the first a `label`, which titles its value in a stacked row.
- The first labelled value sits beside the title without its label, so put one there that reads on its own, such as a status.
- A cell without a label, such as the row's menu of actions, joins that line too.
- The other values follow two to a line, each under its label.
- The header row, and its sort buttons, are hidden while rows stack. `onStackedChange` tells the application, such as to show a Select for the order instead.

```tsx
<Table.Root aria-label="Invoices" narrowLayout="stack" onStackedChange={setStacked}>
  <Table.Body>
    <Table.Row>
      <Table.Cell>{invoice.number}</Table.Cell>
      <Table.Cell label="Due">{invoice.due}</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

### Composition

Parts the anatomy doesn't show: a column's resize handle, `env-table-column-resize-handle`, and a stacked cell's label, `env-table-cell-label`.

## Changelog

- **1.0.0**: The parts are members of the `Table` namespace: `Table` is `Table.Root`, and `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` are `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell` and `Table.Cell`; `TableSortDirection` is `Table.SortDirection`. The page is `table`, after the component. Table.HeaderCell's `onSort` is `onSortChange`, called with the order pressing asks for. A table named by `aria-labelledby` names its scroll region too, which was left unnamed. The sort and resize words come from `messages.table`. A column's resize handle, `env-table-column-resize`, is `env-table-column-resize-handle`, as every resize handle is named.
- **1.0.0-prerelease.6**: The focus ring of the first and last sortable headers follows the frame's rounded corners.
- **1.0.0-prerelease.6**: An unsorted sortable header shows its arrow only while the pointer is over the header row or the header has keyboard focus, where the pointer hovers; the sorted column's arrow always shows.
- **1.0.0-prerelease.6**: A stacked row is a compact block: the first labelled value, such as a status, sits beside the title without its label, an unlabelled cell such as the row's menu joins them, and the other values follow two to a line, each under its label, in place of a line for each value. The row densities differ by at least 4 px of row height in the compact scale: `xs` and `sm` rows are shorter, and `md` keeps its height.
- **1.0.0-prerelease.6**: A skeleton shows no selection. A row under the pointer takes `--env-color-bg-row-hover`, a step quieter than the selection in light.
- **1.0.0-prerelease.6**: A selected row whose first cell holds a checkbox takes no bar at its start, as the checkbox and the fill say it already; a row selected without one keeps the bar.
- **1.0.0-prerelease.6**: Links and times repeat down the rows, so a Link in a table takes the cell's text color and shows its underline only under the pointer and with keyboard focus, and a RelativeTime its dotted line; in a selected row too. A secondary line keeps to one line, ending in an ellipsis. A skeleton's sortable headers are bars, as the others are.
- **1.0.0-prerelease.5**: A number for `stackBelow` is a number of rem, as on PanelDock, where it was pixels.
- **1.0.0-prerelease.5**: `onColumnWidthsChange` receives `{ committed }` beside the widths, as the other resize callbacks do.
