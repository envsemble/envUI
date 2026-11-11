---
title: Data tables
summary: Show many records in rows and columns that people can sort, select and act on.
status: beta
since: 1.0.0
intent: Work with lists and tables
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
  - Select
  - RelativeTime
  - Pagination
  - ConfirmDialog
  - ToastProvider
  - useToast
  - Column
  - Row
  - Text
examples:
  SortAndPaginate: overview
  SelectAndBulkActions: example
  RowActions: example
  RowsThatStack: example
  DataTableAnatomy: anatomy
---

# Data tables

## Variants

### Select and act on several rows

While rows are selected, a bulk bar shows the count and its actions.

- Archive acts at once, with Undo.
- Delete asks first.

```tsx figure=SelectAndBulkActions motion

```

### Row actions

The name links to the record; the other actions wait in a [Menu](../components/menu.md) named for the row, "More actions for Website refresh".

```tsx figure=RowActions motion

```

## Anatomy

```tsx figure=DataTableAnatomy

```

1. **Selection** (`env-checkbox`)
2. **Sort** (`env-table-sort-button`)
3. **Record link** (`env-link`)
4. **Numbers** (`env-table-cell[data-numeric]`)
5. **Pagination** (`env-pagination`)

## Behaviour

### Sorting and paging

A [Table](../components/table.md) holds the data, with its own sorting, selection and stacking.

- [Pagination](../components/pagination.md) below it gives the range, "1–4 of 6".
- It keeps working while the next set loads.

<!-- specimen: SortingAndPaging -->

### Adapting to width

Where the table is narrow, such as on a phone, each row stacks into a block titled by its name, with each value beside its column's name. The pages stay below it.

The header and its sort buttons are hidden then, so one Select above the rows shows and changes the order.

```tsx figure=RowsThatStack widths="40 20" sweep

```

## Rules

A data table says what each column and each action holds in as few words as people need.

### Content

Name columns with short nouns, "Open tasks".

- Put the unit in the name, "Size (MB)", not in every cell.
- Show recent dates as relative times, and further ones as dates.
- Give the count in bulk actions and their confirmation: "Delete 2 projects?".

## Accessibility

### Focus and keyboard

<kbd>Tab</kbd> reaches the table's scroll region, then each sort button and control in the cells.

- Sort and Pagination buttons keep focus as the rows change.
- When an action clears the selection, focus moves to the header's checkbox.
- After a row is deleted, focus moves to the next row's menu button.

### envUI provides

- A native table in a focusable region named by its `aria-label` or `caption`, scrolled with the arrow keys.
- `aria-sort` on sortable headers, `aria-selected` on selected rows and `aria-checked="mixed"` on the header's checkbox.
- Pagination in a navigation landmark, whose range is announced.

### You provide

- A name for every table, the sorting and paging, and `sortDirection` on the sorted header.
- A checkbox labelled with the row's name in every selectable row.
- Polite statuses for the sort order and the selection count, and focus after an action removes its control.

## Compose

### Usage

Name the Table.Root with `aria-label`.

- A sortable Table.HeaderCell takes `sortDirection`, `ascending`, `descending` or `none`, and `onSortChange`, which asks for the other order: the application sorts the rows, goes back to the first page and says the order in a Text with `role="status"`.
- Numeric columns take `numeric` on the header and the cells.
- The name is a Link, and recent dates a RelativeTime.
- Pagination takes `page`, `pageSize`, `total`, `onPageChange` and an `aria-label`, and `pending` while a page loads.

```tsx source=SortAndPaginate

```

#### Selection and bulk actions

Each selectable row has a Checkbox labelled with the row's name and `selected` on its Table.Row; the header's Checkbox is `checked="mixed"` while some are selected. A visually hidden `role="status"` says the count.

- The bulk bar is a Toolbar named for the selection, with the count in its Toolbar.Button labels, "Archive 2 projects".
- Archive acts at once with Undo in a toast from `useToast`, and Delete opens a ConfirmDialog.
- As the bar goes with the selection, focus moves to the header's Checkbox.

```tsx
<Table.Row selected={selected.includes(project.id)}>
  <Table.Cell>
    <Checkbox
      aria-label={`Select ${project.name}`}
      checked={selected.includes(project.id)}
      onCheckedChange={(checked) => toggle(project.id, checked)}
    />
  </Table.Cell>
  <Table.Cell>
    <Link href={`/projects/${project.id}`}>{project.name}</Link>
  </Table.Cell>
</Table.Row>
```

#### Row actions

The row's other actions are a Menu whose trigger is an IconButton with `aria-label` "More actions for" the row's name. Delete opens a ConfirmDialog whose `finalFocus` is the menu button that opened it, or, once its row is gone, the next row's.

```tsx
<Menu.Root
  aria-label={`Actions for ${project.name}`}
  trigger={<IconButton icon={<IconMoreVert />} aria-label={`More actions for ${project.name}`} />}
>
  <Menu.Item onClick={() => setConfirming(true)}>Delete project…</Menu.Item>
</Menu.Root>
```

## Changelog

- **1.0.0**: The page is on the figure template; sorting, selecting, loading and stacking rows are on Table.
- **1.0.0-prerelease.6**: Stacked rows keep their sorting in a Select above them.
