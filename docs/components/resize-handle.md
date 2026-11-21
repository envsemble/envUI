---
title: ResizeHandle
summary: A handle people drag, or move with the keys, to resize what is beside it.
status: beta
since: 2.0.0
category: App frame & layout
aliases:
  - splitter
  - window splitter
  - resizer
  - drag handle
  - separator
useWhen:
  - A docked panel whose height people choose, such as a run's logs
  - An edge that none of envUI's resizable components already gives
avoidWhen:
  - text: Two panes of one region, side by side, one of them resized.
    use: Panes
  - text: An application's navigation, whose width people choose.
    use: NavigationDrawer
  - text: A panel over the page whose width people choose.
    use: Sheet
components:
  - ResizeHandle
examples:
  DockedLogs:
    role: overview
    caption: The top edge of a run's logs, which people drag up to read more of them; its grip shows where to take it.
  ResizeHandleAnatomy: anatomy
  WithoutAGrip: example
---

# ResizeHandle

## Variants

### Without a grip

```tsx figure=WithoutAGrip

```

## Anatomy

```tsx figure=ResizeHandleAnatomy

```

1. **Handle** (`env-resize-handle`)

## Accessibility

### Keyboard

| Key                                                    | Action                                                  |
| ------------------------------------------------------ | ------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd> on the handle               | Moves the handle a step; further with <kbd>Shift</kbd>. |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a handle across the page | Moves the handle a step; further with <kbd>Shift</kbd>. |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> on the handle | Moves the handle further.                               |
| <kbd>Home</kbd>, <kbd>End</kbd> on the handle          | Resizes to the smallest or largest size.                |
