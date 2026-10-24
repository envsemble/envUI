---
title: Grid
summary: Grid lays out content in columns, a set number, a template or as many as fit, with even gaps.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - columns
  - grid layout
  - CSS grid
  - card grid
  - tiles
  - two columns
  - auto-fill
  - responsive grid
useWhen:
  - Items of one kind fill the width in as many columns as fit, such as cards or stats.
  - A main column sits beside a narrower one, such as a summary and its details.
  - Content lines up in a set number of equal columns.
avoidWhen:
  - text: Content top to bottom, one item per line.
    use: Column
  - text: A few items side by side at their own widths, such as actions.
    use: Row
  - text: Rows of data that people sort, select or compare.
    use: Table
  - text: Two panes people resize, or a list beside its detail.
    use: Panes
  - text: One block with an inset or a size container, and no columns.
    use: Box
  - text: A layout that changes by the window class rather than by what fits.
    see: responsive
components:
  - Grid
---

# Grid

## Overview

Like [Row](row.md), [Column](column.md) and [Box](box.md), Grid sizes to its content and never paints; its gap is a step of the spacing scale.

```tsx example=ProjectCards

```

## Variants

| Columns                                   | Lays out                                                   |
| ----------------------------------------- | ---------------------------------------------------------- |
| `columns={{ min: '14rem' }}`              | As many equal columns as fit at 14 rem; one when narrow.   |
| `columns={3}`                             | Three equal columns at every width.                        |
| `columns="minmax(0, 2fr) minmax(0, 1fr)"` | A `grid-template-columns` template, such as a main column. |

```tsx example=MainAndDetails caption="A template: the main column twice as wide as its details."

```

## When to use

```tsx do=FittingColumns caption="A minimum width, so the grid fits the columns to its own width."

```

```tsx dont=FixedColumns caption="Three columns in a narrow pane: each card is squeezed."

```

- Write `minmax(0, 1fr)` in a template rather than `1fr`, so long content wraps.
- Keep the visual order the document order: no `grid-row` or `grid-column` that moves what people read or tab through.
- `render={<ul />}`, with each child a `li`, for items people count.

## Adapting to width

With a minimum, a grid needs no container query: as many columns as fit, and the rest of a row stays empty, so every item keeps one width.

```tsx example=ColumnsThatFit widths="22 50"

```

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`.
- Cells in the document order, row by row in the reading direction.

### You provide

- A list, with a name, where the items are a list people count.

## Changelog

- **1.0.0**: Grid, with Row, Column and Box, the layout primitives.
