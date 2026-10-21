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
  - EmptyState
  - LoadingState
  - Skeleton
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

Use this pattern to show records people compare, sort and act on: a table with a link to each record, sortable columns, numbers aligned to compare, a page of rows at a time, and selection that leads to actions on several rows. On a narrow screen, the rows stack and a control above the table sorts them.

```tsx example=SortAndPaginate

```

## Anatomy

1. **Table:** a [Table.Root](../components/table.md) named with `aria-label` or a `caption`, with `Table.Head`, `Table.Body`, rows and cells.
2. **Sorting:** `onSortChange` and `sortDirection` on the header cells of the columns people sort, such as the name and the date. The application sorts the rows.
3. **Values:** a [Link](../components/link.md) on the record's name, an [Avatar](../components/avatar.md) beside a person, a [Badge](../components/badge.md) for a status and [RelativeTime](../components/relative-time.md) for a recent date. Numbers that compare down a column take `numeric`.
4. **Pagination:** [Pagination](../components/pagination.md) with `page`, `pageSize` and `total` under the table, at its end.
5. **Selection:** a [Checkbox](../components/checkbox.md) in a narrow first column, labelled with the row's name, `selected` on the row, and a checkbox in the header that is `'mixed'` while some rows are selected.
6. **Bulk bar:** above the table while rows are selected, the count, then the actions on the selection, each naming the count. Icon-only actions form a [Toolbar.Root](../components/toolbar.md) of `Toolbar.Button`s; labelled actions sit in a [Row](../components/row.md).
7. **Row actions:** a [Menu](../components/menu.md) at the end of the row, opened by an [IconButton](../components/button.md) named for the row, with a [Tooltip](../components/tooltip.md).
8. **Confirmation and undo:** a [ConfirmDialog](../components/confirm-dialog.md) for deleting, and a toast from [useToast](../components/toast.md) with "Undo" for archiving, as in [Confirmation and destructive actions](destructive-actions.md).
9. **Loading and empty:** a [LoadingState](../components/skeleton.md) of Skeleton rows while the rows load, and an [EmptyState](../components/empty-state.md) in place of the table when there are none.
10. **Narrow screens:** `narrowLayout="stack"`, a `label` on every cell after the first, and a [Select](../components/select.md) with an IconButton that sort the rows while they stack.

## States and behaviour

- **Sorting.** A press on a sortable header asks for the other order of that column: descending once it is sorted ascending, else ascending. Sort the rows, set its `sortDirection`, go back to the first page, and announce the new order in a polite status, "Sorted by updated, descending".
- **Paging.** Pagination shows the range, "1–4 of 6", and moves a page at a time; the application shows that page's rows. Set `pending` while a page loads from a server.
- **Density.** `density` changes only the rows' padding. Controls above the table match it: small controls, `size="sm"`, over `density="sm"` or `"xs"` rows.
- **Selecting.** Each row's checkbox selects it, and the row shows it is selected. The header's checkbox is checked when every row is, `'mixed'` when some are, and a press on it selects all, or none once all are.
- **Bulk actions.** The bulk bar shows while rows are selected and goes with the selection. Put the count in every action, "Archive 2 projects", "Delete 2 projects…". Archive acts at once with "Undo" in the toast; Delete asks first. When an action ends the selection, move focus to the header's checkbox.
- **Row actions.** The name links to the record; the other actions wait in the row's menu. envUI has no danger tone for a menu item yet: label the item with the consequence, "Delete project…", put it last after a separator, and confirm it with a ConfirmDialog. After the delete, move focus to the next row's menu button, or, once the last row has gone, to the empty state's action.
- **Loading.** The first load shows Skeleton rows in the shape of the table after 200 ms, as in [Loading](loading.md). A refresh keeps the rows in place.
- **Empty.** With no records, an EmptyState takes the table's place, with the first action; with no results from filters, see [Filtering and search](filtering.md).
- **Narrow screens.** With `narrowLayout="stack"`, a table narrower than `stackBelow` shows each row as a block, its first cell first and the others with their labels. The header row is then hidden, so a Select of the columns and an IconButton for the order sort it, shown while `onStackedChange` reports the rows stacked.

