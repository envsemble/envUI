---
title: Box
summary: Box is a plain block for an inset, a size container or a named region, with no layout of its own.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - div
  - block
  - wrapper
  - inset
  - padding
  - container
  - size container
  - container query
  - region
useWhen:
  - Content needs an inset and nothing else, such as a region of a page.
  - The application's style sheet queries a region's width, through a named size container.
  - A region should show up by name in dev mode and the docs.
avoidWhen:
  - text: Children one under another with gaps.
    use: Column
  - text: Children side by side with gaps.
    use: Row
  - text: Children in columns.
    use: Grid
  - text: A background, a border or corners.
    use: Surface
related:
  - column
  - row
  - grid
  - surface
  - responsive
components:
  - Box
---

# Box

## Overview

Box is a plain block: an inset (`padding`), a size container (`container`) or a named node (`name`), with no gap, no flex and no grid. It is one of envUI's layout primitives, with [Row](../components/row.md), [Column](../components/column.md) and [Grid](../components/grid.md): it sizes to its content, never paints and has no role or keyboard behaviour of its own. Where its children need space between them, use a Column or a Row instead, or inside it.

```tsx example=InsetRegion

```

## Anatomy

1. **Container**: a `div`, or the element in `render`. It renders `data-env-layout="box"`, and `data-env-name` from `name`.
2. **Padding** (`padding`): an inset on every side, a step of the spacing scale; none by default.
3. **Children**: in the normal flow.

## Variants and sizes

- `padding` takes the steps of the spacing scale: `padding={4}` is 1 rem, `padding={5}` 1.5 rem, `padding={6}` 2 rem, smaller at the compact scale.
- `container="summary"` makes the box an inline-size container named `summary`, for container queries in the application's style sheet, such as `@container summary (width < 37.5rem)`. A container is as wide as its context gives it, never as its content, so give one in a flex row a width of its own.
- `name="invitation"` names the node for dev mode and the docs, as `data-env-name`. A component's part class names a node first.

## States and behaviour

- Box has no states and does nothing on its own: no focus, no keys, no announcements.
- Its rules have no specificity, so a component's part class or any class of the application overrides them.
- `render` renders another element for its meaning, such as `render={<section />}` or `render={<aside />}`.

## Do and don't

### Do

- Name the regions of a page, so dev mode and agents can refer to them.
- Use a named container for a region whose own width the application's style sheet queries.

### Don't

- Don't nest boxes to space content; use a [Column](../components/column.md) or a [Row](../components/row.md), whose gap spaces it.
- Don't paint a Box with a background or a border; use a [Surface](../components/surface.md).

## Accessibility

### Keyboard

| Key                                             | Action                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside in document order. Box handles no keys. |

### envUI provides

- A plain element with no role of its own, or the element in `render`, such as a section, an aside or a navigation region.

### You provide

- A heading and a name for a box that is a region, such as `render={<section />}` with `aria-labelledby`.

## Examples

### A size container

`container` names the box for the application's own container queries.

```tsx example=SizeContainer

```

## Changelog

- **1.0.0**: Box, with Row, Column and Grid, the layout primitives.
