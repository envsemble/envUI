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
related:
  - column
  - grid
  - box
  - toolbar
  - button
components:
  - Row
---

# Row

## Overview

Row lays out its children side by side, with the same space between each, a step of the spacing scale; with `wrap` it runs onto more lines when they don't fit. It is one of envUI's layout primitives, with [Column](../components/column.md), [Grid](../components/grid.md) and [Box](../components/box.md): a flex row that sizes to its content, never paints and has no role or keyboard behaviour of its own.

A row of actions, such as a form's Cancel and Save, is a Row with `wrap`, `align="center"` and `justify="end"`.

```tsx example=FormActions

```

## Anatomy

1. **Container**: a flex row in the reading direction, which wraps with `wrap`; a `div`, or the element in `render`. It renders `data-env-layout="row"`, and `data-env-name` from `name`.
2. **Gap** (`gap`): the space between direct children, and between lines when it wraps, a step of the spacing scale; none by default.
3. **Padding** (`padding`): an inset on every side, a step of the spacing scale; none by default.
4. **Children**: placed along the row with `justify`, and across it with `align`; each keeps its own width and shrinks before the row overflows.

## Variants and sizes

The gaps are the steps of the spacing scale, as on [Column](../components/column.md): `gap={2}` (0.5 rem) between small items such as a label and its badge, `gap={3}` (0.75 rem) between a toolbar's controls, `gap={4}` (1 rem) between actions.

<!-- specimen: ActionLayouts -->

- `justify` places the children along the row when there is room to spare: at the `start`, the default, in the `center`, at the `end`, such as a form's actions, or `between`, the first and last at the edges, such as a heading and its actions.
- `align` sets where children sit across the row: `stretch`, the default, makes each as tall as the row; `start`, `center` and `end` keep each at its own height. Use `center` for a row of controls of different heights.
- `wrap` lets the row run onto more lines when its children don't fit; without it, they shrink.
- `container` makes the row a size container of that name, for the application's own container queries.

## States and behaviour

- Row has no states and does nothing on its own: no focus, no keys, no announcements.
- Row removes the margins of its direct children, so the gap is the only space between them.
- A row with `wrap` runs onto more lines when its children don't fit; it doesn't turn into a column by itself. Where a row should become a column at a width, lay it out with a container query of the application's own, at a [window class](../foundations/responsive.md).
- Its rules have no specificity, so a component's part class or any class of the application overrides them.
- `render` renders another element for its meaning, such as `render={<footer />}` for a form's actions.

## Content guidelines

- Order actions by importance in the reading order, and keep the main action where the eye ends: last in a row at the end of a form.
- Keep a row of actions to the few that apply to the content beside it; put the rest in a [Menu](../components/menu.md).

## Do and don't

### Do

- Let the parent own spacing: a Row's `gap`, not margins on its children.
- Give a row of actions `wrap`, so the labels never overflow a narrow container.
- Use `justify="between"` for a heading and its actions on one line.

### Don't

- Don't use a row of buttons for buttons that act as one control; use a [ButtonGroup](../components/button.md), which connects them.
- Don't give a Row `role="toolbar"`; use a [Toolbar](../components/toolbar.md), which adds the arrow keys.
- Don't put more than one primary action in a row of actions.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside in document order; every action in a row of actions is a tab stop. Row handles no keys. |

### envUI provides

- A plain element with no role of its own, or the element in `render`, such as a header or a footer.
- A visual order that follows the document order and the reading direction, so focus and reading order match what people see.

### You provide

- Labels that name each action, and an `aria-label` on icon-only buttons.
- `role="group"` and an `aria-label` on a row of actions that need a shared name.

## Examples

### A heading and its actions

`justify="between"` puts the heading at the start and the action at the end; with `wrap`, the action moves under the heading when there isn't room.

```tsx example=SectionHeading

```

## Changelog

- **1.0.0**: Row, with Column, Grid and Box, replaces Stack: a Stack with `direction="row"` is a Row, which the `v1-stack` codemod writes. A Row has no gap of its own; the codemod writes `gap={4}`, Stack's default, where a Stack set none.
