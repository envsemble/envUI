---
title: Details page
summary: A page inside the app frame for one object, with where it sits, its status and actions, its content in tabs and a panel of its details beside them.
status: beta
since: 1.0.0
frame: app
aliases:
  - details page
  - detail page
  - item page
  - object page
  - project page
  - record page
  - two columns
  - side panel
useWhen:
  - People open one object from a list to read about it, follow its activity and act on it.
  - The object has a few facts people check often, such as its owner and due date, beside longer content.
avoidWhen:
  - text: The list of every object of the kind, with search and filters.
    see: index-page
  - text: Editing the object's fields.
    see: forms
composes:
  - Page
  - PageHeader
  - Breadcrumbs
  - Badge
  - Button
  - Menu
  - IconButton
  - Tooltip
  - Stack
  - Surface
  - Text
  - Tabs
  - List
  - Link
  - Avatar
  - AvatarGroup
  - RelativeTime
  - DescriptionList
  - Progress
  - ConfirmDialog
  - useToast
related:
  - index-page
  - destructive-actions
  - tabs
  - description-list
  - page-header
---

# Details page

## Overview

The page for one object, here the Website refresh project, inside the [app frame](app-frame.md): breadcrumbs back to its list, its name with its status and actions, then its content in tabs beside a panel of the facts people check most. The two columns sit side by side on a desktop and stack on narrower screens, the main column first. Start from it for the page people reach from an [index page](index-page.md).

```tsx template=DetailsPage

```

## Anatomy

1. **Header:** a [PageHeader](../components/page-header.md) with:
   - **Breadcrumbs:** [Breadcrumbs](../components/breadcrumbs.md) from the list to the object, the last one the current page;
   - **Title and description:** the object's name as the `h1`, and one sentence about it;
   - **Meta:** its status as a [Badge](../components/badge.md);
   - **Actions:** "Edit", a secondary [Button](../components/button.md), and a [Menu](../components/menu.md) of the rest, opened by an [IconButton](../components/button.md) "More actions" with a [Tooltip](../components/tooltip.md): Duplicate, Archive and "Delete project…".
2. **Columns:** a [Stack](../components/stack.md) row that wraps, the main column first.
3. **Main column:** [Tabs](../components/tabs.md) "Project views":
   - **Overview:** a paragraph about the project and a [List](../components/list.md) of tasks, each with its assignee, due date and a status Badge;
   - **Activity:** a List of events, each with the person's [Avatar](../components/avatar.md) and a [RelativeTime](../components/relative-time.md);
   - **Files:** a List of documents, each a [Link](../components/link.md).
4. **Details panel:** an `aside` on a muted [Surface](../components/surface.md), titled "Details": a [DescriptionList](../components/description-list.md) of the owner, status, created and due dates; a [Progress](../components/progress.md) of the tasks done; and the members as an [AvatarGroup](../components/avatar.md).
5. **Confirmation:** a [ConfirmDialog](../components/confirm-dialog.md) `tone="danger"` for deleting, and a toast through [useToast](../components/toast.md) with Undo after archiving.

## States and behaviour

- **Tabs:** the arrow keys move between Overview, Activity and Files; each panel starts with its own `h2`.
- **Archive:** happens at once; the status turns to Archived in the header and the panel, and the toast offers Undo.
- **Delete:** asks first, naming the project, with Cancel focused; after the deletion the application goes back to the list and confirms there with a toast. The sample says so in a status line.
- **Loading:** show the header with the name people chose from the list, and [Skeleton](../components/skeleton.md) blocks in the shape of the tabs and the panel until the rest arrives.
- **Not found or no access:** show the [not-found or no-access page](error-pages.md) inside the frame instead of an empty page.
- **Widths:** the columns sit side by side when the page is about 56 rem wide, on a desktop. Narrower, on a tablet beside the app sidebar and on a phone, the panel moves below the tabs, since reading order follows the source's. The header's actions move under the title below 32 rem.

### Connect your data

- Replace `project`, `activity` and `files` with the object's data, loaded by the route's identifier.
- Point "Edit", "Duplicate", the breadcrumbs and the files at your routes; they're plain paths through the application's `LinkProvider` ([setup](../setup.md)).
- Replace the archive and delete handlers with your service's calls, and after a deletion navigate to the list with your router.

## Content guidelines

- Use the object's own name as the title and the last breadcrumb, word for word.
- Keep the panel to facts with short labels: Owner, Status, Created, Due.
- Name the menu's destructive item with the consequence and an ellipsis, "Delete project…", and the dialog with a question that names the object ([Confirmations](../foundations/content.md#confirmations)).

## Do and don't

### Do

- Put the main column first in the source, so it comes first when the columns stack and for screen readers.
- Keep one or two actions visible and the rest in "More actions".
- Show recent events with RelativeTime, which keeps the absolute date in its tooltip.

### Don't

- Don't put the object's navigation in the frame's sidebar; use tabs for its views.
- Don't hide the status only in the panel; show it beside the title as well.
- Don't fix the columns' widths with media queries of your own; the row wraps by the space it has.

## Accessibility

### Landmarks and headings

- The frame's `nav` "Primary", a `nav` for the breadcrumbs, one `main`, and the panel as an `aside` named "Details".
- One `h1`, the project's name; each tab panel starts with an `h2`, and the panel's title "Details" is an `h2`, with "Members" an `h3` under it.
- The tab list is named "Project views", and the lists and the description list are named.

### envUI provides

- Breadcrumbs with `aria-current="page"` on the last item, tabs with their roles and arrow keys, and the menu with its keyboard and the trigger's tooltip.
- A Progress with its value as text, and an AvatarGroup named by the people in it.
- A danger dialog that starts on Cancel and returns focus to the menu button.

### You provide

- The names of the panel and the lists, and the order of the columns in the source.
- An `aria-valuetext` on the Progress that says what is counted.
- Moving focus after a deletion takes people to another page: to the list's heading.
