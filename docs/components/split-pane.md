---
title: SplitPane
summary: Two panes with a handle between them that people drag or move with the arrow keys, and ListDetail, a list beside the detail of its chosen item.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - SplitView
  - split view
  - splitter
  - window splitter
  - resizable panes
  - resizable panels
  - divider
  - master-detail
  - master detail
  - list-detail
  - list and detail
useWhen:
  - Two related panes share a region and people size them to their task, such as a source beside its preview.
  - A list sits beside the detail of the chosen item, and shows one at a time on a narrow screen.
avoidWhen:
  - text: The application's sidebar, which collapses and opens as a drawer on a phone.
    use: AppShell
  - text: A panel docked at an edge of the window over the page.
    use: PanelDock
  - text: Content that simply follows, without a handle.
    use: Stack
  - text: Columns of a table that people resize.
    use: Table
related:
  - page
  - list
  - panel-dock
  - app-shell
  - responsive
components:
  - SplitPane
  - ListDetail
---

# SplitPane

## Overview

SplitPane lays out two panes, side by side or one above the other, with a handle between them that resizes them: people drag it, or focus it and press the arrow keys, as the APG window splitter pattern describes. The size can persist, and below `stackBelow` of its own width the panes stack and the handle goes. ListDetail builds a list beside the detail of its chosen item on it, which shows one at a time when stacked.

```tsx example=ResizablePanes

```

## Anatomy

1. **Root** (`SplitPane.Root`): the grid of the panes, with `orientation`, the first pane's `size` and its bounds, `unit`, `persist` and `stackBelow`.
2. **Pane** (`SplitPane.Pane`): one of the two panes; it scrolls on its own, and `label` makes it a named region.
3. **ResizeHandle** (`SplitPane.ResizeHandle`): the separator between them, named by `label`, with a resting hairline and a line in the focus color while it is focused or dragged.

ListDetail's parts:

1. **Root** (`ListDetail.Root`): a SplitPane with `detailShown`, `onBack`, `backLabel` and the list's size and bounds.
2. **List** (`ListDetail.List`): the list's pane, a region named by `label`.
3. **Detail** (`ListDetail.Detail`): the handle and the detail's pane, with a back button at its start when stacked.

## Variants and sizes

- **Orientation**: `horizontal`, the default, puts the first pane at the inline start, on the right in right-to-left text; `vertical` puts it above the second. A vertical split pane, and one whose panes should scroll, needs a height of its own.
- **Unit**: `%`, the default, sizes the first pane as a share of the split pane, between `minSize` and `maxSize`, 20 and 80; `rem` sizes it as a length that follows the reader's text size and keeps its width as the window grows, such as an outline beside a document.
- **The handle**: 0.5 rem across, with its hit area at the touch size under a coarse pointer. The second pane takes the rest.
- **ListDetail** starts the list at 32 percent, between 22 and 50, and stacks below 44 rem.

## States and behaviour

- **Keyboard**: the arrow keys along the handle's axis move it by 2 percent, or 1 rem, and with <kbd>Shift</kbd> by 10 percent, or 5 rem; <kbd>Home</kbd> and <kbd>End</kbd> reach the bounds. In right-to-left text <kbd>←</kbd> grows the first pane, which sits on the right.
- **Pointer**: dragging the handle follows the pointer; a cancelled drag returns to where it began. A double click returns it to `defaultSize` and forgets the stored size.
- **Persistence**: `persist` keeps the size people choose in localStorage under its key, read after the first render, so server markup and hydration agree. `onSizeChange` receives each size, with `committed` true once a drag ends or a key moves it, for an application that stores it elsewhere or controls `size`.
- **Stacking**: `stackBelow` follows the split pane's own width, not the window's, so one in a narrow column stacks too. Stacked panes follow each other in order, with a hairline between them, and the handle goes. `onStackedChange` tells the application, and the root has `data-stacked`. The root is a size container, so a container query stacks the server's markup before any script runs; give the root a width of its own where its content would otherwise size it, such as in a flex row.
- **ListDetail, stacked**: the list shows until `detailShown`, then the detail alone, with a back button named by `backLabel` at its start. Showing the detail from the list moves focus to the back button; Back calls `onBack`, and once the list shows again focus returns to its current row, the element with `aria-current`. Focus elsewhere on the page stays where it is. When the layout widens with focus on the back button, focus moves to the detail. Side by side, both show and focus stays where it is.

## Content guidelines

- Name the handle after what it resizes, such as "Resize document list", where a page has more than one; the default is "Resize panes". ListDetail takes the name as `resizeLabel`. With `unit="rem"`, the handle's value is the first pane's share, and its text gives the size in rem too.
- Name ListDetail's back button after where it goes, such as "All projects".
- Name the panes of a page's main layout after their content, such as "Projects", so people can jump between them.

## Do and don't

### Do

- Give the split pane a height, such as the space below a toolbar, so each pane scrolls on its own.
- Set bounds that keep both panes useful, and a `stackBelow` where two panes no longer fit.
- Mark the chosen row of a ListDetail's list with `aria-current`, such as a List.Item's link.

### Don't

- Don't nest split panes more than one level; a page of many resizable regions is hard to use.
- Don't use a split pane for the application's sidebar; a Sidebar collapses and becomes a drawer.
- Don't hide the only way to a pane behind the handle: a stacked layout keeps both reachable.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the handle between the panes' content, in document order.                                                              |
| <kbd>→</kbd>, <kbd>←</kbd>                      | On a horizontal handle, moves it toward the inline end or start: 2 percent, or 1 rem; with <kbd>Shift</kbd>, five times as far. |
| <kbd>↓</kbd>, <kbd>↑</kbd>                      | On a vertical split pane's handle, moves it down or up.                                                                         |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>        | Grows or shrinks the first pane by the larger step.                                                                             |
| <kbd>Home</kbd>, <kbd>End</kbd>                 | Moves the handle to the first pane's smallest or largest size.                                                                  |
| <kbd>Enter</kbd>                                | On ListDetail's back button, returns to the list, with focus on its current row.                                                |

### envUI provides

- The handle as a focusable `separator` with `aria-orientation`, `aria-valuenow`, `aria-valuemin` and `aria-valuemax` as the first pane's share of the split pane in percent, `aria-controls` naming the first pane, and a name from `label` or `messages.splitPane.resize`.
- Panes with a `label` as region landmarks with that name; ListDetail's list is always one.
- Arrow keys and dragging that follow the text direction.
- In a stacked ListDetail, the hidden pane out of the accessibility tree, and focus moved to the back button and back to the list's current row.

### You provide

- A `label` for each handle where a page has more than one split pane.
- A `label` for panes that are main regions of the page, and for ListDetail's list.
- `aria-current` on the list's chosen row, and `detailShown` and `onBack` that follow people's choice.

## Examples

### A persisted width

A rem-sized outline that keeps its width under a localStorage key.

```tsx example=Persisted

```

### A list and its detail

ListDetail shows people beside the chosen person's details; in a narrow space, one at a time.

```tsx example=MasterDetail

```

## Changelog

- **1.0.0**: SplitPane, with `orientation`, `unit`, `persist` and `stackBelow`, and ListDetail on it. They replace 0.6's SplitView, which 0.7 removed: the `v1-names` and `v1-structure` codemods turn a SplitView's `start` and `end` into the two panes with a handle between, and its `storageKey` into `persist`.
