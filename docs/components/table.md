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
examples:
  ProjectStatus: overview
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
  NamedStates:
    role: do
    caption: A Badge that names each state.
  ColorOnly:
    role: dont
    caption: States told apart by color alone.
---

# Table

## Variants

### Density

Density changes only the rows' padding; controls in cells keep the small height.

```tsx figure=RowDensity

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

A header can sort the rows by its column, and each sortable header shows the order.

```tsx figure=SortableColumns

```

### Select rows

A selected row takes the selection colors, and a checkbox labelled with the row's name selects it.

```tsx figure=SelectRows

```

### Resizable columns

People can resize columns by dragging the boundary at the end of a header, or with the arrow keys. A double click restores the starting widths.

```tsx figure=ResizableColumns

```

### Sticky header

The header row can stay in view while the rows scroll beneath it, in a region of a set height.

```tsx figure=StickyHeader motion

```

### Loading

While its rows load, a table shows as its own skeleton, as [Loading](../patterns/loading.md) shows.

### Adapting to width

By default the columns keep their width and the region scrolls sideways.

- A table can stack its rows instead where it is narrow, such as on a phone.
- Each row then becomes a block titled by its first cell, with each other value beside its column's name.

```tsx figure=StackedRows widths="44 22" sweep

```

## Rules

Numbers line up and states have names, so rows compare at a glance.

```tsx figure=NumbersAligned

```

```tsx figure=NumbersUnaligned

```

```tsx figure=NamedStates

```

```tsx figure=ColorOnly

```

### Names

Name every table, with a caption above it or by a heading just before it.

### Not a spreadsheet

A table has no editing cell by cell and no moving between cells with the arrow keys.

### The first cell

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
- The sort and resize words in the page's language, through `messages.table`.

## Compose

### Usage

Table's parts are the native table elements, inside a focusable region. Name every Table.Root with a `caption`, an `aria-label` or `aria-labelledby`; the name reaches its scroll region too. Header cells are `scope="col"`; set `scope="row"` on one that heads its row, such as Total. Put `numeric` on a number column's header cell and cells, and `nowrap` on short values such as names and dates.

```tsx source=ProjectStatus

```

`density` on Table.Root changes only the cells' padding; controls in cells take the small height.

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

`resizableColumns` needs widths in percent that add up to 100, in column order: `defaultColumnWidths`, or `columnWidths` with `onColumnWidthsChange`.

```tsx
<Table.Root aria-label="Files" resizableColumns defaultColumnWidths={[40, 25, 20, 15]}>
```

#### Sticky header and loading

`stickyHeader` makes the region scroll vertically, so give it a height through `regionClassName` or its layout. `skeleton` shows the table as its own skeleton over placeholder rows until they arrive.

#### Stacked rows

`narrowLayout="stack"` stacks the body rows below `stackBelow`, the region's own width, by a container query, so server markup already stacks. Give every cell after the first a `label`, which titles its value in a stacked row. The header row, and its sort buttons, are hidden while rows stack: `onStackedChange` tells the application, such as to show a Select for the order instead.

```tsx
<Table.Root aria-label="Invoices" narrowLayout="stack" onStackedChange={setStacked}>
  …
  <Table.Cell label="Due">{due}</Table.Cell>
```

### Composition

Parts the anatomy doesn't show: a column's resize handle, `env-table-column-resize`, and a stacked cell's label, `env-table-cell-label`.

## Changelog

- **1.0.0**: The parts are members of the `Table` namespace: `Table` is `Table.Root`, and `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` are `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell` and `Table.Cell`; `TableSortDirection` is `Table.SortDirection`. The page is `table`, after the component. Table.HeaderCell's `onSort` is `onSortChange`, called with the order pressing asks for. A table named by `aria-labelledby` names its scroll region too, which was left unnamed. The sort and resize words come from `messages.table`.
- **0.6.0**: A table with `stickyHeader` no longer swallows the wheel: over a region without a height of its own, or scrolled to an end, the wheel scrolls the page.
- **0.5.0**: Table and its parts, with density, sticky headers, numeric cells and a focusable scroll region; sortable headers with `sortDirection` and `onSort`; resizable columns; selected rows; and stacked rows with `narrowLayout="stack"`, `stackBelow` and `onStackedChange`.
