---
title: Data tables
summary: Show many records in rows and columns that people can sort, page through, select and act on, also on narrow screens.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - data table
  - data grid
  - sortable table
  - bulk actions
  - row actions
  - select rows
  - table pagination
  - responsive table
useWhen:
  - People compare records by several values, such as their owner, status and date.
  - People sort records, page through them, or act on several at once.
avoidWhen:
  - text: Items with one or two values each, such as a list of documents and their editors.
    use: List
  - text: Narrowing the rows to the ones people want.
    see: filtering
  - text: Hierarchical items that open and close, such as folders.
    use: Tree
composes:
  - Table
  - Checkbox
  - Toolbar
  - Menu
  - IconButton
  - Tooltip
  - Button
  - Link
  - Avatar
  - Badge
  - RelativeTime
  - Pagination
  - Select
  - SegmentedControl
  - ConfirmDialog
  - Toast
  - useToast
  - placeholders
  - Surface
  - Column
  - Row
  - Text
related:
  - filtering
  - empty-states
  - destructive-actions
  - table
  - pagination
  - toolbar
---

# Data tables

## Overview

A data table shows records people compare, sort and act on: one link per row on the record's name, sortable columns, numbers aligned to compare, a page of rows at a time, and selection that leads to actions on several rows.

```tsx example=SortAndPaginate

```

### Sorting and paging

A press on a sortable header asks for the other order; the application sorts, goes back to the first page and announces the order in a polite status, "Sorted by updated, descending". [Pagination](../components/pagination.md) shows the range, "1–4 of 6", and takes `pending` while a page loads.

## Variants

### Select and act on several rows

While rows are selected, a bulk bar shows the count and actions that name it, "Archive 2 projects". Archive acts at once with Undo; Delete asks first, as in [destructive actions](destructive-actions.md).

```tsx example=SelectAndBulkActions

```

### Row actions

The name links to the record; the other actions wait in a [Menu](../components/menu.md) named for the row, "More actions for Website refresh".

```tsx example=RowActions

```

### Loading and empty

The first load shows the table as a skeleton over placeholder rows after 200 ms, through `skeleton` on Table.Root, as in [Loading](loading.md); with no records, an [empty state](empty-states.md) takes its place.

```tsx example=EmptyAndLoading

```

## When to use

```tsx do=NumbersAlignedEnd caption="Numbers aligned to the end with numeric, so they compare down the column."

```

```tsx dont=NumbersAlignedStart caption="Numbers aligned to the start: hundreds and tens look alike."

```

- Give each row one link, on its name, rather than making the whole row a click target.
- Select rows with a checkbox beside `selected`; a press on the row alone is announced unevenly.
- Match the controls above the table to its `density`: `size="sm"` over small rows.

### Content

- Name columns with short nouns, "Open tasks", and put the unit in the name, "Size (MB)", not in every cell.
- Recent dates as relative times, further ones as dates.
- The count in bulk actions and their confirmation: "Delete 2 projects?".

## Anatomy

```tsx anatomy=DataTableAnatomy

```

1. **Selection** (`env-checkbox`)
2. **Sort** (`env-table-sort-button`)
3. **Record link** (`env-link`)
4. **Numbers** (`env-table-cell[data-numeric]`)
5. **Pagination** (`env-pagination`)

## Adapting to width

With `narrowLayout="stack"`, a narrow table shows each row as a block with its cells' labels, and a Select and an IconButton above it sort the rows while they stack.

```tsx example=NarrowTable

```

## Accessibility

Tab reaches the table's scroll region, then each sort button and control in the cells. Sort and Pagination buttons keep focus as the rows change. When an action clears the selection, focus moves to the header's checkbox; after a row is deleted, to the next row's menu button.

### envUI provides

- A native table in a focusable region named by its `aria-label` or `caption`, scrolled with the arrow keys.
- `aria-sort` on sortable headers, `aria-selected` on selected rows and `aria-checked="mixed"` on the header's checkbox.
- Pagination in a navigation landmark, whose range is announced.
- Table roles kept while the rows stack.

### You provide

- A name for every table, the sorting and paging, and `sortDirection` on the sorted header.
- A checkbox labelled with the row's name in every selectable row.
- Polite statuses for the sort order and the selection count, and focus after an action removes its control.
- A `label` on every cell after the first in a stacking table.

## Changelog

- **1.0.0**: The page is on the figure template.
