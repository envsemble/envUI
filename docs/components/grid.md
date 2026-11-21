---
title: Grid
summary: Lays out content in columns with even gaps.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - columns
  - grid layout
  - CSS grid
  - card grid
  - tiles
  - two columns
  - auto-fill
  - responsive grid
useWhen:
  - Items of one kind in as many columns as fit, such as cards or stats
  - A main column beside a narrower one, such as a summary and its details
  - Content lined up in a set number of equal columns
avoidWhen:
  - text: Content top to bottom, one item per line.
    use: Column
  - text: A few items side by side at their own widths, such as actions.
    use: Row
  - text: Two panes people resize, such as a document beside its details.
    use: Panes
components:
  - Grid
examples:
  ProjectCards: overview
  MainAndDetails: example
  ColumnsThatFit: example
---

# Grid

## Variants

```tsx figure=MainAndDetails

```

## Behaviour

### Adapting to width

```tsx figure=ColumnsThatFit widths="22 50" sweep

```
