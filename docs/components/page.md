---
title: Page
summary: The invisible column a page's content sits in, centered at a readable width with the page gutter by window class, and the page's header at its top.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - Container
  - container
  - page container
  - content width
  - max width
  - page column
  - page layout
  - main column
useWhen:
  - A page's content needs a readable width in a wide window, such as a form, a document or a dashboard.
  - A page has a heading with actions above its content, passed as its header.
avoidWhen:
  - text: The frame of an application, with its top bar and navigation.
    use: Scaffold
  - text: Content in a column or a row with even gaps inside a page.
    use: Column
  - text: Two panes side by side, such as a list and its detail.
    use: Panes
  - text: A page's title row, with its actions.
    use: PageHeader
components:
  - Page
---

# Page

## Overview

Page goes in a [Scaffold](scaffold.md)'s body and adds no landmark of its own.

```tsx example=WithHeader

```

## Variants

| Width          | Content width | Use for                                            |
| -------------- | ------------- | -------------------------------------------------- |
| `sm`           | 40 rem        | A form, a settings page or a sign-in page.         |
| `md`           | 60 rem        | A document, an article or the details of one item. |
| `lg` (default) | 76 rem        | A dashboard, a list or a table.                    |
| `full`         | The whole     | A board, a canvas or a wide table.                 |

```tsx example=Widths

```

`gutter={false}` leaves the inline edges to the content, such as a full-bleed table.

## When to use

```tsx do=HeaderInPage caption="The heading in header, in the page's column and gutter."

```

```tsx dont=HeaderOutside caption="A PageHeader outside the page: it doesn't line up with the content."

```

- The width for what the page holds: `sm` for a form, `md` for reading; never `full` for text.
- One Page per page: a part that needs a width of its own takes it from its content.
- A Scaffold's body already is the `main`; add none around a Page.

## Anatomy

```tsx anatomy=PageAnatomy

```

1. **Page** (`env-page`)
2. **Header** (`env-page-header`, `header`)
3. **Content** (`env-page-content`, `children`)

## Adapting to width

The gutter follows the window class of the region the page sits in: 1 rem at the sides in a compact one, 1.5 rem from medium. A page in a narrow pane of a wide window keeps the compact gutter. The muted fill shows the gutter.

```tsx example=Gutters widths="24 44"

```

## Accessibility

### envUI provides

- A plain element without a role, so the page adds no landmark inside the Scaffold's `main`.
- With a sticky PageHeader, a scroll margin that keeps what takes focus clear of it.

### You provide

- The page's one `h1`, usually its PageHeader's title.
- `render={<article />}` where the page is one, such as a document.

## Changelog

- **1.0.0**: Page, with the widths `sm`, `md`, `lg` and `full`, `header`, `gutter`, `name` and `render`; invisible structure whose gutters follow the window class of the region it sits in, and the `env-page` container.
