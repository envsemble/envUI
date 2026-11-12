---
title: Surface
summary: A container with a background, an inset and corners, but no layout of its own.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - panel
  - pane
  - container
  - box
  - background
  - paper
  - well
  - region
useWhen:
  - A region with a background, such as a detail pane or a side panel
  - A block that stands apart, such as a summary on a pane
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
examples:
  DetailPane: overview
---

# Surface

## Variants

### Backgrounds

| Background | Use for                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| Default    | Panes and side regions. The default.                                         |
| Muted      | A block that stands apart on a pane, and rows.                               |
| Page       | A well inside a pane that returns to the page.                               |
| Raised     | A layer on the page, such as a table or a docked panel.                      |
| Recessed   | A well on the page that its content rises out of, such as a preview's stage. |

<!-- specimen: Backgrounds -->

### Corners

| Corners      | Use for                                       |
| ------------ | --------------------------------------------- |
| Large        | Panes and large regions. The default.         |
| Small        | Small blocks.                                 |
| Rounded ends | A group of controls.                          |
| Square       | A band that meets the edges of its container. |

<!-- specimen: Corners -->

## Rules

A surface lays out nothing itself: a [Column](column.md) or a [Row](row.md) lays out what it holds, as one element with it.

### Spacing

Space what a surface holds with the layout inside it, never with margins of its own.

## Accessibility

### envUI provides

- A `div` with no role of its own, or the element in `render`, such as `render={<section />}`.

### You provide

- A heading for a surface that is a region, and its name, such as `aria-labelledby` on a section.
- `role="group"` and an `aria-label` on a group of controls; a [Toolbar](toolbar.md) for one the arrow keys move through.

## Compose

### Usage

A Surface gives its content a `background`, an inset and corners.

- Lay out what it holds through `render`, with a Column or a Row, so the surface and its layout are one element.
- `render` also gives it its meaning, such as `render={<section />}`, and `ref` reaches the rendered element.

```tsx source=DetailPane

```

#### Backgrounds, corners and inset

- `background` is `default`, the default, `muted`, `page`, `raised` or `recessed`. In every theme the page and the recessed well lie below `default`, and `muted` and `raised` a step above it, with one fill; the recessed well is a shade deeper than the page in dark, and between the page and the panes in light, where it takes the panes' fill at high contrast.
- `radius` is `xl`, 1.75 rem and the default, `sm`, 0.5 rem, `full`, fully rounded ends, or `none`, square.
- `padding` sets the inset as a step of the spacing scale, from `1`, 0.25 rem, to `9`, 4 rem, and `0` removes it; without it, the inset grows from 1.25 rem in narrow windows to 1.5 rem from 50 rem wide.

A group of controls, as wide as its controls in a Column with `align="start"`:

```tsx
<Surface
  padding={1}
  radius="full"
  role="group"
  aria-label="Diagram view"
  render={<Row wrap align="center" gap={4} />}
>
  <IconButton variant="ghost" size="sm" icon={<IconZoomOut />} aria-label="Zoom out" />
  <IconButton variant="ghost" size="sm" icon={<IconZoomIn />} aria-label="Zoom in" />
  <Button variant="secondary" size="sm">
    Fit to screen
  </Button>
</Surface>
```

#### Loading

`skeleton` shows the surface and everything inside it as a skeleton until its content arrives: text becomes bars of its text style's length, and controls filled shapes.

- Render the same components over stand-in items, `items ?? placeholders<Project>(3)`, whose fields are undefined; `isPlaceholder(item)` tells a stand-in by its id, and narrows the type, so the other branch reads the item's own fields.
- A component of the application's own reads `useSkeleton()` to give its skeleton a look of its own, such as a chart's.

```tsx
// A detail pane that is a skeleton until its project arrives: the text it will hold is bars.
<Surface skeleton={!project} style={{ inlineSize: '22rem' }}>
  <Column gap={3}>
    <Text render={<h3 />} variant="title">
      {project?.name}
    </Text>
    <Text>{project?.brief}</Text>
  </Column>
</Surface>
```

### Customize

- To recolor an area, its controls included, set the semantic tokens on a nested Theme, as [Customize and extend](../customizing.md#recolor-an-area) shows.
- CSS may target `env-surface`, with `data-background` and `data-radius` for the values other than the defaults.
