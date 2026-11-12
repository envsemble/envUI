---
title: Column
summary: Lays out content one under another with even gaps.
status: beta
since: 1.0.0
category: App frame & layout
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
  - Content from top to bottom with even space, such as a heading, text and a form
  - Sections and their contents spaced apart differently, as nested columns
  - Actions stacked across the whole width of a narrow pane
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
examples:
  ProjectDetails: overview
  CenteredContent: example
  NestedSpacing:
    role: do
    caption: A larger gap between sections and a smaller one inside them.
  OneGapForAll:
    role: dont
    caption: 'One gap for everything: the sections run together.'
---

# Column

## Variants

### Gaps

The space between the children is a step of the [spacing scale](../foundations/spacing.md), a little smaller at the compact scale.

<!-- specimen: GapScale -->

| Gap       | Use for                                                           |
| --------- | ----------------------------------------------------------------- |
| Step 1    | A heading and its description, a label and its value.             |
| Steps 2–3 | Short lines that read as one block, or a compact form.            |
| Step 4    | Most content: paragraphs, fields and actions.                     |
| Step 5    | Groups inside a section, such as a form's fields and its actions. |
| Steps 6–9 | Sections of a page.                                               |

### Alignment

Each child is as wide as the column by default, or keeps its own width at the start, the middle or the end.

- Buttons, chips and badges keep their own width in any case.

```tsx figure=CenteredContent

```

## Rules

Space says what belongs together: a larger gap between sections, and a smaller one inside them.

```tsx figure=NestedSpacing

```

```tsx figure=OneGapForAll

```

### A fill and corners

A Column paints nothing: a fill, a border or corners come from a [Surface](surface.md) that the Column lays out.

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`.
- A visual order that follows the document order.

### You provide

- A heading and a name for a column that is a region, such as `aria-labelledby` on a section.

## Compose

### Usage

```tsx source=ProjectDetails

```

- `gap` is a step of the spacing scale, from `1`, 0.25 rem, to `9`, 4 rem, and `0`; a Column has none by default.
- `align` is `stretch`, the default, which makes each child as wide as the column, or `start`, `center` or `end`, which keep each child at its own width; buttons, chips and badges keep theirs in any case.
- `justify` places the children along the column where there is room to spare: `start`, the default, `center`, `end` or `between`.
- `padding` insets it by a step of the same scale.

#### Stacked actions

In a narrow pane, stack the actions in a Column and give each Button `fullWidth`, so the labels have the whole width.

```tsx
<Column gap={2}>
  <Button fullWidth>Publish</Button>
  <Button fullWidth variant="secondary">
    Save draft
  </Button>
</Column>
```

### Composition

`render` gives the column its element, such as `render={<section />}` or `render={<form />}`, or lays out another component without a wrapper.

- A Surface with `render={<Column gap={4} />}` has the Surface's fill, inset and corners and the Column's layout.
- Nest columns with different gaps for sections and their contents, a larger gap between them and a smaller one inside.

```tsx
<Surface background="default" padding={5} render={<Column render={<section />} gap={4} />}>
  …
</Surface>
```

## Changelog

- **1.0.0**: Column, Row, Grid and Box replace Stack: a Stack is a Column, or a Row with `direction="row"`. A Column has no gap of its own, where Stack's default was `gap={4}`.
