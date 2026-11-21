---
title: Row
summary: Places content side by side with even gaps, wrapping when it doesn't fit.
status: beta
since: 1.0.0
category: App frame & layout
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
  - wrap
useWhen:
  - A few actions that belong together, such as Cancel and Save
  - A heading and its actions on one line
  - Small items side by side, such as a label and a badge
avoidWhen:
  - text: Content top to bottom.
    use: Column
  - text: Content in columns of equal or set widths, such as cards.
    use: Grid
  - text: Controls for one subject that the arrow keys move between.
    use: Toolbar
components:
  - Row
examples:
  FormActions: overview
  SectionHeading: example
---

# Row

## Variants

### Justify

<!-- specimen: Justify -->

## Behaviour

### Adapting to width

```tsx figure=SectionHeading widths="30 12" sweep

```
