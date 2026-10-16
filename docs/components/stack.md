---
title: Stack
summary: Stack lays out content in a column with even gaps; ActionGroup lays out a set of actions.
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
  - button row
  - button set
  - form actions
  - toolbar
useWhen:
  - Content runs top to bottom with even space between, such as a heading, text and a form.
  - Sections and their contents need different spacing, by nesting stacks with different gaps.
  - A few actions belong together, such as a form's Cancel and Save (ActionGroup).
  - Actions in a narrow pane need the whole width for their labels (ActionGroup with stacked).
avoidWhen:
  - text: Buttons joined into one connected control, such as a main action beside a menu of alternatives.
    use: ButtonGroup
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
  - ActionGroup
---

# Stack

## Overview

Stack lays out its children in a column with the same space between each, a step of the spacing scale, so the parent owns the spacing and the children need no margins. Nest stacks to give sections more space than the content inside them.

ActionGroup lays out a set of actions, such as a form's Cancel and Save, in a row that wraps when it runs out of room, or `stacked` in a column whose labelled buttons fill it. Neither adds a role or keyboard behaviour; they are layout only.

```tsx example=ProjectDetails

```

## Anatomy

A stack:

1. **Container**: a flex column, a `div` or the element in `as`, or the element in `render`.
2. **Gap** (`gap`): the space between direct children, a step of the spacing scale; 1 rem by default.
3. **Children**: each as wide as the stack, or at its own width with `align`. Controls such as buttons and badges keep their own width.

An action group:

1. **Container**: a flex row that wraps, or a column with `stacked`; a `div` or the element in `as`.
2. **Gap**: 1 rem between actions in a row and 0.5 rem in a column.
3. **Actions**: buttons, icon buttons and links. In a stacked group each labelled button fills the width; icon-only buttons keep their size.

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

An action group is a row by default, for actions with room beside each other, such as at the end of a form or a dialog; they wrap if needed. `stacked` puts them in a column, for a narrow pane, such as on a phone, where labels need the whole width.

<!-- specimen: ActionLayouts -->

- Stack's `align` sets where children sit across the column: `stretch`, the default, makes each as wide as the stack; `start`, `center` and `end` keep each at its own width. Buttons, chips, badges and navigation items keep their own width in any case.
- ActionGroup's `align` places a row of actions at the `start`, the `center` or the `end`, such as `end` for a form's actions. A stacked group fills its width.
- A stack and an action group never grow wider than their container, and children that hold long words or wide content shrink and wrap instead of widening them.

## States and behaviour

- Stack and ActionGroup have no states and do nothing on their own: no focus, no keys, no announcements.
- Stack removes the top and bottom margins of its direct children, so the gap is the only space between them, also for paragraphs and headings that have margins elsewhere.
- An action group in a row wraps onto more rows when its actions don't fit; it doesn't switch to `stacked` by itself. The application chooses when to stack, such as below a breakpoint.
- `as` renders another element for its meaning, such as `section` or `footer`. Stack's `render` lays out another element as the stack without a wrapper, such as a Surface or a form; set the element on that one instead of `as`.

## Content guidelines

- Order actions by importance in the reading order, and keep the main action where the eye ends: last in a row at the end of a form, first in a stacked group.
- Keep an action group to the few actions that apply to the content beside it; put the rest in a [Menu](../components/menu.md).

## Do and don't

### Do

- Let the parent own spacing: a Stack's `gap`, not margins on its children.
- Nest stacks with a larger gap outside and a smaller one inside, so related content reads as a group.
- Use `as` or `render` for meaning, such as `as="section"` with a heading, or `as="footer"` for a form's actions.
- Choose `stacked` for actions in a narrow pane, from the pane's width or a breakpoint.

### Don't

- Don't use an ActionGroup for buttons that act as one control; use a [ButtonGroup](../components/button.md), which connects them.
- Don't give an ActionGroup `role="toolbar"` unless you add arrow-key navigation; it keeps every action in the tab order.
- Don't use a Stack for columns or a grid; it lays out one column. Use the application's CSS with the spacing tokens.
- Don't put more than one primary action in an action group.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside in document order; every action in an ActionGroup is a tab stop. Neither handles keys. |

### envUI provides

- Plain elements with no role of their own, or the element in `as`: a section, an article, a navigation, a main or an aside region, a header or a footer.
- A visual order that follows the document order, so focus and reading order match what people see.

### You provide

- A heading and a name for a stack that is a region, such as `as="section"` with `aria-labelledby`.
- Labels that name each action, and an `aria-label` on icon-only buttons.
- `role="group"` and an `aria-label` on an action group whose actions need a shared name, such as a toolbar of formatting buttons.

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

`render` lays out the form as the stack. An ActionGroup with `as="footer"` and `align="end"` puts the actions at the end of the form.

```tsx example=FormActions

```

### Stacked actions

In a narrow pane, `stacked` puts the actions in a column and gives each labelled button the whole width.

```tsx example=StackedActions

```

## Changelog

- **1.0.0**: The page is `stack`, after the component, instead of `layout`.
- **0.1.0**: Stack and ActionGroup, with semantic elements, `gap`, `align` and `stacked`.
