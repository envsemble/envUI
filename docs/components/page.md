---
title: Page
summary: The column a page's content sits in, centered at one of four widths with the page gutter, and the page's header at its top.
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
  - text: The frame of an application, with its header and sidebars.
    use: AppShell
  - text: Content in a column or a row with even gaps inside a page.
    use: Column
  - text: A background, an inset and corners around a part of a page.
    use: Surface
  - text: Two panes side by side that people resize.
    use: SplitPane
related:
  - page-header
  - column
  - surface
  - app-shell
  - responsive
components:
  - Page
---

# Page

## Overview

Page is the column a page's content sits in. It is centered in the space it has, grows to its `width` at most, pads its inline edges with the page gutter and puts its `header`, usually a [PageHeader](../components/page-header.md), at its top. It adds no landmark: it goes inside `AppShell.Main`, or the application's own `main`, and the content inside it lays itself out, with the layout primitives, such as Row, Column and Grid, and the components.

```tsx example=WithHeader

```

## Anatomy

1. **Column**: a `div`, or the element in `render`, such as an `article`, centered with `margin-inline: auto`.
2. **Header** (`header`): the page's PageHeader, at the top of the column.
3. **Gutter** (`gutter`): the inline padding, from 1 rem on a phone to 2 rem on a wide window.
4. **Content**: the page's children; under a header, in a block of their own 1.5 rem below it.

## Variants and sizes

| Width          | Content width | Use for                                                          |
| -------------- | ------------- | ---------------------------------------------------------------- |
| `sm`           | 40 rem        | A form, a settings page or a sign-in page.                       |
| `md`           | 60 rem        | A document, an article or the details of one item.               |
| `lg` (default) | 76 rem        | A dashboard, a list, a table, most of an application's pages.    |
| `full`         | The whole     | A board, a canvas or a wide table that uses all the width it has |

- The widths are rem, so they follow the reader's text size, and are custom properties of the page, `--env-page-width-sm`, `-md` and `-lg`, which an application may set on `.env-page` to change them everywhere.
- The column is as wide as its `width` plus the gutter on each side; in a narrower space it takes the whole width.
- The page's block padding, 1.5 rem above and 2 rem below, separates its content from the frame's header and the end of the page.
- `gutter={false}` leaves the inline edges to the content, such as a page that is one full-bleed table; the gutter is `--env-page-gutter`, which a sticky PageHeader also reads to reach across it.

## States and behaviour

- Page has no states and handles no keys; it is layout only.
- A sticky PageHeader in `header` publishes its height on the page as `--env-page-header-block-size`, so content can stick below it and the frame's header: `inset-block-start: calc(var(--env-frame-sticky-top, 0px) + var(--env-page-header-block-size, 0px))`.
- There is no Container: a Page without a header is the width container.

## Do and don't

### Do

- Choose the width for what the page holds: `sm` for a form, `md` for reading, `lg` for most application pages.
- Put the page's heading in `header`, so it shares the column and its gutter.
- Lay out the content inside with Column, Row and Grid, and keep its own widths, such as a form's fields, to the components.

### Don't

- Don't nest pages; a part of a page that needs its own width takes it from its content or a Surface.
- Don't add a `main` around a Page inside AppShell.Main, which already is one.
- Don't use `full` for text: long lines are hard to read.

## Accessibility

### envUI provides

- A plain element without a role, so the page adds no landmark of its own inside the frame's `main`.
- Content in document order, so the reading and focus order follow what people see.

### You provide

- The page's one `h1`, usually PageHeader's title.
- A `main` landmark around the page, which `AppShell.Main` gives.
- `render={<article />}` or another element where the page is one, such as a document.

## Examples

### Widths

The four widths, in a muted surface that shows the space around the column.

```tsx example=Widths

```

## Changelog

- **1.0.0**: Page, with the widths `sm`, `md`, `lg` and `full`, `header`, `gutter` and `render`.
