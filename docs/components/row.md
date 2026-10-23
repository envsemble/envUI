---
title: Row
summary: Row lays out content side by side with even gaps, and wraps when it doesn't fit, such as a form's actions.
status: beta
since: 1.0.0
category: Layout & surfaces
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
  - toolbar
  - wrap
useWhen:
  - A few actions belong together, such as a form's Cancel and Save, in a row that wraps.
  - A heading and its actions share a line, with the actions at the end.
  - Small items sit side by side, such as a label and a badge.
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
---

# Row

## Overview

Row lays out its children side by side, the same step of the spacing scale apart. Like [Column](column.md), [Grid](grid.md) and [Box](box.md), it sizes to its content and never paints.

```tsx example=FormActions

```

## Variants

### Justify

`justify` places the children along the row when it has room to spare. `between` puts the first and the last at the edges, such as a heading and its action.

<!-- specimen: Justify -->

`gap` takes the steps of the [spacing scale](../foundations/spacing.md): 2 between a label and its badge, 3 between a toolbar's controls, 4 between actions.

## When to use

```tsx do=WrappingActions caption="wrap, so an action that doesn't fit moves to the next line."

```

```tsx dont=SqueezedActions caption="No wrap in a narrow pane: the labels break inside their buttons."

```

- `align="center"` for controls of different heights, such as a heading and a small button.
- Buttons that act as one control are a [ButtonGroup](button.md); a row of controls the arrow keys move through is a [Toolbar](toolbar.md).

## Adapting to width

With `wrap`, a row runs onto more lines; it never turns into a column by itself. For that, write a container query at a [window class](../foundations/responsive.md).

```tsx example=SectionHeading widths="12 30"

```

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`, such as `render={<footer />}`.
- A visual order that follows the document order and the reading direction.

### You provide

- `role="group"` and an `aria-label` on a row of actions that needs a shared name.

## Changelog

- **1.0.0**: Row, with Column, Grid and Box, replaces Stack: a Stack with `direction="row"` is a Row, which the `v1-stack` codemod writes. A Row has no gap of its own; the codemod writes `gap={4}`, Stack's default, where a Stack set none.
