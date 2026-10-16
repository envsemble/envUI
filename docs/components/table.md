---
title: Table
summary: 'Semantic data tables on a rounded surface: sorting, resizable columns, selected rows and
  stacked rows in narrow containers.'
status: beta
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
    use: Stat
  - text: Items nested inside other items, such as folders and files.
    use: Tree
  - text: Arranging content in columns for layout, such as a set of summaries.
    use: Card
  - text: A spreadsheet that people edit cell by cell and move through with the arrow keys.
related:
  - list
  - stat
  - badge
  - checkbox
  - pagination
  - empty-state
  - skeleton
  - typography
components:
  - Table
---

# Table

## Overview

A table shows records that share the same fields in rows and columns, for data people compare, sort and scan. Its parts render the native table elements, so screen readers move through it by row and column and announce each cell's header. The table sits on a rounded surface inside a focusable region that scrolls sideways when the columns don't fit, so a wide table never widens the page.

The `Table` namespace has six parts:

- **Table.Root** renders the table and its scroll region, and holds what applies to every row: its name, density, sticky header, column widths and narrow layout.
- **Table.Head** and **Table.Body** hold the header rows and the data rows.
- **Table.Row** is a row, which can highlight on hover or be selected.
- **Table.HeaderCell** heads a column, or a row with `scope="row"`, and can sort its column.
- **Table.Cell** is a data cell, with a `label` that names its value while rows stack.

```tsx example=ProjectStatus

```

## Anatomy

1. **Scroll region** (`Table.Root`): a region named like the table, with a 0.0625 rem border and 1 rem corners; it is a tab stop and scrolls the table sideways when the columns don't fit. `regionClassName` styles it, for example to give it a height.
2. **Caption** (optional, `caption`): a visible name above the rows, in the 1 rem section heading style.
3. **Header row** (`Table.Head`, `Table.Row`, `Table.HeaderCell`): 0.875 rem muted labels, weight 500, on one line over the neutral fill. Header cells head their column with `scope="col"` by default.
4. **Sort button** (with `onSort` on a header cell): fills the header cell, with the label and an arrow for `sortDirection`.
5. **Resize handle** (with `resizableColumns` on the root): at the inline end of every header cell but the last, 0.75 rem wide and 1.5 rem on touch screens, with a line on the column boundary.
6. **Body rows** (`Table.Body`, `Table.Row`): separated by hairlines; the first body row meets the header without one. `interactive` and `selected` change their fill.
7. **Cells** (`Table.Cell`): body text, aligned with `align` and `numeric` and kept on one line with `nowrap`. A `<Text variant="caption">` after the main text adds a quieter second line, such as a team under a project.
8. **Row header** (optional, `Table.HeaderCell` with `scope="row"` in a body row): heads its row, such as a total, in the body text at weight 500 without the fill.
9. **Selection bar**: a 0.1875 rem bar at the start of a selected row.

While a stacking table stacks its rows, each row is a block titled by its first cell, and each other cell shows its **label** (`label` on `Table.Cell`) before its value.

## Variants and sizes

| Density    | Use for                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------- |
| `standard` | Most tables, with 0.75 rem by 1 rem cell padding and 0.9375 rem text.                     |
| `compact`  | Dense data people scan many rows of, with 0.5 rem by 0.75 rem padding and 0.875 rem text. |

| Cell layout   | Use for                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `numeric`     | Numbers that compare down a column: tabular figures aligned to the end. |
| `align="end"` | Other content that belongs at the end of its cell, such as actions.     |
| `nowrap`      | Short values that read badly when broken, such as names, dates and IDs. |
| `scope="row"` | A header cell that heads its row, such as Total.                        |

