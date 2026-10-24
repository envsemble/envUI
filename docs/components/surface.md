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
  - A block should stand apart from what is around it, such as a summary on a pane.
  - A toolbar floats over dense content, such as a diagram, with small controls inside.
avoidWhen:
  - text: Content with a heading, metadata and actions, or a block people press to open something.
    use: Card
  - text: Rows of items that people scan, each with a label, a description and actions.
    use: List
  - text: Space between children without a background.
    use: Column
components:
  - Surface
  - placeholders
  - isPlaceholder
  - useSkeleton
---

# Surface

## Overview

A surface gives a region a background, an inset and rounded corners, and nothing else. Lay out what it holds with a [Column](column.md) or a [Row](row.md) through `render`, so the surface and its layout are one element.

```tsx example=DetailPane

```

```tsx example=Toolbar caption="Fully rounded ends for a group of controls over dense content."

```

### Loading

A pane that is a skeleton until its project arrives; its Text, given no text, is a bar of the text style's length.

```tsx example=SurfaceLoading

```

## Variants

### Backgrounds

| Background | Use for                                        |
| ---------- | ---------------------------------------------- |
| `default`  | Panes and side regions. The default.           |
| `muted`    | A block that stands apart on a pane, and rows. |
| `page`     | A well inside a pane that returns to the page. |
| `raised`   | Popups and overlays; it matches `default`.     |

<!-- specimen: Backgrounds -->

### Corners

`xl` for panes and large regions, `sm` for small blocks, `full` for a group of controls and `none` for a band that meets the edges of its container.

<!-- specimen: Corners -->

Without `padding`, the inset grows from 1.25 rem in narrow windows to 1.5 rem from 50 rem wide.

### Colors

`--env-surface-container`, `--env-surface-content` and `--env-surface-outline` set the colors of one surface, through `style` or CSS; a surface inside keeps its own. To recolor everything in an area, its controls included, override the semantic tokens on a nested Theme, with hover and pressed values of their own. [Customize colors](../customizing-colors.md) describes both.

```tsx example=RecolorArea caption="A nested Theme gives an area the brand's green; its button and switch keep every state."

```

## When to use

```tsx do=BlockOnPane caption="One block on a pane, set apart by its fill and corners."

```

```tsx dont=NestedSurfaces caption="A surface in a surface in a surface: the fills stack up."

```

- No margins on a surface's children; lay them out with a Column.
- A block with a title, metadata and actions is a [Card](card.md).

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`, such as `render={<section />}`.

### You provide

- A heading for a surface that is a region, and its name, such as `aria-labelledby` on a section.
- `role="group"` and an `aria-label` on a group of controls; a [Toolbar](toolbar.md) for one the arrow keys move through.

## Changelog

- **1.0.0**: `skeleton`, with `placeholders()`, `isPlaceholder()` and `useSkeleton()`. `tone` is `background`, with the names of the background roles: `pane` is `default`, `row` `muted`, `canvas` `page` and `alternate` `raised`; `corners` is `radius`: `surface` is `xl`, `standard` `sm` and `pill` `full`; `render` replaces `as`. The backgrounds take the semantic background colors.
- **0.5.0**: `density="compact"`, which gives the controls inside the compact height.
- **0.4.0**: The inset is at least 1.25 rem.
- **0.1.0**: Surface, with backgrounds, padding and corners.
