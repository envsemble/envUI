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
  - text: Each option has a panel of its own, such as the sections of a settings page.
    use: Tabs
  - text: A choice in a form that is saved with it, or options that need explaining.
    use: RadioGroup
  - text: More than five options, or options with long names.
    use: Select
components:
  - SegmentedControl
examples:
  WorkItems: overview
  SmallToolbar: example
  SegmentedControlAnatomy: anatomy
  FullWidthScope: example
---

# SegmentedControl

## Variants

### Sizes

<!-- specimen: Sizes -->

```tsx figure=SmallToolbar

```

## Anatomy

```tsx figure=SegmentedControlAnatomy

```

1. **Track** (`env-segmented-control`)
2. **Thumb** (`env-segmented-control-item[data-checked]`)
3. **Segment** (`env-segmented-control-item[data-unchecked]`)
4. **Icon** (`env-segmented-control-item[data-unchecked] > env-icon`, `icon`)
5. **Label** (`env-segmented-control-item-label`, `label`)
6. **Count** (`env-segmented-control-item-count`, `count`)

## Behaviour

### States

<!-- specimen: States -->

### Adapting to width

```tsx figure=FullWidthScope widths="26 14" motion

```
