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
related:
  - row
  - grid
  - box
  - surface
  - spacing
components:
  - Column
---

# Column

## Overview

Column lays out its children one under another, with the same space between each, a step of the spacing scale, so the parent owns the spacing and the children need no margins. Nest columns to give sections more space than the content inside them. It is one of envUI's layout primitives, with [Row](../components/row.md), [Grid](../components/grid.md) and [Box](../components/box.md): a flex column that sizes to its content, never paints and has no role or keyboard behaviour of its own.

```tsx example=ProjectDetails

```

## Anatomy

1. **Container**: a flex column; a `div`, or the element in `render`. It renders `data-env-layout="column"`, and `data-env-name` from `name`.
2. **Gap** (`gap`): the space between direct children, a step of the spacing scale; none by default.
3. **Padding** (`padding`): an inset on every side, a step of the spacing scale; none by default.
4. **Children**: each as wide as the column, or at its own width with `align`; placed along it with `justify` when the column is taller than they are. Controls such as buttons and badges keep their own width, unless a button has `fullWidth`.

## Variants and sizes

| Gap                 | Space    | Use for                                                           |
| ------------------- | -------- | ----------------------------------------------------------------- |
| `gap={1}`           | 0.25 rem | A heading and its description, a label and its value.             |
| `gap={2}`           | 0.5 rem  | Short lines that read as one block, such as a list of facts.      |
| `gap={3}`           | 0.75 rem | Tightly related controls, such as fields in a compact form.       |
| `gap={4}`           | 1 rem    | Most content: paragraphs, fields and actions.                     |
| `gap={5}`           | 1.5 rem  | Groups inside a section, such as a form's fields and its actions. |
| `gap={6}`–`gap={9}` | 2–4 rem  | Sections of a page.                                               |
| `gap={0}`, or none  | None     | Children that bring their own spacing.                            |

The steps are smaller at the compact scale, as every spacing token is.

<!-- specimen: GapScale -->

- `align` sets where children sit across the column: `stretch`, the default, makes each as wide as the column; `start`, `center` and `end` keep each at its own width. Buttons, chips, badges and navigation items keep their own width in any case.
- `justify` places the children along the column when it is taller than they are: at the `start`, the default, in the `center`, at the `end`, or `between`, spread out to the edges.
- `container` makes the column a size container of that name, for the application's own container queries.
- A column never grows wider than its container, and children that hold long words or wide content shrink and wrap instead of widening it.

## States and behaviour

- Column has no states and does nothing on its own: no focus, no keys, no announcements.
- Column removes the top and bottom margins of its direct children, so the gap is the only space between them, also for paragraphs and headings that have margins elsewhere.
- Its rules have no specificity, so a component's part class or any class of the application overrides them, such as a `gap` of its own.
- `render` renders another element for its meaning, such as `render={<section />}` or `render={<form />}`, or lays out another component as the column without a wrapper, such as a Surface.

## Do and don't

### Do

- Let the parent own spacing: a Column's `gap`, not margins on its children.
- Nest columns with a larger gap outside and a smaller one inside, so related content reads as a group.
- Use `render` for meaning, such as `render={<section />}` with a heading.
- Stack actions with `fullWidth` buttons in a narrow pane.

### Don't

- Don't use a Column for content in columns or a grid; use a [Grid](../components/grid.md).
- Don't put a fill, a border or corners on a Column; use a [Surface](../components/surface.md), with the Column through `render`.
- Don't give a Column `role="toolbar"`; use a [Toolbar](../components/toolbar.md), which adds the arrow keys.

## Accessibility

### Keyboard

| Key                                             | Action                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside in document order. Column handles no keys. |

### envUI provides

- A plain element with no role of its own, or the element in `render`, such as a section, an article, a navigation or an aside region, a header or a footer.
- A visual order that follows the document order, so focus and reading order match what people see.

### You provide

- A heading and a name for a column that is a region, such as `render={<section />}` with `aria-labelledby`.
- `role="group"` and an `aria-label` on a column of actions that need a shared name.

## Examples

### Spacing sections and their content

A larger gap between sections and a smaller one inside them group what belongs together.

```tsx example=NestedSpacing

```

### Centred content

`align="center"` keeps each child at its own width in the middle of the column.

```tsx example=CenteredContent

```

### Stacked actions

In a narrow pane, a column of buttons with `fullWidth` gives each label the whole width.

```tsx example=StackedActions

```

## Changelog

- **1.0.0**: Column, Row, Grid and Box replace Stack: a Stack is a Column, or a Row with `direction="row"`, which the `v1-stack` codemod writes. A Column has no gap of its own; the codemod writes `gap={4}`, Stack's default, where a Stack set none.
