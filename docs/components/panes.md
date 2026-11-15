---
title: Panes
summary: Two panes side by side, such as a list and its detail.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - SplitPane
  - ListDetail
  - split view
  - split pane
  - master detail
  - list detail
  - supporting pane
  - side pane
  - inspector
  - resizable panes
useWhen:
  - A main pane with a supporting one, such as a document and its details
  - A list beside the chosen item's detail, such as messages
avoidWhen:
  - text: An application's screen with its top bar and navigation.
    use: Scaffold
  - text: A panel that opens over the page from an edge on demand.
    use: Sheet
  - text: One column of content at a readable width.
    use: Page
components:
  - Panes
  - readPanesWidth
examples:
  SupportingPane:
    role: overview
    caption: A main pane and a supporting one.
    motion: true
    device: phone
  ListAndDetail:
    role: overview
    caption: A list and its detail.
    motion: true
    device: phone
  ResizableDetails: example
  PanesAnatomy: anatomy
  SupportingByWidth: example
  ListDetailByWidth: example
---

# Panes

## Variants

### Resizable

```tsx figure=ResizableDetails motion device=window

```

## Anatomy

```tsx figure=PanesAnatomy width="38"

```

1. **Root** (`env-panes`)
2. **List** (`env-panes-list`)
3. **Divider** (`env-panes-divider`)
4. **Detail** (`env-panes-detail`)

## Behaviour

### Adapting to width

```tsx figure=SupportingByWidth motion

```

```tsx figure=ListDetailByWidth widths="24 54" sweep classes fit

```

## Accessibility

### Keyboard

| Key                                                     | Action                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd> on the divider               | Moves the divider a little; further with <kbd>Shift</kbd>. |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> on the divider | Moves the divider further.                                 |
| <kbd>Home</kbd>, <kbd>End</kbd> on the divider          | Moves the resized pane to its smallest or largest width.   |
