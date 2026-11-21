---
title: Surface
summary: A container with a background, padding and rounded corners, but no layout.
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
  - text: Content with a heading and actions, or a block people press to open.
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

<!-- specimen: Backgrounds -->

### Corners

<!-- specimen: Corners -->
