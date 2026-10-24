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
  - Records compared by several values, such as owner, status and date
  - Sorting records, paging through them or acting on several at once
avoidWhen:
  - text: Items with one or two values each, such as a list of documents and their editors.
    use: List
  - text: Narrowing the rows to the ones people want.
    see: filtering
  - text: Hierarchical items that open and close, such as folders.
    use: Tree
  - text: A table with no rows yet, or none that match.
    see: empty-states
  - text: Deleting rows, with undo or a confirmation.
    see: destructive-actions
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
---

# Data tables

## Overview

The records sit in a [Table](../components/table.md), with their numbers aligned to compare.

```tsx example=SortAndPaginate

```

### Sorting and paging

A press on a sortable header asks for the other order; the application sorts, goes back to the first page and announces the order, "Sorted by updated, descending". [Pagination](../components/pagination.md) shows the range, "1–4 of 6", and shows that it is working while a page loads.

## Variants

### Select and act on several rows

While rows are selected, a bulk bar shows the count and its actions. Archive acts at once with Undo; Delete asks first.

```tsx example=SelectAndBulkActions

```

### Row actions

The name links to the record; the other actions wait in a [Menu](../components/menu.md) named for the row, "More actions for Website refresh".

```tsx example=RowActions

```

### Loading and empty

A first load that takes a moment shows the table as a skeleton over placeholder rows, as in [Loading](loading.md); with no records, an [empty state](empty-states.md) takes its place.

```tsx example=EmptyAndLoading

```

## When to use

### One link per row

Give each row one link, on its name, rather than making the whole row a click target.

### Selecting rows

Select rows with a checkbox in each row, which marks the row selected; a press on the row alone is announced unevenly.

### Controls above the table

Match the size of the controls above the table to its rows: small controls over small rows.

### Content

Name columns with short nouns, "Open tasks", and put the unit in the name, "Size (MB)", not in every cell. Show recent dates as relative times and further ones as dates, and give the count in bulk actions and their confirmation: "Delete 2 projects?".

## Anatomy

```tsx anatomy=DataTableAnatomy

```

1. **Selection** (`env-checkbox`)
2. **Sort** (`env-table-sort-button`)
3. **Record link** (`env-link`)
4. **Numbers** (`env-table-cell[data-numeric]`)
5. **Pagination** (`env-pagination`)

## Adapting to width

A narrow table can show each row as a block with its cells' labels, and a sort menu and a direction button above it sort the rows while they stack.

```tsx example=NarrowTable

```

## Accessibility

<kbd>Tab</kbd> reaches the table's scroll region, then each sort button and control in the cells. Sort and Pagination buttons keep focus as the rows change. When an action clears the selection, focus moves to the header's checkbox; after a row is deleted, to the next row's menu button.

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

## In code

### Usage

Name the Table.Root with `aria-label`. A sortable Table.HeaderCell takes `sortDirection`, `ascending`, `descending` or `none`, and `onSortChange`, which asks for the other order: the application sorts the rows, goes back to the first page and says the order in a Text with `role="status"`. Numeric columns take `numeric` on the header and the cells; the name is a Link, and recent dates a RelativeTime. Pagination takes `page`, `pageSize`, `total`, `onPageChange` and an `aria-label`, and `pending` while a page loads.

```tsx source=SortAndPaginate

```

#### Selection and bulk actions

Each selectable row has a Checkbox labelled with the row's name and `selected` on its Table.Row; the header's Checkbox is `checked="mixed"` while some are selected. A visually hidden `role="status"` says the count. The bulk bar is a Toolbar named for the selection, with the count in its Toolbar.Button labels, "Archive 2 projects": Archive acts at once with Undo in a toast from `useToast`, and Delete opens a ConfirmDialog. As the bar goes with the selection, focus moves to the header's Checkbox.

#### Row actions

The row's other actions are a Menu whose trigger is an IconButton with `aria-label` "More actions for" the row's name. Delete opens a ConfirmDialog whose `finalFocus` is the menu button that opened it, or, once its row is gone, the next row's.

#### Loading and empty

`skeleton` on Table.Root shows the table as a skeleton while it loads, over `placeholders<Row>(3)` rows; set it only once a load has taken 200 ms, so a quick load never flashes it. With no records, render an empty state in the table's place.

```tsx source=EmptyAndLoading

```

#### Density and the controls above

Match the controls above the table to its `density`: `size="sm"` on them over `density="sm"` rows.

### Composition

#### Stacking on narrow screens

`narrowLayout="stack"` on Table.Root shows each row as a block on a narrow screen, with each cell's `label` before its value, so give every cell after the first a `label`. The header row and its sort buttons are hidden while the rows stack, so a Select, "Sort by", and an IconButton that reverses the direction sort the table above it.

```tsx source=NarrowTable

```

## Changelog

- **1.0.0**: The page is on the figure template.
