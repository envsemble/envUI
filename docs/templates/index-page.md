---
title: Index page
summary: A page inside the app frame that lists every object of one kind in a table people search, filter, sort and select, with bulk actions and pages.
status: beta
since: 1.0.0
frame: app
aliases:
  - index page
  - list page
  - collection page
  - filterable table
  - data table page
  - table with filters
  - bulk actions
useWhen:
  - People find, compare and act on many objects of one kind, such as projects or documents.
  - The list needs search, a filter or two, sorting and actions on several rows at once.
avoidWhen:
  - text: One object's own page, with its details and activity.
    see: details-page
  - text: A short list without columns to compare.
    use: List
composes:
  - Page
  - PageHeader
  - Stack
  - SearchField
  - Select
  - Button
  - Text
  - Table
  - Checkbox
  - Link
  - Badge
  - Avatar
  - RelativeTime
  - Menu
  - IconButton
  - Tooltip
  - Pagination
  - EmptyState
  - ConfirmDialog
  - useToast
related:
  - empty-states
  - destructive-actions
  - table
  - pagination
  - app-frame
---

# Index page

## Overview

The page that lists every object of one kind, here Northwind's projects, inside the [app frame](app-frame.md): search and filters in the header's toolbar, a table people sort and select rows of, bulk actions for the selection, and pages of ten. Start from it for the top page of any collection people manage, such as projects, documents or members.

```tsx template=IndexPage

```

## Anatomy

1. **Header:** a [PageHeader](../components/page-header.md), "Projects", with a description, the primary action "Create project" and `controlSize="sm"`.
2. **Toolbar:** the header's `toolbar`, a [Stack](../components/stack.md) row that wraps: a [SearchField](../components/text-field.md), a [Select](../components/select.md) for the status and one for the owner, all `size="sm"`, and "Clear filters" while a filter is set.
3. **Selection bar:** a [Checkbox](../components/checkbox.md) "Select this page", checked, unchecked or mixed; a [Text](../foundations/typography.md) with `role="status"` that counts the projects, those found or those selected; and, with a selection, "Archive 3 projects" and "Delete 3 projects…" [Button](../components/button.md)s. While the rows stack, a "Sort by" Select joins them.
4. **Table:** a [Table](../components/table.md) with `narrowLayout="stack"`, sortable Name and Updated columns, and per row:
   - a Checkbox named "Select {project}" and a [Link](../components/link.md) to the project, the row's one destination;
   - the owner's [Avatar](../components/avatar.md) and name, the status as a [Badge](../components/badge.md), and the last change as [RelativeTime](../components/relative-time.md);
   - a [Menu](../components/menu.md) of the row's other actions, opened by an [IconButton](../components/button.md) with a [Tooltip](../components/tooltip.md).
5. **Pages:** a [Pagination](../components/pagination.md) of ten projects a page, hidden when one page holds them all.
6. **No results:** an [EmptyState](../components/empty-state.md) in place of the table, with "Clear filters".
7. **Confirmation:** a [ConfirmDialog](../components/confirm-dialog.md) `tone="danger"` for deleting, and toasts through [useToast](../components/toast.md) after archiving and deleting.

## States and behaviour

- **Filters apply at once:** each keystroke and choice filters the list, goes back to the first page and updates the count, which is read politely. "Clear filters" shows only while a filter is set.
- **No results:** the toolbar stays, so people can change what they asked for; the empty state names the query and offers "Clear filters", which also returns focus to the search.
- **Sorting:** Name and Updated sort from their headers, which report `aria-sort`; the newest first is the default. On a phone the header row is hidden, so the "Sort by" Select takes its place.
- **Selecting:** each row has its checkbox; "Select this page" selects the rows shown and is mixed while some are. The selection outlasts filters and pages, and the count says how many are selected.
- **Archive:** happens at once, for one row from its menu or for the selection, with "Undo" in the toast. Focus moves to "Select this page", since the buttons that did it are gone.
- **Delete:** asks first, naming the project or the count in the title and the button; Cancel takes focus, and the toast confirms afterwards. Focus returns to "Select this page".
- **First use:** with no projects at all, replace the table with an EmptyState that explains projects and offers "Create project" ([Empty states](../patterns/empty-states.md)).
- **Loading and errors:** show [Skeleton](../components/skeleton.md) rows in the table's shape while the first page loads, `pending` on Pagination while another does, and an EmptyState with `tone="danger"` and "Try again" when it fails.
- **Widths:** on a desktop and a tablet the columns show; below 36 rem of the table's own width the rows stack, each a block with its labels, and the toolbar and the bar wrap.

### Connect your data

- Replace `initialProjects` with your data, and filter, sort and page on the server for long lists: send the query, the filters, the sort and the page, and pass `total` to Pagination.
- Keep the filters, the sort and the page in the address, so a reload or a shared link shows the same list.
- Replace the archive and delete handlers with your service's calls; return the delete's promise from `onConfirm`, so the dialog waits for it.
- Links go to plain paths, such as `/projects/website-refresh`, through the application's `LinkProvider` ([setup](../setup.md)).

## Content guidelines

- Title the page with the plural of the object, "Projects", and name the primary action with a verb and the object, "Create project" ([Buttons and actions](../foundations/content.md#buttons-and-actions)).
- Put the count in every label of a bulk action, "Archive 3 projects", "Delete 3 projects…", and in the dialog's title and button.
- Toasts are short and in the past tense, "Website refresh archived", with one action at most.
- The no-results state names the query and says what to do ([Empty states](../foundations/content.md#empty-states)).

## Do and don't

### Do

- Keep one link per row, on its name, and the other actions in the row's menu.
- Give the toolbar's fields and buttons one size, the table's density's.
- Show bulk actions only while rows are selected, next to the count.

### Don't

- Don't make the whole row a link, or put a second link in it.
- Don't add an Apply button to filters that are fast to run.
- Don't confirm archiving; offer Undo.

## Accessibility

### Landmarks and headings

- The frame's `nav` "Primary" and one `main`.
- One `h1`, "Projects", in the PageHeader; the empty state's title is an `h2`, and a toast's message is a heading of its region.
- The table is named "Projects", and its scroll region takes the name too.

### envUI provides

- Sort buttons in the header cells, with `aria-sort` and a name that says what pressing does.
- `aria-selected` on selected rows, with the stacked layout keeping the table's roles.
- The mixed checkbox, the menu's keyboard and its tooltip, and a danger dialog that starts on Cancel and returns focus.

### You provide

- A name for each row's checkbox and menu button that includes the project, such as "Select Website refresh".
- The polite count that says how many are found or selected.
- Moving focus after a bulk action removes the buttons people used: to "Select this page", here.
