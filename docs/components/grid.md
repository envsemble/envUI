---
title: Grid
summary: Grid lays out content in columns, a set number, a template or as many as fit, with even gaps.
status: beta
since: 1.0.0
category: App frame & layout
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
  - Items of one kind in as many columns as fit, such as cards or stats
  - A main column beside a narrower one, such as a summary and its details
  - Content lined up in a set number of equal columns
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
examples:
  ProjectCards: overview
  MainAndDetails:
    role: example
    caption: 'A template: the main column twice as wide as its details.'
  ColumnsThatFit: example
  FittingColumns:
    role: do
    caption: A minimum width, so the grid fits the columns to its own width.
  FixedColumns:
    role: dont
    caption: 'Three columns in a narrow pane: each card is squeezed.'
---

# Grid

## Variants

| Columns        | Use for                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| As many as fit | Items of one kind, each at least a minimum width; one column when narrow. |
| A set number   | Content in a set number of equal columns at every width.                  |
| A template     | Columns of different widths, such as a main column and its details.       |

```tsx figure=MainAndDetails

```

## Behaviour

### Adapting to width

Given a minimum width, a grid fits as many columns as it can, with no breakpoints of its own.

- The rest of a row stays empty, so every item keeps one width.

```tsx figure=ColumnsThatFit widths="22 50"

```

## Rules

A grid of items fits its columns to the room it has, rather than keeping a set number.

```tsx figure=FittingColumns

```

```tsx figure=FixedColumns

```

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`.
- Cells in the document order, row by row in the reading direction.

### You provide

- A list, with a name, where the items are a list people count.

## Compose

### Usage

Grid lays out its children in `columns`, one by default, with `gap` between rows and columns, a step of the spacing scale, none by default.

- `align` lines each child up in its cell's height: `stretch`, the default, fills the row, and `start`, `center` and `end` keep it at its own height.
- Like Box, it takes `render`, `name`, `container` and `padding`.

```tsx source=ProjectCards

```

#### Columns

| Columns                                   | Lays out                                                   |
| ----------------------------------------- | ---------------------------------------------------------- |
| `columns={{ min: '14rem' }}`              | As many equal columns as fit at 14 rem; one when narrow.   |
| `columns={3}`                             | Three equal columns at every width.                        |
| `columns="minmax(0, 2fr) minmax(0, 1fr)"` | A `grid-template-columns` template, such as a main column. |

- With a minimum, the grid fits as many equal columns as it can at that width or wider, with empty columns where items run out, so it needs no container query.
- In a template, write `minmax(0, 1fr)` rather than `1fr`, so long content wraps.

```tsx
<Grid columns="minmax(0, 2fr) minmax(0, 1fr)" gap={6}>
  <Column gap={2}>…</Column>
  <DescriptionList.Root layout="stacked" aria-label="Project details">
    …
  </DescriptionList.Root>
</Grid>
```

### Composition

Keep the visual order the document order: no `grid-row` or `grid-column` that moves what people read or tab through.

- For items people count, use `render={<ul />}`, with each child a `li`, and name the list.

## Changelog

- **1.0.0**: Grid, with Row, Column and Box, the layout primitives.
