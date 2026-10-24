---
title: PageHeader
summary: A page's heading row, with its title, an optional trail and description, its actions and a toolbar row, that wraps to its own width and can stick to the top.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - page header
  - page heading
  - page title
  - header bar
  - title bar
  - page toolbar
  - heading row
  - sticky header
useWhen:
  - A page opens with its title and the actions that apply to the whole page, such as New project.
  - A page needs its trail, a status or a count beside its title, or a row of search and filters under it.
  - The page's heading should stay in view as the page scrolls.
avoidWhen:
  - text: The application's bar across every page, with its name, search and account menu.
    use: TopBar
  - text: The heading of a section inside a page, with its own actions.
    use: Row
  - text: Controls for one subject that the arrow keys move between.
    use: Toolbar
components:
  - PageHeader
---

# PageHeader

## Overview

Put a PageHeader in a [Page](page.md)'s `header`.

```tsx example=WithBreadcrumbs

```

### Search and filters

`toolbar` adds a row below the title for search, filters and view switches. `controlSize="sm"` gives the buttons in `actions` and `toolbar` the small height of a dense page.

```tsx example=WithToolbar

```

### Sticky

With `sticky`, the header stays at the top of the area that scrolls, under a Scaffold's top bar. What takes focus in the page keeps clear of it.

```tsx example=Sticky

```

## When to use

```tsx do=PageActions caption="Actions for this page, with the primary one last."

```

```tsx dont=FrameActions caption="The account and sign-out in a page's header: they belong to the frame."

```

- One PageHeader per page, with the page's `h1`; set `headingLevel` lower in a pane or a dialog.
- A toolbar row that holds a text field is a [Row](row.md), not a Toolbar, as [Toolbar's layouts](toolbar.md#layouts) describe.

## Anatomy

```tsx anatomy=PageHeaderAnatomy

```

1. **Header** (`env-page-header`)
2. **Breadcrumbs** (`env-page-header-breadcrumbs`, `breadcrumbs`)
3. **Start** (`env-page-header-start`, `start`)
4. **Title** (`env-page-header-title`, `title`)
5. **Meta** (`env-page-header-meta`, `meta`)
6. **Description** (`env-page-header-description`, `description`)
7. **Actions** (`env-page-header-actions`, `actions`)
8. **Toolbar** (`env-page-header-toolbar`, `toolbar`)

## Adapting to width

The header responds to its own width: below 37.5 rem, the actions move under the title and wrap. The title wraps too, and is never cut short; more actions than fit go in a [Menu](menu.md) as the last one.

```tsx example=InANarrowPane widths="22 44"

```

## Accessibility

### envUI provides

- A `div`, no landmark, with the title as a heading at `headingLevel`.
- The parts in the same order to read, to tab through and to see, at every width.

### You provide

- A title that names the page, and a `headingLevel` that fits the headings around it.
- Names for icon-only actions and labels for the fields in the toolbar.

## Changelog

- **1.0.0**: PageHeader, with `title`, `headingLevel`, `description`, `breadcrumbs`, `start`, `meta`, `actions`, `toolbar`, `sticky` and `controlSize`.
