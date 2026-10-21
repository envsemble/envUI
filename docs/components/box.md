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

Box is a plain block for an inset, a size container or a name, with no layout of its own. Like [Row](row.md), [Column](column.md) and [Grid](grid.md), it sizes to its content and never paints.

```tsx example=InsetRegion

```

### Size container

`container="summary"` makes the box a size container that the application's style sheet can query, such as `@container summary (width >= 37.5rem)`. Give one in a flex row a width of its own: a container takes its width from its context, never from its content.

```tsx example=SizeContainer

```

## When to use

```tsx do=OneInset caption="One inset on the region, and a Column inside for the gaps."

```

```tsx dont=BoxPerChild caption="A padded box around each child: every gap is different."

```

- `name` names a region for dev mode and agents, as `data-env-name`.
- The `env-*` container names are envUI's own; `container="env-window"` only for a preview frame whose content should lay out at the box's width.

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`, such as `render={<section />}`.
- No keys, focus or announcements of its own.

### You provide

- A heading and a name for a box that is a region, such as `aria-labelledby` on a section.

## Changelog

- **1.0.0**: Box, with Row, Column and Grid, the layout primitives.