- **Rows**: a row of one line of text is about 2.8 rem tall, and 2.2 rem in a compact table. Buttons, icon buttons and fields in compact cells take the 2 rem compact height, and on touch screens the 2.75 rem touch height, as everywhere else.
- **Numbers**: set `numeric` on the column's header cell as well as on its cells, so the header lines up with the numbers.
- **Widths**: without widths the browser sizes the columns to their content, and the table fills its region. `columnWidths` or `defaultColumnWidths`, in percent of the table's width adding up to 100, fix the columns instead: long words wrap anywhere and `nowrap` cells end with an ellipsis rather than widening the table. Header labels stay on one line; in a sortable or resizable header a label that doesn't fit ends with an ellipsis.
- **Sticky header**: `stickyHeader` keeps the header row at the top of the region while the rows scroll beneath it, on an opaque fill that covers them. The region then scrolls vertically too, so give it a height through `regionClassName` or the surrounding layout. A caption scrolls away with the rows. Over a region that has nothing to scroll, or that is scrolled to an end, the wheel scrolls the page.

## States and behaviour

- **Scroll region**: the region is a tab stop with the table's name and the shared focus ring, so keyboard users can focus it and scroll a table that doesn't fit. Content positioned inside cells, such as visually hidden text, stays inside the region and scrolls with it, so it never widens the page.
- **Sorting**: a header cell with `onSort` is a button across the whole cell, with its label and then an arrow for `sortDirection`: up for ascending, down for descending, and a neutral double arrow while the column isn't sorted. In a `numeric` or end-aligned column the arrow comes first, so the label lines up with the numbers. Hover and press show the state layer, and a sorted header takes the primary text color. The header reports `aria-sort`, `none` while unsorted, and the button's name says what pressing it does: "Name sort ascending", or "Name sort descending" while the column is sorted ascending; `sortLabel` replaces it. A header named with `aria-label` or `aria-labelledby`, such as one that shows only an icon, lends that name to its sort button and resize handle.
- **The application sorts**: pressing a sort button calls `onSort` and nothing else. The application sorts the rows and passes each sortable header its new `sortDirection`. Without `onSort`, `sortDirection` only sets `aria-sort`.
- **Interactive rows**: `interactive` highlights a row on hover and while focus is inside it, for rows that open something through a link or button in a cell. It adds no behavior: the link or button does the work.
- **Selected rows**: `selected` reports `aria-selected` and takes the navigation selection color, with a bar at the start of the row; an interactive selected row takes the selected hover color. Pass `selected={false}` to the other rows of a table whose rows can be selected, so every row exposes its state. Screen readers announce row selection unevenly in tables, so pair it with a control people select with, such as a Checkbox in the first cell, whose state they always hear.
- **Resizable columns**: with `resizableColumns` and `columnWidths` or `defaultColumnWidths`, each header cell but the last has a resize handle. Dragging it, or the arrow keys on it, move the boundary between its column and the next one, so the other columns and the table's width stay as they are. The arrow keys move it by 1 percent and by 5 with <kbd>Shift</kbd>; <kbd>Home</kbd> and <kbd>End</kbd> go to the column's smallest and largest width, which keep both columns at least `minColumnWidths`, 5 percent by default. Double-clicking a handle restores the starting widths: `defaultColumnWidths`, or the widths a controlled table started with.
- **While resizing**: the boundary line shows while the header row is hovered, darkens over the handle, and takes the focus ring color while the handle has focus or is dragged. During a drag the pointer keeps the resize cursor and no text is selected; a drag the browser cancels, such as one taken over for scrolling, returns to where it began. In right-to-left text the handle sits at the left edge of its header and the keys and the drag follow the reading direction. `onColumnWidthsChange` receives every column's width after each change; with `columnWidths` the application keeps them, and with `defaultColumnWidths` the table does.
- **Narrow layouts**: `narrowLayout="scroll"`, the default, keeps the columns and scrolls sideways. `narrowLayout="stack"` follows the width of the table's region, not the window: below `stackBelow`, 36 rem by default, each body row becomes a block. Its first cell is the row's title, at weight 500, and the other cells show their `label` beside their value. The labels share a column as wide as the longest one, up to 10 rem, so the values line up, and long values, such as an address, wrap within the row. `stackBelow` takes any CSS length, such as `60rem` for a table with seven sortable columns, or a number of pixels.
- **Stacked rows**: the header row is visually hidden but still read by assistive technology, and appears while a sort button in it has keyboard focus. Resize handles are hidden, and a selected row keeps its bar as a block. The table, its rows and its cells keep their roles whatever their display.
- **Reporting the layout**: `onStackedChange` is called with `true` when the rows stack and `false` when the columns return, also when a table leaves while its rows stack. The region has `data-stacked` meanwhile, so styles can follow without repeating the width. Use it to offer another sort control while the header row is hidden.
- **Measuring**: the table measures its region once it is in the document, before the browser paints a client render. Server-rendered markup shows the columns until the page hydrates, and a narrow table then stacks. A hidden table, such as one in a hidden tab panel, has nothing to measure and keeps its layout until it shows again.

