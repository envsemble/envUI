---
title: Tooltip
summary: A short label beside a control on hover and keyboard focus.
status: stable
since: 1.0.0
category: Overlays
aliases:
  - hint
  - tip
  - info tip
  - title
  - title attribute
  - hover text
  - hover label
useWhen:
  - An icon-only control's name, such as Refresh
  - Why a control is disabled, beside the page's own account of it
  - A control's keyboard shortcut, such as Bold (<kbd>Ctrl</kbd>+<kbd>B</kbd>)
avoidWhen:
  - text: A preview of a person, a page or an item, on hover or focus.
    use: HoverCard
  - text: Content people interact with, such as a small form or a list of choices.
    use: Popover
  - text: Information people need that should stay visible, such as a warning.
    use: Alert
components:
  - Tooltip
examples:
  IconActions:
    role: overview
    open: true
  RailOfIcons: example
  TooltipAnatomy: anatomy
  MenuTrigger: example
  ShortcutHints: example
  TextAbbreviation: example
---

# Tooltip

## Variants

### Sides

```tsx figure=RailOfIcons open

```

## Anatomy

```tsx figure=TooltipAnatomy open

```

1. **Tooltip** (`env-tooltip`, `content`)
2. **Control** (`env-icon-button`, `children`)

## Behaviour

### Menu trigger

```tsx figure=MenuTrigger motion

```

### Keyboard shortcuts

```tsx figure=ShortcutHints open

```

### Text

```tsx figure=TextAbbreviation motion

```
