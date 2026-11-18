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
  - A sidebar or a panel whose width people choose
  - An edge between two regions that aren't Panes
avoidWhen:
  - text: Two panes of one region, side by side, one of them resized.
    use: Panes
  - text: A panel over the page whose width people choose.
    use: Sheet
components:
  - ResizeHandle
examples:
  ProjectSidebar:
    role: overview
    caption: The sidebar's edge, invisible until the pointer is over it, with its grip.
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
