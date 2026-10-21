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
  - toolbar
  - skeleton
  - placeholder
  - loading
useWhen:
  - A region needs a background, an inset and corners, such as a detail pane or a side panel.
  - A block should stand apart from what is around it, such as a raised summary on a pane.
  - A toolbar floats over dense content, such as a diagram, with small controls inside.
avoidWhen:
  - text: Content with a heading, metadata and actions, or a block people press to open something.
    use: Card
  - text: Rows of items that people scan, each with a label, a description and actions.
    use: List
  - text: Space between children without a background.
    use: Column
  - text: Content over the page that people dismiss, such as a form in a window.
    use: Dialog
  - text: A floating panel that opens from a button.
    use: Popover
related:
  - column
  - card
  - list
  - spacing
  - colors
components:
  - Surface
  - placeholders
  - isPlaceholder
  - useSkeleton
---

# Surface

## Overview

A surface gives a region a background, an inset on every side and rounded corners, and nothing else: it has no border, no gaps between its children and no behaviour. Lay out what it holds with a [Column](../components/column.md) or a [Row](../components/row.md), through `render` on the same element or inside it. Card and other containers build on Surface.

```tsx example=DetailPane

```

## Anatomy

1. **Background** (`background`): the fill, with no border.
2. **Inset** (`padding`): the space between the edge and the content, the same on every side.
3. **Corners** (`radius`): the radius of all four corners.
4. **Content**: the surface's children, laid out by what they are rendered with, such as a Column.

## Variants and sizes

| Background | Use for                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------- |
| `default`  | Panes and side regions on the page, in the default background. The default.              |
| `muted`    | Blocks in the muted background of rows, such as a group of settings.                     |
| `page`     | A region in the page background, such as a well inside a pane that returns to the page.  |
| `raised`   | A block in the raised background that stands out on a pane, such as a summary inside it. |

<!-- specimen: TonesAndCorners -->

- **Corners** (`radius`, named after the radius tokens): `xl`, the default, gives panes and other large regions 1.75 rem corners; `sm` gives small blocks, such as a summary inside a pane, 0.5 rem corners; `full` gives a toolbar or a bar of filters fully rounded ends; and `none` leaves square corners for a region that meets the edges of its container, such as a full-width band.
- **Inset**: without `padding`, the inset follows the window: 1.25 rem in narrow windows, growing to 1.5 rem from 50 rem wide. `padding` takes a step of the spacing scale instead, from 1 (0.25 rem) to 9 (4 rem), and 0 removes it.
- **Backgrounds**: each is the background role of its name in [colors and themes](../foundations/colors.md): `--env-color-bg-default`, `--env-color-bg-muted`, `--env-color-bg-page` and `--env-color-bg-raised`. In the light theme `raised` is white, like the page; in the dark theme it matches `default`.
- **Width**: a surface is as wide as its container allows and never wider; set a width on it, or on its container, to make it narrower.
- **Scale**: a surface keeps the scale of its Theme: its corners and inset spacing are a little smaller in the compact scale. For smaller controls in a toolbar, give them `size="sm"`; for a compact region, wrap it in a Theme with `scale="compact"`. See [scale and density](../foundations/scale.md).

## States and behaviour

- A surface has no hover, pressed, focus or disabled state, and does nothing on its own. Interactive containers, such as a Card with `href`, add their own states.
- `render` renders another element for its meaning, such as `render={<section />}` or `render={<aside />}`, or draws the surface onto another component, such as a Column, without a wrapper.
- **Loading**: `skeleton` shows the surface and everything inside it as a skeleton, until its content arrives: text becomes bars, and icons, media and controls filled shapes of their size, while its background and corners stay. It is `aria-busy` and inert. Every component that paints a container takes the same prop; render them over `placeholders(count)` while the items load, as [Loading](../patterns/loading.md) shows. `useSkeleton()` tells a component of the application's own that it is inside one.

## Content guidelines

- Give a surface that stands for a region a visible heading, such as "Billing", and name the region with it.
- Keep one level of nesting where you can: a raised or muted block inside a pane, not a surface in a surface in a surface.

## Do and don't

### Do

- Lay out a surface's content with a Column or a Row through `render`, so the surface and its layout are one element.
- Use `full` corners and controls of size `sm` for a toolbar that floats over dense content.
- Use the background roles for what they mean: `default` for panes, `raised` for a block that stands out on a pane.

### Don't

- Don't add margins to a surface's children for space between them; lay them out with a [Column](../components/column.md).
- Don't build a card from a surface by hand; use [Card](../components/card.md), which has its layout, actions and interactive states.
- Don't tell regions apart by their background alone; the fills are close in contrast, so give each region a heading or a label.
- Don't give a surface `role="toolbar"` unless you add arrow-key navigation; a group of controls with an accessible name keeps them all in the tab order.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside, in order; the surface itself is not focusable and handles no keys. |

### envUI provides

- A plain element with no role of its own, so it adds nothing to what assistive technology reads; `render` renders a section, an article, a navigation, a main or an aside region, a header or a footer instead.

### You provide

- A role and a name where the surface is a region or a group, such as `render={<section />}` with `aria-labelledby` pointing at its heading, or `role="group"` with an `aria-label` on a group of controls.
- Headings or labels that set regions apart, rather than the background alone.

## Examples

### A raised block on a pane

`background="raised"` sets a block apart on a pane; `sm` corners suit its smaller size.

```tsx example=RaisedOnPane

```

### Toolbar

A pill surface holds controls over dense content, with controls of size `sm`. `render` lays them out as a row, and `role="group"` with a label names them together. For a toolbar the arrow keys move through, render the surface as a [Toolbar](../components/toolbar.md).

```tsx example=Toolbar

```

### Loading

A pane that is a skeleton until its project arrives; its Text, given no text, is a bar of the text style's length.

```tsx example=SurfaceLoading

```

## Changelog

- **1.0.0**: `skeleton`, with `placeholders()`, `isPlaceholder()` and `useSkeleton()`. `tone` is `background`, with the names of the background roles: `pane` is `default`, `row` `muted`, `canvas` `page` and `alternate` `raised`; `corners` is `radius`: `surface` is `xl`, `standard` `sm` and `pill` `full`; `render` replaces `as`. The backgrounds take the semantic background colors.
- **0.5.0**: `density="compact"`, which gives the controls inside the compact height.
- **0.4.0**: The inset is at least 1.25 rem.
- **0.1.0**: Surface, with backgrounds, padding and corners.
