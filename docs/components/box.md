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
  - An inset and nothing else, such as around a region of a page
  - A region whose width the application's own styles respond to
  - A region that shows up by name in dev mode and the docs
avoidWhen:
  - text: Children one under another with gaps.
    use: Column
  - text: Children side by side with gaps.
    use: Row
  - text: Children in columns.
    use: Grid
  - text: A background, a border or corners.
    use: Surface
components:
  - Box
---

# Box

## Overview

Like [Row](row.md), [Column](column.md) and [Grid](grid.md), Box sizes to its content and never paints.

```tsx example=InsetRegion

```

## When to use

```tsx do=OneInset caption="One inset on the region, and a Column inside for the gaps."

```

```tsx dont=BoxPerChild caption="A padded box around each child: every gap is different."

```

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`, such as `render={<section />}`.
- No keys, focus or announcements of its own.

### You provide

- A heading and a name for a box that is a region, such as `aria-labelledby` on a section.

## In code

### Usage

Box renders a `div`, or the element in `render`, such as `render={<section />}`, which takes its attributes. `padding` sets its inset on every side, a step of the spacing scale, none by default. `name` names the region for dev mode and agents, as `data-env-name`.

```tsx source=InsetRegion

```

#### Size container

`container="summary"` makes the box a size container that the application's style sheet can query, such as `@container summary (width >= 37.5rem)`. A container is as wide as its context gives it, never as its content, so give one in a flex row a width of its own.

```tsx
import { Box, Column, Grid, Text } from '@envsemble/envui';

const figures = [
  ['Open tasks', '24'],
  ['Done this week', '9'],
  ['Overdue', '2'],
];

export default function SizeContainer() {
  return (
    // A container the application's own style sheet can query, such as
    // @container summary (width >= 37.5rem) { … }; the box is as wide as its context gives it.
    <Box container="summary">
      <Grid columns="repeat(auto-fit, minmax(min(100%, 9rem), 1fr))" gap={4}>
        {figures.map(([label, value]) => (
          <Column key={label} gap={1}>
            <Text variant="body-sm" emphasis="muted">
              {label}
            </Text>
            <Text variant="headline">{value}</Text>
          </Column>
        ))}
      </Grid>
    </Box>
  );
}
```

The `env-*` container names are envUI's own. Use `container="env-window"` only for a preview frame whose content should lay out at the box's width, as a window of its own.

### Composition

Put one inset on the region and a Column, Row or Grid inside it for the gaps, rather than a padded box around each child. Box has no fill, border or corners: a Surface has them.

## Changelog

- **1.0.0**: Box, with Row, Column and Grid, the layout primitives.
