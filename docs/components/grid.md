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
    use: SplitPane
related:
  - column
  - row
  - box
  - card
  - responsive
components:
  - Grid
---

# Grid

## Overview

Grid lays out its children in columns, a step of the spacing scale apart: a number of equal columns, a column template, or as many columns as fit at a minimum width, which needs no width of the window to adapt. It is one of envUI's layout primitives, with [Row](../components/row.md), [Column](../components/column.md) and [Box](../components/box.md): a CSS grid that sizes to its content, never paints and has no role or keyboard behaviour of its own.

```tsx example=ProjectCards

```

## Anatomy

1. **Container**: a CSS grid; a `div`, or the element in `render`. It renders `data-env-layout="grid"`, and `data-env-name` from `name`.
2. **Columns** (`columns`): one column by default.
3. **Gap** (`gap`): the space between rows and between columns, a step of the spacing scale; none by default.
4. **Padding** (`padding`): an inset on every side, a step of the spacing scale; none by default.
5. **Children**: one per cell, in the reading order, row by row.

## Variants and sizes

| Columns                                   | Lays out                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `columns={3}`                             | Three equal columns, `repeat(3, minmax(0, 1fr))`, at every width.                              |
| `columns={{ min: '14rem' }}`              | As many equal columns as fit at 14 rem or wider; one in a narrow container.                    |
| `columns="minmax(0, 2fr) minmax(0, 1fr)"` | A `grid-template-columns` template as it is, such as a main column twice as wide as the other. |

- `{ min }` adapts to the grid's own width, so a grid of cards needs no container query: four columns on a wide page, one on a phone. With fewer items than columns fit, the rest stay empty, so every item keeps one width.
- In a template, write `minmax(0, 1fr)` rather than `1fr`, so long content wraps instead of widening its column.
- `align` sets where each child sits in its row: `stretch`, the default, makes children of one row as tall as each other; `start`, `center` and `end` keep each at its own height.
- `container` makes the grid a size container of that name, for the application's own container queries, such as a template that changes at a [window class](../foundations/responsive.md).

## States and behaviour

- Grid has no states and does nothing on its own: no focus, no keys, no announcements.
- Its rules have no specificity, so a component's part class or any class of the application overrides them, such as a `grid-template-columns` of its own in a container query.
- `render` renders another element for its meaning, such as `render={<ul />}` for a list of items, each a `li`.

## Do and don't

### Do

- Use `columns={{ min }}` for items of one kind, so the grid adapts to its own width.
- Keep the visual order the document order, so reading and focus follow what people see.
- Use the same minimum for grids of the same kind of item across an application.

### Don't

- Don't place children out of their order with `grid-row` or `grid-column` where people read or tab through them.
- Don't use a Grid for data people compare across rows; use a [Table](../components/table.md).
- Don't use fixed widths in a template; take fractions with `minmax(0, …)`, or a minimum in rem.

## Accessibility

### Keyboard

| Key                                             | Action                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside in document order. Grid handles no keys. |

### envUI provides

- A plain element with no role of its own, or the element in `render`, such as a list.
- Cells in the document order, row by row in the reading direction.

### You provide

- A list, `render={<ul />}` with each child a `li`, where the items are a list people count, with a name for it.
- A heading for each item that is a section of its own.

## Examples

### A main column and its details

A template gives the main column twice the width of its details.

```tsx example=MainAndDetails

```

## Changelog

- **1.0.0**: Grid, with Row, Column and Box, the layout primitives.
