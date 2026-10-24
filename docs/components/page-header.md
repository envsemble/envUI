---
title: PageHeader
summary: A page's heading row, with its title, an optional trail and description, its actions and a toolbar row, that wraps to its own width and can stick to the top.
status: beta
since: 1.0.0
category: App frame & layout
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
  - A page's title and the actions for the whole page, such as New project
  - A trail, a status or a count beside the title, or search and filters under it
  - A page heading that stays in view as the page scrolls
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

A PageHeader sits at the top of a [Page](page.md).

```tsx example=WithBreadcrumbs

```

### Search and filters

A row below the title holds search, filters and view switches. On a dense page, its buttons and the actions take the small control height.

```tsx example=WithToolbar

```

### Sticky

A header can stay at the top of the area that scrolls, under a Scaffold's top bar. What takes focus in the page keeps clear of it.

```tsx example=Sticky

```

## When to use

```tsx do=PageActions caption="Actions for this page, with the primary one last."

```

```tsx dont=FrameActions caption="The account and sign-out in a page's header: they belong to the frame."

```

### One per page

Give each page one PageHeader, whose title is the page's main heading; in a pane or a dialog, its heading sits a level lower.

### A row with a field

A toolbar row that holds a text field is a [Row](row.md), not a Toolbar, as [Toolbar's layouts](toolbar.md#layouts) describe.

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

## In code

### Usage

Put a PageHeader in a Page's `header`. It takes the page's `title`, which wraps, balanced across its lines, and is never cut short; a `description` under it, in the smaller muted text; `breadcrumbs` above it, usually Breadcrumbs with `wrap={false}`; `start`, before it, such as an Avatar, an icon or a back IconButton; `meta` beside it, such as Badges or a count; and the page's `actions` at the end of the title row, the primary action last.

```tsx source=WithBreadcrumbs

```

#### Heading level

The title is an `h1` by default. Set `headingLevel` lower for a header inside a pane, a dialog or a section under another heading; it looks the same at every level.

#### Toolbar

`toolbar` adds a second row under the title for search, filters and view switches, laid out with `<Row wrap justify="between">`: a row that holds a text field is a Row, not a Toolbar, so the field keeps its arrow keys. `controlSize` is `md`, the default, or `sm` for a dense page, such as one in a small window: it sizes the buttons and icon buttons in `actions` and `toolbar` that set none. Give fields in the toolbar the same `size`.

```tsx source=WithToolbar

```

#### Sticky

`sticky` keeps the header in view at the top of the area that scrolls, over the content under it: under a Scaffold's top bar where the document scrolls, or at the top of a Scaffold's body that scrolls. As a Page's header, what scrolls into view below it, such as a field taking focus, keeps clear of it: the header measures its height, which CSS reckons from its rows until script runs.

```tsx source=Sticky

```

### Composition

The header is a `div`, no landmark, `env-page-header`, with the breadcrumbs, `env-page-header-breadcrumbs`, the start, `env-page-header-start`, the title, `env-page-header-title`, the meta, `env-page-header-meta`, the description, `env-page-header-description`, the actions, `env-page-header-actions`, and the toolbar, `env-page-header-toolbar`. It responds to its own width: below 37.5 rem the actions move under the title and wrap. Put more actions than fit in a Menu as the last one.

## Changelog

- **1.0.0**: PageHeader, with `title`, `headingLevel`, `description`, `breadcrumbs`, `start`, `meta`, `actions`, `toolbar`, `sticky` and `controlSize`.