## Content guidelines

- Name every table: a `caption` when nothing on the page names it yet, or an `aria-label` when a heading above it does.
- Write headers as short nouns in sentence case, such as "Owner" or "Open tasks". When every value in a column shares a unit, name it in the header, such as "Size (MB)", and keep the cells to numbers.
- Start each row with the cell that identifies it, such as a name or an invoice number. It titles the row when rows stack, and it is where a row's link belongs.
- Use `numeric` for numbers people compare, such as amounts, counts and durations, with the same precision in every row so the digits line up. Identifiers such as invoice or phone numbers read as text and keep the start alignment.
- Format numbers, amounts and dates for the reader's locale, and use one date format throughout a column.
- Put secondary detail in a quieter second line with `<Text variant="caption">`, such as a team under a project, rather than in a column of its own.
- Show states with a [Badge](../components/badge.md) that names them, not with color alone.
- Write a word such as "None" in a cell without a value, rather than leaving it blank.
- When there are no rows, show an [EmptyState](../components/empty-state.md) in place of the table that says why and offers the next action; tell an empty list apart from a filter that matches nothing. While the rows load, show [skeletons in a LoadingState](../components/skeleton.md) in the shape of the rows. The [loading pattern](../patterns/loading.md) compares the other ways to show progress.
- Show a long table a page at a time with [Pagination](../components/pagination.md).

## Do and don't

### Do

- Name every table with a `caption` or an `aria-label`.
- Set `numeric` on a column of numbers, on its header cell and on its cells.
- Open a row through a link or button in one of its cells, and add `interactive` for the highlight.
- Pair `selected` with a Checkbox labelled with the row's name, and pass `selected={false}` to the other rows.
- Give a table with a sticky header a height, and a table with many columns a wider `stackBelow`.
- Offer another sort control while the rows stack, where sorting matters on small screens.

### Don't

- Don't use a table to lay out content, or for a few items with actions; use a [Card](../components/card.md) or a [List](../components/list.md).
- Don't put a click handler on a row instead of a link or button in a cell; keyboard and screen reader users can't reach it.
- Don't set `sortDirection` without sorting the rows: the table only shows and announces the order.
- Don't leave out `label` on the cells after the first in a stacking table; their values would show without a name.
- Don't repeat the stacking width in your own media queries; follow `data-stacked` or `onStackedChange`.

## Accessibility

### Keyboard

| Key                                                                               | Action                                                                                                                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                   | Moves focus to the table's scroll region, then to each sort button, resize handle and control in the cells, in order. While rows stack, a focused sort button shows the header row. |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> on the region              | Scrolls a table that doesn't fit its region, as the browser scrolls a focused scroll area.                                                                                          |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a sort button                             | Asks the application to sort the rows by the column.                                                                                                                                |
| <kbd>←</kbd> or <kbd>→</kbd> on a resize handle                                   | Moves the column's end by 1 percent: <kbd>→</kbd> widens the column in left-to-right text, and <kbd>←</kbd> in right-to-left text.                                                  |
| <kbd>Shift</kbd>+<kbd>←</kbd> or <kbd>Shift</kbd>+<kbd>→</kbd> on a resize handle | Moves the column's end by 5 percent.                                                                                                                                                |
| <kbd>Home</kbd> on a resize handle                                                | Narrows the column to its smallest width.                                                                                                                                           |
| <kbd>End</kbd> on a resize handle                                                 | Widens the column to its largest width, leaving the next column its smallest.                                                                                                       |

