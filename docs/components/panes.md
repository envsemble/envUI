---
title: Panes
summary: A region split into two panes side by side, such as a document and its details.
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
  - side pane
  - resizable panes
useWhen:
  - A document beside its details, which people resize
  - Two views of one thing side by side, such as source and its preview
avoidWhen:
  - text: An application's screen with its top bar and navigation.
    use: Scaffold
  - text: A panel that opens over the page from an edge on demand, such as on a phone.
    use: Sheet
  - text: An edge people drag to resize something that isn't a pane.
    use: ResizeHandle
components:
  - Panes
examples:
  DocumentAndDetails:
    role: overview
    caption: A document and its details, with the resize handle on the seam; the details pane keeps its width as the region resizes.
  ResizableDetails: example
  PanesAnatomy: anatomy
  StackedWhenNarrow: example
---

# Panes

## Anatomy

```tsx figure=PanesAnatomy width="38"

```

1. **Root** (`env-panes`)
2. **Pane** (`env-panes-pane:first-child`)
3. **Resize handle** (`env-panes-resize-handle`)
4. **Pane** (`env-panes-pane:last-child`)

## Behaviour

### Adapting to width

```tsx figure=StackedWhenNarrow widths="54 24" sweep

```

### Keeping the width people chose

```tsx figure=ResizableDetails motion

```

## Accessibility

### Keyboard

| Key                                                    | Action                                                    |
| ------------------------------------------------------ | --------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd> on the handle               | Moves the handle a little; further with <kbd>Shift</kbd>. |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> on the handle | Moves the handle further.                                 |
| <kbd>Home</kbd>, <kbd>End</kbd> on the handle          | Moves the sized pane to its smallest or largest width.    |