## Content guidelines

- Name columns with short nouns in sentence case, "Open tasks", "Updated", as [Capitalisation and punctuation](../foundations/content.md#capitalisation-and-punctuation) describes.
- Put the unit in the column's name, "Size (MB)", not in every cell.
- Show recent dates as relative times and further ones as dates, following [Numbers, dates and time](../foundations/content.md#numbers-dates-and-time).
- Put the count in bulk actions and their confirmation, "Delete 2 projects?", as [Buttons and actions](../foundations/content.md#buttons-and-actions) and [Confirmations](../foundations/content.md#confirmations) describe.
- Name row actions for their row, "More actions for Website refresh", so each name is unique on the page.

## Do and don't

### Do

- Give each row one link, on the name of its record.
- Align numbers to the end with `numeric`, so they compare.
- Keep a checkbox for selection, beside `selected`.
- Keep the toolbar's controls at the size of the rows.

### Don't

- Don't make the whole row a click target that hides its link.
- Don't select rows by a press on the row alone; `aria-selected` is announced unevenly.
- Don't put more than one or two actions in each row; move the rest to its menu.
- Don't let a stacked table lose its sorting; show the Select while the rows stack.

## Accessibility

### Focus and keyboard

<kbd>Tab</kbd> reaches the table's scroll region, then each sort button and each control in the cells, in order. A sort button keeps focus as the rows reorder, and a polite status the application provides announces the new order, and a Pagination button keeps focus as the page changes, while the new range is announced. A press on a row's checkbox keeps focus on it. The bulk bar's Toolbar is one tab stop, with the arrow keys between its buttons. A polite status, there before the selection changes, announces the count as it changes. When an action clears the selection, the bar goes, and focus moves to the header's checkbox; a ConfirmDialog returns it there through `finalFocus` after the delete, and to the Delete button when it is cancelled. A row's menu returns focus to its button as it closes; after deleting the row, focus moves to the next row's menu button, or to the empty state's action after the last row. While the rows stack, the Select and the IconButton come before the table.

### envUI provides

- A native table, with column headers, in a focusable region named by the table's `aria-label` or `caption`, which scrolls with the arrow keys when it doesn't fit.
- `aria-sort` on sortable headers, and sort buttons named by the header and the order pressing them gives.
- `aria-selected` on rows with `selected`, and a mixed Checkbox reported as `aria-checked="mixed"`.
- Pagination in a navigation landmark, whose range is announced as it changes, and whose buttons keep focus.
- A Toolbar with one tab stop, arrow keys between its buttons, and each button's name in a tooltip.
- Explicit table roles while the rows stack, with the header row kept for assistive technology and the cells' labels hidden from it.

### You provide

- A name for every table.
- The sorting and the paging, and `sortDirection` on the sorted header.
- A checkbox labelled with the row's name in every selectable row, beside `selected`.
- Names for icon-only buttons that name their row or their count.
- Focus after an action removes the control that had it.
- Polite statuses that announce the new sort order and the selection count.
- A `label` on every cell after the first in a stacking table, and the sort controls while it stacks.

## Examples

### Select and act on several rows

Selecting rows shows the bulk bar: the count, a Toolbar of icon buttons that name the count, and "Clear selection". Archive acts at once and offers Undo; Delete asks first. Focus moves to the header's checkbox once the selection has gone, and back to Delete when its confirmation is cancelled. The count is announced through a status that is always there.

```tsx example=SelectAndBulkActions

```

### Row actions

The project's name is the row's link, and its other actions wait in a menu named for the row. "Delete project…" opens a confirmation; after the delete, focus moves to the next row's menu button, and after the last, to the empty state's "Create project".

```tsx example=RowActions

```

### Loading and empty

Choosing a team loads its projects: Skeleton rows in the table's shape after 200 ms, then the table, or, for a team with none, an EmptyState in its place with "Create project".

```tsx example=EmptyAndLoading

```

### Narrow table

As narrow as a phone, the rows stack with each value's label, and a Select and an IconButton above the table sort them, at the size of the small rows.

```tsx example=NarrowTable

```
