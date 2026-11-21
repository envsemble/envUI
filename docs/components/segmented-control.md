---
title: SegmentedControl
summary: One choice among a few views or filters of the same content.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - segmented button
  - segmented buttons
  - button toggle
  - toggle group
  - toggle button group
  - content switcher
  - view switcher
  - filter switcher
  - pill tabs
useWhen:
  - Two to five views or filters of the same content, such as Open and Done
  - How a toolbar lays out content, such as List and Board
  - A choice between two scopes in a narrow container, such as a sidebar
avoidWhen:
  - text: A setting rather than a view, such as a theme, or more than five options.
    use: Select
  - text: Options that each need a sentence to explain them.
    use: RadioGroup
components:
  - SegmentedControl
examples:
  WorkItems: overview
  SmallToolbar: example
  IconOnlyAndBadge: example
  SegmentedControlAnatomy: anatomy
  FullWidthScope: example
---

# SegmentedControl

## Variants

### Sizes

<!-- specimen: Sizes -->

```tsx figure=SmallToolbar

```

### Icon-only segments and badges

```tsx figure=IconOnlyAndBadge

```

## Anatomy

```tsx figure=SegmentedControlAnatomy

```

1. **Track** (`env-segmented-control`)
2. **Thumb** (`env-segmented-control-item[data-checked]`)
3. **Segment** (`env-segmented-control-item[data-unchecked]`)
4. **Start** (`env-segmented-control-item[data-unchecked] > env-segmented-control-item-start`, `start`)
5. **Label** (`env-segmented-control-item-label`, `label`)
6. **Count** (`env-segmented-control-item-count`, `count`)

## Behaviour

### States

<!-- specimen: States -->

### Adapting to width

```tsx figure=FullWidthScope widths="26 14" motion

```
