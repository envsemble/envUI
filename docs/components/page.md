---
title: Page
summary: The column a page's content sits in, under its title and actions.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - Container
  - container
  - page container
  - content width
  - max width
  - page column
  - page layout
  - main column
  - page header
  - page heading
  - page title
  - header bar
  - title bar
  - page toolbar
  - heading row
  - sticky header
useWhen:
  - A readable width in a wide window, such as for a form or a document
  - A page's title and its actions, such as New project (PageHeader)
  - A page heading that stays in view as the page scrolls
avoidWhen:
  - text: The frame of an application, with its top bar and navigation.
    use: Scaffold
  - text: The application's bar across every page, with its name and account menu.
    use: TopBar
  - text: Two panes side by side, such as a document and its details.
    use: Panes
components:
  - Page
  - PageHeader
examples:
  WithHeader:
    role: overview
    device: window
  WithBreadcrumbs: example
  WithToolbar: example
  PageAnatomy: anatomy
  PageHeaderAnatomy: anatomy
  Sticky: example
  Gutters: example
---

# Page

## Variants

### The header

```tsx figure=WithBreadcrumbs

```

### Search and filters

```tsx figure=WithToolbar

```

### Widths

<!-- specimen: ColumnWidths -->

## Anatomy

```tsx figure=PageAnatomy

```

1. **Page** (`env-page`)
2. **Header** (`env-page-header`, `header`)
3. **Content** (`env-page-content`, `children`)

```tsx figure=PageHeaderAnatomy

```

1. **Header** (`env-page-header`)
2. **Breadcrumbs** (`env-page-header-breadcrumbs`, `breadcrumbs`)
3. **Start** (`env-page-header-start`, `start`)
4. **Title** (`env-page-header-title`, `title`)
5. **Meta** (`env-page-header-meta`, `meta`)
6. **Description** (`env-page-header-description`, `description`)
7. **Actions** (`env-page-header-actions`, `actions`)
8. **Toolbar** (`env-page-header-toolbar`, `toolbar`)

## Behaviour

### Sticky

```tsx figure=Sticky motion

```

### Adapting to width

```tsx figure=Gutters widths="44 22" sweep classes

```
