---
title: Sheet
summary: A panel that slides in over the page from an edge of the window.
status: beta
since: 1.0.0
category: Overlays
aliases:
  - side sheet
  - bottom sheet
  - side panel
  - inspector
  - off-canvas
  - flyout
  - right panel
  - Dialog placement right
useWhen:
  - An item's details or settings, beside the list they belong to
  - Filters for a list or a table, applied on closing
  - A short set of choices from the bottom, such as the ways to share
avoidWhen:
  - text: A focused task or a decision in the middle of the window.
    use: Dialog
  - text: Details or a few fields beside the control that opens them.
    use: Popover
  - text: Details that sit beside the main content in a wide window.
    use: Panes
components:
  - Sheet
examples:
  FilterPanel:
    role: overview
    open: true
  ShareChoices: example
  SheetAnatomy: anatomy
  InspectorPanel: example
  ResizableDetails: example
---

# Sheet

## Variants

### Sides

<!-- specimen: Sides -->

### Choices from the bottom

```tsx figure=ShareChoices open

```

## Anatomy

```tsx figure=SheetAnatomy stage=shaded open

```

1. **Sheet** (`env-sheet`)
2. **Title** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Close button** (`env-dialog-heading > env-button`, `closeLabel`)
5. **Content** (`env-sheet env-checkbox`, `children`)
6. **Action** (`env-dialog-actions > env-button`, `actions`)

## Behaviour

### Inspector beside the page

```tsx figure=InspectorPanel stage=shaded motion

```

### Resizable

```tsx figure=ResizableDetails motion

```

## Accessibility

### Keyboard

| Key                                                  | Action                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd> on the resize handle      | Resizes a resizable side sheet a little; further with <kbd>Shift</kbd>. |
| <kbd>Home</kbd>, <kbd>End</kbd> on the resize handle | Resizes it to its smallest or largest width.                            |
