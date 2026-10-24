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
  - A readable width in a wide window, such as for a form or a document
  - A page's heading and actions above its content
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

Page goes in a [Scaffold](scaffold.md)'s body, with its header at the top of the same column, and adds no landmark of its own.

```tsx example=WithHeader

```

## Variants

### Widths

| Width  | Content width   | Use for                                            |
| ------ | --------------- | -------------------------------------------------- |
| Small  | 40 rem          | A form, a settings page or a sign-in page.         |
| Medium | 60 rem          | A document, an article or the details of one item. |
| Large  | 76 rem          | A dashboard, a list or a table. The default.       |
| Full   | The whole width | A board, a canvas or a wide table.                 |

```tsx example=Widths

```

### Without the gutter

A page can leave its sides to its content, such as a table that runs to the edges.

## When to use

```tsx do=HeaderInPage caption="The heading in the page's header, in its column and gutter."

```

```tsx dont=HeaderOutside caption="A PageHeader outside the page: it doesn't line up with the content."

```

### Width

One page per page, at the width for what it holds, and never the full width for text. A part that needs a narrower width takes it from its own content.

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

## In code

### Usage

Page holds the page's content as `children`, and its heading, usually a PageHeader, in `header`, at the top of the same column. Put it in a Scaffold's body, which is already the `main` landmark: add none around a Page.

```tsx source=WithHeader

```

#### Width and gutter

`width` is `sm`, 40 rem, `md`, 60 rem, `lg`, 76 rem and the default, or `full`. `gutter` pads the column's inline edges with the page gutter, 1 rem in a compact region and 1.5 rem from medium; `gutter={false}` leaves them to the content, such as a full-bleed table.

```tsx
<Page width="sm" header={<PageHeader title="Settings" />}>
  …
</Page>
<Page width="full" gutter={false}>
  …
</Page>
```

#### Element and name

`render` sets the element, a `div` by default, such as `render={<article />}` for a document. `name` names the node for dev mode, as `data-env-name`.

### Composition

The page, `env-page`, holds its header and its content, `env-page-content`, at its width. It never paints, and it is the `env-page` size container for the content inside. `data-width` carries a width other than `lg`, and `data-gutter="none"` a page without the gutter.

## Changelog

- **1.0.0**: Page, with the widths `sm`, `md`, `lg` and `full`, `header`, `gutter`, `name` and `render`; invisible structure whose gutters follow the window class of the region it sits in, and the `env-page` container.
