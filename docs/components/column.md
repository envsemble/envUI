---
title: Column
summary: Column lays out content one under another with even gaps, such as a heading, text and a form.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - Stack
  - Layout
  - layout
  - flex
  - flexbox
  - vstack
  - vertical stack
  - stack
  - spacing
  - gap
  - stacked actions
useWhen:
  - Content runs top to bottom with even space between, such as a heading, text and a form.
  - Sections and their contents need different spacing, by nesting columns with different gaps.
  - Actions in a narrow pane need the whole width for their labels, stacked with fullWidth buttons.
avoidWhen:
  - text: Children side by side, such as a form's actions.
    use: Row
  - text: Content in columns, such as cards or a main column beside its details.
    use: Grid
  - text: An inset or a size container around content, without a column of its own.
    use: Box
  - text: A background, an inset and corners around content.
    use: Surface
  - text: A block with a heading, metadata and actions.
    use: Card
components:
  - Column
---

# Column

## Overview

Column lays out its children one under another, the same step of the spacing scale apart, so the children need no margins. Like [Row](row.md), [Grid](grid.md) and [Box](box.md), it sizes to its content and never paints.

```tsx example=ProjectDetails

```

## Variants

### Gaps

`gap` takes a step of the [spacing scale](../foundations/spacing.md), smaller at the compact scale.

<!-- specimen: GapScale -->

| Gap | Use for                                                           |
| --- | ----------------------------------------------------------------- |
| 1   | A heading and its description, a label and its value.             |
| 2–3 | Short lines that read as one block, or a compact form.            |
| 4   | Most content: paragraphs, fields and actions.                     |
| 5   | Groups inside a section, such as a form's fields and its actions. |
| 6–9 | Sections of a page.                                               |

### Alignment

`align` keeps each child at its own width, at the `start`, `center` or `end`; the default, `stretch`, makes each as wide as the column. Buttons, chips and badges keep their own width in any case.

```tsx example=CenteredContent

```

## When to use

```tsx do=NestedSpacing caption="A larger gap between sections and a smaller one inside them."

```

```tsx dont=OneGapForAll caption="One gap for everything: the sections run together."

```

- A fill, a border or corners come from a [Surface](surface.md), with the Column through `render`.
- `render` gives the column its meaning, such as `render={<section />}` or `render={<form />}`.

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`.
- A visual order that follows the document order.

### You provide

- A heading and a name for a column that is a region, such as `aria-labelledby` on a section.

## Changelog

- **1.0.0**: Column, Row, Grid and Box replace Stack: a Stack is a Column, or a Row with `direction="row"`, which the `v1-stack` codemod writes. A Column has no gap of its own; the codemod writes `gap={4}`, Stack's default, where a Stack set none.
