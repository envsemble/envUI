---
title: Surface
summary: A container with a background, an inset and corners, but no layout of its own.
status: beta
since: 0.1.0
category: Layout & surfaces
aliases:
  - panel
  - pane
  - container
  - box
  - background
  - paper
  - well
  - region
  - compact toolbar
useWhen:
  - A region needs a background, an inset and corners, such as a detail pane or a side panel.
  - A block should stand apart from what is around it, such as a raised summary on a pane.
  - A toolbar floats over dense content, such as a diagram, with compact controls inside.
avoidWhen:
  - text: Content with a heading, metadata and actions, or a block people press to open something.
    use: Card
  - text: Rows of items that people scan, each with a label, a description and actions.
    use: List
  - text: Space between children without a background.
    use: Stack
  - text: Content over the page that people dismiss, such as a form in a window.
    use: Dialog
  - text: A floating panel that opens from a button.
    use: Popover
related:
  - stack
  - card
  - list
  - spacing
  - colors
components:
  - Surface
---

# Surface

## Overview

A surface gives a region a background, an inset on every side and rounded corners, and nothing else: it has no border, no gaps between its children and no behaviour. Lay out what it holds with a [Stack](../components/stack.md) or an ActionGroup, through `render` on the same element or inside it. Card and other containers build on Surface.

```tsx example=DetailPane

```

## Anatomy

1. **Background** (`tone`): the fill, with no border.
2. **Inset** (`padding`): the space between the edge and the content, the same on every side.
3. **Corners** (`corners`): the radius of all four corners.
4. **Content**: the surface's children, laid out by what they are rendered with, such as a Stack.

## Variants and sizes

| Background  | Use for                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| `pane`      | Panes and side regions on the page, in the default background. The default.              |
| `row`       | Blocks in the muted background of rows, such as a group of settings.                     |
| `canvas`    | A region in the page background, such as a well inside a pane that returns to the page.  |
| `alternate` | A block in the raised background that stands out on a pane, such as a summary inside it. |

<!-- specimen: TonesAndCorners -->

- **Corners**: `surface`, the default, gives panes and other large regions 1.75 rem corners; `standard` gives small blocks, such as a summary inside a pane, 0.5 rem corners; `pill` gives a toolbar or a bar of filters fully rounded ends; and `none` leaves square corners for a region that meets the edges of its container, such as a full-width band.
- **Inset**: without `padding`, the inset follows the window: 1.25 rem in narrow windows, growing to 1.5 rem from 50 rem wide. `padding` takes a step of the spacing scale instead, from 1 (0.25 rem) to 9 (4 rem), and 0 removes it.
- **Backgrounds**: `pane` is `--color-bg-default`, `row` is `--color-bg-muted`, `canvas` is `--color-bg-page` and `alternate` is `--color-bg-raised`, the background roles of [colors and themes](../foundations/colors.md). In the light theme `alternate` is white, like the page; in the dark theme it matches `pane`.
- **Width**: a surface is as wide as its container allows and never wider; set a width on it, or on its container, to make it narrower.
- **Density**: `density="compact"` gives the buttons, icon buttons, selects and compact fields inside, also nested ones, the 2 rem compact control height instead of 2.5 rem. On touch screens they keep the 2.75 rem touch height.

<!-- specimen: Density -->

## States and behaviour

- A surface has no hover, pressed, focus or disabled state, and does nothing on its own. Interactive containers, such as a Card with `href`, add their own states.
- `as` renders another element for its meaning, such as `section` or `aside`; `render` draws the surface onto another element, such as a Stack, without a wrapper. Set the element on that one instead of `as`.

## Content guidelines

- Give a surface that stands for a region a visible heading, such as "Billing", and name the region with it.
- Keep one level of nesting where you can: a raised or muted block inside a pane, not a surface in a surface in a surface.

## Do and don't

### Do

- Lay out a surface's content with a Stack through `render`, so the surface and its layout are one element.
- Use `pill` corners and `density="compact"` for a toolbar that floats over dense content.
- Use the background roles for what they mean: `pane` for panes, `alternate` for a block that stands out on a pane.

### Don't

- Don't add margins to a surface's children for space between them; lay them out with a [Stack](../components/stack.md).
- Don't build a card from a surface by hand; use [Card](../components/card.md), which has its layout, actions and interactive states.
- Don't tell regions apart by their background alone; the fills are close in contrast, so give each region a heading or a label.
- Don't give a surface `role="toolbar"` unless you add arrow-key navigation; a group of controls with an accessible name keeps them all in the tab order.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside, in order; the surface itself is not focusable and handles no keys. |

### envUI provides

- A plain element with no role of its own, so it adds nothing to what assistive technology reads; `as` renders a section, an article, a navigation, a main or an aside region, a header or a footer instead.
- Compact controls inside a compact surface that keep the 2.75 rem touch target on touch screens.

### You provide

- A role and a name where the surface is a region or a group, such as `as="section"` with `aria-labelledby` pointing at its heading, or `role="group"` with an `aria-label` on a toolbar.
- Headings or labels that set regions apart, rather than the background alone.

## Examples

### A raised block on a pane

`tone="alternate"` sets a block apart on a pane; standard corners suit its smaller size.

```tsx example=RaisedOnPane

```

### Compact toolbar

A pill surface with `density="compact"` holds a toolbar over dense content. `render` lays its controls out as an ActionGroup, and `role="group"` with a label names them together.

```tsx example=CompactToolbar

```

## Changelog

- **1.0.0**: The backgrounds take the semantic background colors: `pane` is `--color-bg-default`, `row` `--color-bg-muted`, `canvas` `--color-bg-page` and `alternate` `--color-bg-raised`.
- **0.5.0**: `density="compact"`, which gives the controls inside the compact height.
- **0.4.0**: The inset is at least 1.25 rem.
- **0.1.0**: Surface, with backgrounds, padding and corners.
