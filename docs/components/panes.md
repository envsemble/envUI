---
title: Panes
summary: Two panes side by side, after Material's pane patterns, that behave as a main pane with a supporting sheet or as a list and its detail when there is less room.
status: beta
since: 1.0.0
category: Layout & surfaces
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
  - A main pane with a supporting pane beside it, such as a document and its details, which becomes a sheet where there is no room.
  - A list beside the chosen item's detail, which shows one at a time where there is no room.
avoidWhen:
  - text: An application's screen with its top bar and navigation.
    use: Scaffold
  - text: Columns of cards or fields that wrap, inside a page.
    use: Grid
  - text: A panel that opens over the page from an edge on demand.
    use: Sheet
related:
  - scaffold
  - page
  - sheet
  - grid
components:
  - Panes
  - readPanesSize
---

# Panes

## Overview

Panes is the invisible structure of two panes side by side, after Material's supporting pane and list-detail layouts. Its own width decides how they sit: side by side from `splitAt`, and in less room as `behavior` says.

`behavior="supporting"`: a main pane and a supporting one, such as a document and its details. In less room the supporting pane is a modal sheet while `open`.

```tsx example=SupportingPane

```

`behavior="list-detail"`: a list and the item chosen from it. In less room one pane shows at a time, the detail while `open`, with a back button to the list.

```tsx example=ListAndDetail

```

Each pane scrolls on its own when Panes has a height, as in a [Scaffold](scaffold.md) whose body scrolls; where the document scrolls, the page scrolls the panes with it.

## Variants

| `splitAt`            | Side by side from | Use for                                             |
| -------------------- | ----------------- | --------------------------------------------------- |
| `medium`             | 37.5 rem          | A main pane that reads well narrow, such as a list. |
| `expanded` (default) | 52.5 rem          | Most panes.                                         |
| `large`              | 75 rem            | A wide main pane, such as a table or a canvas.      |

### Resizable

Panes.Divider resizes the supporting pane or the list, by pointer and the arrow keys. It is the gap between the panes, with a small grip in it, never a line. Panes keeps the same gap without a divider, so give each pane a [Surface](surface.md) and they stand apart across it. `persist` keeps the width people choose in a cookie; read it on the server with `readPanesSize` and pass it as `persistedSize`, so nothing moves as the page hydrates.

```tsx example=ResizableDetails

```

## When to use

```tsx do=DetailsButton caption="A button in the main pane that opens the details where there is no room."

```

```tsx dont=NoWayToDetails caption="No button: in less room, the details can't be reached."

```

```tsx do=BackToInbox caption="A backLabel that names where the back button goes."

```

```tsx dont=GenericBack caption="Back alone: people can't tell where it leads."

```

- The application's navigation goes in the [Scaffold](scaffold.md), not in a supporting pane.
- Show the next level in the detail rather than nesting Panes in a pane.

## Anatomy

```tsx anatomy=PanesAnatomy

```

1. **Root** (`env-panes`)
2. **List** (`env-panes-list`)
3. **Divider** (`env-panes-divider`)
4. **Detail** (`env-panes-detail`)

The supporting behavior has `env-panes-main` and `env-panes-supporting`, with its close button, `env-panes-close`, and its scrim, `env-panes-scrim`, while it is a sheet; the detail's back button is `env-panes-back`.

## Adapting to width

Only CSS decides how the panes sit, from their own width. A supporting pane becomes a side sheet in a medium width and a bottom sheet in a compact one; press Details to open it.

```tsx example=SupportingByWidth widths="24 44 60"

```

A list and its detail show one at a time in less room: choose a message, and Inbox returns to the list.

```tsx example=ListDetailByWidth widths="24 60"

```

## Accessibility

### Keyboard

| Key                                                     | Action                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| <kbd>Esc</kbd> in the supporting sheet                  | Closes it, and focus returns to where it was.                      |
| <kbd>←</kbd>, <kbd>→</kbd> on the divider               | Moves the divider 1 rem; with <kbd>Shift</kbd>, 5 rem.             |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> on the divider | Moves the divider 5 rem.                                           |
| <kbd>Home</kbd>, <kbd>End</kbd> on the divider          | Moves the resized pane to its smallest or largest width.           |
| <kbd>Enter</kbd> on the back button                     | Returns from the detail to the list, and focus to its current row. |

### envUI provides

- Named regions for the panes with a `label`.
- The supporting sheet as a modal dialog: focus moves in and stays, the rest of the page is inert, and focus returns as it closes.
- Focus on the back button as the detail opens alone, and on the list's current row as it closes.
- The divider as a focusable `separator` with its value in rem.

### You provide

- The `label`s and the `backLabel`, in the application's language.
- `open`, and `aria-current` on the list's current row.
- The button that opens the supporting pane in less room.

## Changelog

- **1.0.0**: Panes, which replaces SplitPane and ListDetail: the supporting and list-detail behaviors, `splitAt` at a window class, and a divider in rem.