### envUI provides

- Native `table`, `caption`, `thead`, `tbody`, `tr`, `th` and `td` elements, with `scope="col"` on header cells by default.
- A focusable `role="region"` around the table, named by the caption or the `aria-label`, so keyboard users can scroll it, with the shared focus ring.
- `aria-sort` on sortable headers, and sort buttons named by the header and what pressing them does.
- Resize handles as focusable vertical separators with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a percent `aria-valuetext`, named "Resize" and the header, and 1.5 rem wide on touch screens.
- `aria-selected` on rows with `selected`.
- Explicit table, row group, row, header and cell roles on a stacking table, since a change of display can drop them. The header row stays available to assistive technology while it is visually hidden, and the stacked labels are hidden from it, since it reads the column headers.
- Sort arrows hidden from assistive technology.

### You provide

- A `caption` or an `aria-label` for every table.
- The sorting: `onSort` sorts the rows and sets each sortable header's `sortDirection`.
- An `aria-label` or `aria-labelledby` on a header that shows only an icon, and `sortLabel` and `resizeLabel` in the page's language.
- A control that selects a row, such as a Checkbox labelled with the row's name, beside `selected`.
- Links and buttons for row actions, named for the row they act on, such as "More for Roadmap".
- `scope="row"` on a header cell at the start of a body row.
- A `label` on every cell after the first in a stacking table, and another sort control while its rows stack.

## Examples

### Numbers and totals

`numeric` cells use tabular figures aligned to the end, so amounts compare down the column. A header cell with `scope="row"` heads the totals row.

```tsx example=NumericColumns

```

### Sort by a column

A header with `onSort` becomes a sort button. The application keeps the order, sorts the rows and gives each sortable header its `sortDirection`.

```tsx example=SortableColumns

```

### Select rows

A Checkbox in the first cell selects the row; `selected` reports it and takes the selection colors. Every row gets `selected`, `true` or `false`.

```tsx example=SelectRows

```

### Compact rows

Compact rows fit more data in the same height, and the buttons in their cells take the compact height.

```tsx example=CompactDensity

```

### Sticky header

The header row stays in view while the rows scroll beneath it. The region needs a height, here from the layout around it.

```tsx example=StickyHeader

```

### Resizable columns

Drag the boundary at the end of a header, or focus it and press <kbd>←</kbd> or <kbd>→</kbd>; double-click it to restore the starting widths. A name too long for its column ends with an ellipsis.

```tsx example=ResizableColumns

```

### Stack rows in a narrow container

In a region narrower than `stackBelow`, each row becomes a block titled by its first cell, with the other cells' labels beside their values.

```tsx example=StackedRows

```

### Sort while rows stack

The header row is hidden while rows stack, so `onStackedChange` shows a Select for the order meanwhile. The table and the Select share the same sort state.

```tsx example=SortWhileStacked

```

## Changelog

- **1.0.0**: The parts are members of the `Table` namespace: `Table` is `Table.Root`, and `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` are `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell` and `Table.Cell`; `TableSortDirection` is `Table.SortDirection`. The page is `table`, after the component.
- **0.6.0**: A table with `stickyHeader` no longer swallows the wheel: over a region without a height of its own, or scrolled to an end, the wheel scrolls the page.
- **0.5.0**: Table and its parts, with density, sticky headers, numeric cells and a focusable scroll region; sortable headers with `sortDirection` and `onSort`; resizable columns; selected rows; and stacked rows with `narrowLayout="stack"`, `stackBelow` and `onStackedChange`.
