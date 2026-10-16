---
title: Stack
summary: Stack lays out content in a column, or a row, with even gaps, such as a form and its actions.
status: beta
since: 0.1.0
category: Layout & surfaces
aliases:
  - Layout
  - layout
  - flex
  - flexbox
  - vstack
  - hstack
  - vertical stack
  - column
  - spacing
  - gap
  - ActionGroup
  - action group
  - row
  - button row
  - button set
  - form actions
  - toolbar
useWhen:
  - Content runs top to bottom with even space between, such as a heading, text and a form.
  - Sections and their contents need different spacing, by nesting stacks with different gaps.
  - A few actions belong together, such as a form's Cancel and Save, in a row that wraps.
  - Actions in a narrow pane need the whole width for their labels, stacked with fullWidth buttons.
avoidWhen:
  - text: Buttons joined into one connected control, such as a main action beside a menu of alternatives.
    use: ButtonGroup
  - text: Controls for one subject that the arrow keys move between, such as an editor's formatting.
    use: Toolbar
  - text: A background, an inset and corners around content.
    use: Surface
  - text: A block with a heading, metadata and actions.
    use: Card
  - text: Rows of items with labels, descriptions and actions.
    use: List
  - text: Content in columns or a grid; lay it out in the application's CSS with the spacing tokens.
  - text: The frame of an application, with a header and a sidebar.
    use: AppShell
related:
  - surface
  - card
  - button
  - spacing
components:
  - Stack
---

# Stack

## Overview

Stack lays out its children in a column, or with `direction="row"` side by side, with the same space between each, a step of the spacing scale, so the parent owns the spacing and the children need no margins. Nest stacks to give sections more space than the content inside them.

A row of actions, such as a form's Cancel and Save, is a Stack with `direction="row"`, `wrap` and `justify`; actions stacked in a narrow pane are a column of buttons with `fullWidth`. Stack adds no role or keyboard behaviour; it is layout only.

```tsx example=ProjectDetails

```

## Anatomy

1. **Container**: a flex column, or a row with `direction="row"`, that wraps with `wrap`; a `div`, or the element in `render`.
2. **Gap** (`gap`): the space between direct children, a step of the spacing scale; 1 rem by default.
3. **Children**: in a column each as wide as the stack, or at its own width with `align`; in a row, placed along it with `justify`. Controls such as buttons and badges keep their own width, unless a button has `fullWidth`.

## Variants and sizes

| Gap                 | Space    | Use for                                                           |
| ------------------- | -------- | ----------------------------------------------------------------- |
| `gap={1}`           | 0.25 rem | A heading and its description, a label and its value.             |
| `gap={2}`           | 0.5 rem  | Short lines that read as one block, such as a list of facts.      |
| `gap={3}`           | 0.75 rem | Tightly related controls, such as fields in a compact form.       |
| `gap={4}`           | 1 rem    | Most content: paragraphs, fields and actions. The default.        |
| `gap={5}`           | 1.5 rem  | Groups inside a section, such as a form's fields and its actions. |
| `gap={6}`–`gap={9}` | 2–4 rem  | Sections of a page.                                               |
| `gap={0}`           | None     | Children that bring their own spacing.                            |

<!-- specimen: GapScale -->

A row of actions, for actions with room beside each other, such as at the end of a form or a dialog, is `direction="row"` with `wrap`, `align="center"` and `gap={4}`; `justify="end"` puts it at the end. In a narrow pane, such as on a phone, where labels need the whole width, a column with `gap={2}` holds buttons with `fullWidth`.

<!-- specimen: ActionLayouts -->

- `align` sets where children sit across the stack: `stretch`, the default, makes each as wide as a column (as tall as a row); `start`, `center` and `end` keep each at its own size. Buttons, chips, badges and navigation items keep their own width in any case.
- `justify` places the children along the stack when there is room to spare: at the `start`, the default, in the `center`, at the `end`, such as `end` for a form's actions, or `between`, spread out to the edges.
- `wrap` lets a row run onto more lines when its children don't fit.
- A stack never grows wider than its container, and children that hold long words or wide content shrink and wrap instead of widening it.

## States and behaviour

- Stack has no states and does nothing on its own: no focus, no keys, no announcements.
- Stack removes the top and bottom margins of its direct children, and in a row their side margins too, so the gap is the only space between them, also for paragraphs and headings that have margins elsewhere.
- A row with `wrap` runs onto more lines when its children don't fit; it doesn't turn into a column by itself. The application chooses when to stack actions, such as below a breakpoint.
- `render` renders another element for its meaning, such as `render={<section />}` or `render={<footer />}`, or lays out another component as the stack without a wrapper, such as a Surface or a form.

## Content guidelines

- Order actions by importance in the reading order, and keep the main action where the eye ends: last in a row at the end of a form, first in a stacked column.
- Keep a row of actions to the few that apply to the content beside it; put the rest in a [Menu](../components/menu.md).

## Do and don't

### Do

- Let the parent own spacing: a Stack's `gap`, not margins on its children.
- Nest stacks with a larger gap outside and a smaller one inside, so related content reads as a group.
- Use `render` for meaning, such as `render={<section />}` with a heading, or `render={<footer />}` for a form's actions.
- Stack actions with `fullWidth` buttons in a narrow pane, from the pane's width or a breakpoint.

### Don't

- Don't use a row of buttons for buttons that act as one control; use a [ButtonGroup](../components/button.md), which connects them.
- Don't give a Stack `role="toolbar"`; use a [Toolbar](../components/toolbar.md), which adds the arrow keys.
- Don't use a Stack for columns of content or a grid; it lays out one line. Use the application's CSS with the spacing tokens.
- Don't put more than one primary action in a row of actions.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside in document order; every action in a row of actions is a tab stop. Stack handles no keys. |

### envUI provides

- A plain element with no role of its own, or the element in `render`, such as a section, an article, a navigation, a main or an aside region, a header or a footer.
- A visual order that follows the document order, so focus and reading order match what people see.

### You provide

- A heading and a name for a stack that is a region, such as `render={<section />}` with `aria-labelledby`.
- Labels that name each action, and an `aria-label` on icon-only buttons.
- `role="group"` and an `aria-label` on a row of actions that need a shared name.

## Examples

### Spacing sections and their content

A larger gap between sections and a smaller one inside them group what belongs together.

```tsx example=NestedSpacing

```

### Centred content

`align="center"` keeps each child at its own width in the middle of the column.

```tsx example=CenteredContent

```

### Form actions

`render` lays out the form as the stack. A row with `render={<footer />}` and `justify="end"` puts the actions at the end of the form.

```tsx example=FormActions

```

### Stacked actions

In a narrow pane, a column of buttons with `fullWidth` gives each label the whole width.

```tsx example=StackedActions

```

## Changelog

- **1.0.0**: `direction`, `wrap` and `justify`; `render` replaces `as`. ActionGroup is gone: a row of actions is a Stack with `direction="row"` and `wrap`, and a stacked one a column of `fullWidth` buttons, which the `v1-structure` codemod writes. The page is `stack`, after the component, instead of `layout`.
- **0.1.0**: Stack and ActionGroup, with semantic elements, `gap`, `align` and `stacked`.
