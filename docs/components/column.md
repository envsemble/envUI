---
title: Column
summary: Stacks content vertically with even gaps.
status: beta
since: 1.0.0
category: App frame & layout
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
  - Content from top to bottom with even space, such as a heading, text and a form
  - Sections and their contents spaced apart differently, as nested columns
  - Actions stacked across the whole width of a narrow pane
avoidWhen:
  - text: Children side by side, such as a form's actions.
    use: Row
  - text: Content in columns, such as cards or a main column beside its details.
    use: Grid
  - text: A background, an inset and corners around content.
    use: Surface
components:
  - Column
examples:
  ProjectDetails: overview
  CenteredContent: example
---

# Column

## Variants

### Gaps

<!-- specimen: GapScale -->

### Alignment

```tsx figure=CenteredContent

```
