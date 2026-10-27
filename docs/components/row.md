---
title: Row
summary: Row lays out content side by side with even gaps, and wraps when it doesn't fit, such as a form's actions.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - Stack
  - hstack
  - horizontal stack
  - flex
  - flexbox
  - inline
  - ActionGroup
  - action group
  - button row
  - button set
  - form actions
  - wrap
useWhen:
  - A few actions that belong together, such as Cancel and Save
  - A heading and its actions on one line
  - Small items side by side, such as a label and a badge
avoidWhen:
  - text: Content top to bottom.
    use: Column
  - text: Content in columns of equal or set widths, such as cards.
    use: Grid
  - text: Buttons joined into one connected control, such as a main action beside a menu of alternatives.
    use: ButtonGroup
  - text: Controls for one subject that the arrow keys move between, such as an editor's formatting.
    use: Toolbar
  - text: One block with an inset or a size container, and no layout.
    use: Box
components:
  - Row
examples:
  FormActions: overview
  WrappingActions:
    role: do
    caption: A row that wraps, so an action that doesn't fit moves down.
  SqueezedActions:
    role: dont
    caption: 'No wrap in a narrow pane: the labels break inside their buttons.'
  SectionHeading: example
---

# Row

## Variants

### Justify

Where the row has room to spare, its children sit at the start, in the center, at the end, or spread to the edges, such as a heading and its action.

<!-- specimen: Justify -->

### Gaps

The gap between the children is a step of the [spacing scale](../foundations/spacing.md).

| Gap    | Use for                    |
| ------ | -------------------------- |
| Step 2 | A label and its badge.     |
| Step 3 | A toolbar's controls.      |
| Step 4 | Actions, such as a form's. |

## Behaviour

### Adapting to width

A row that wraps runs onto more lines; it never turns into a column by itself; change the layout at a [window class](../foundations/responsive.md) for that.

```tsx figure=SectionHeading widths="30 12" sweep

```

## Rules

A row that may get narrow wraps, so its children keep their shape.

```tsx figure=WrappingActions motion

```

```tsx figure=SqueezedActions motion

```

### Alignment

Center controls of different heights on their line, such as a heading and a small button.

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`, such as `render={<footer />}`.
- A visual order that follows the document order and the reading direction.

### You provide

- `role="group"` and an `aria-label` on a row of actions that needs a shared name.

## Compose

### Usage

Row lays out its children side by side, in the reading direction.

- `gap` is the space between them, a step of the spacing scale from `0` to `9`, none by default: `2` between a label and its badge, `3` between a toolbar's controls, `4` between actions.
- `wrap` lets the row run onto more lines when its children don't fit.

```tsx source=FormActions

```

#### Align and justify

`align` lines the children up across the line, and `justify` places them along it when there is room to spare.

- `align`: `stretch`, the default, makes each as tall as the row, except controls such as buttons, which keep their own size; `start`, `center` and `end` keep each at its own size, and `center` suits controls of different heights.
- `justify`: `start`, the default, `center`, `end`, or `between`, out to the edges, such as a heading and its action.

```tsx
<Row wrap align="center" justify="between" gap={3}>
  <Row align="center" gap={2}>
    <Text render={<h3 />} variant="title">
      Members
    </Text>
    <Badge>12</Badge>
  </Row>
  <Button variant="secondary" size="sm" startIcon={<Add />}>
    Invite people
  </Button>
</Row>
```

#### Element, inset and name

- `render` gives the row its meaning, such as `render={<footer />}` or `render={<ul />}`, or lays out another component without a wrapper, such as a Surface; `ref` reaches the rendered element.
- `padding` sets an inset on every side, a step of the spacing scale, none by default.
- `name` names the node for dev mode, as `data-env-name`.

#### A row that becomes a column

A row never turns into a column by itself. `container` makes it a size container of that name, so CSS can change the layout at a window class, such as `container="filters"` with `@container filters (width >= 37.5rem)`.

## Changelog

- **1.0.0**: Row, with Column, Grid and Box, replaces Stack: a Stack with `direction="row"` is a Row, which the `v1-stack` codemod writes. A Row has no gap of its own; the codemod writes `gap={4}`, Stack's default, where a Stack set none.
