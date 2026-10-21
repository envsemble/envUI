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

Panes is invisible structure for two panes side by side, after Material's supporting pane and list-detail patterns. It never paints, except the supporting pane while it is a sheet. Its own width decides how the panes sit, in CSS: it is the `env-panes` container, and from `splitAt`, `expanded` (52.5 rem) by default, the panes sit side by side. In less room they behave as `behavior` says, and `open` says what shows.

- **supporting**: Panes.Main and Panes.Supporting, such as a document and its details. In less room the supporting pane is a sheet over the main one while `open`: a side sheet at the end in a medium width, a bottom sheet in a compact one. It is modal: a dialog over the rest of the panes, which are inert, with a close button; focus moves into it and stays, and Escape, the close button or a press on the scrim close it.
- **list-detail**: Panes.List and Panes.Detail, such as messages and the one chosen. In less room one shows at a time, the detail while `open`, with a back button to the list.

Here the supporting pane; narrow the window to see it become a sheet.

```tsx example=SupportingPane

```

Each pane scrolls on its own when Panes has a height, as in a Scaffold whose body scrolls (`scroll="body"`), where Panes fills it. An optional Panes.Divider between the panes resizes the supporting pane or the list.

## Anatomy

1. **Root** (`env-panes`, `behavior`, `splitAt`, `open`): a grid of the panes and the divider; `data-behavior`, `data-split-at` and `data-open` carry the props for CSS, and `--env-panes-size` the resized pane's width. `name` renders as `data-env-name`.
2. **Main** (`env-panes-main`) or **List** (`env-panes-list`): the pane at the start; `label` makes it a named region.
3. **Divider** (`env-panes-divider`, optional): a separator between the panes that resizes the supporting pane or the list, side by side only.
4. **Supporting** (`env-panes-supporting`) or **Detail** (`env-panes-detail`): the pane at the end, a named region, and the supporting pane a modal dialog while it is a sheet, with its close button (`env-panes-close`, `closeLabel`) at its top end. The detail starts with its back button (`env-panes-back`), which shows only one pane at a time.
5. **Scrim** (`env-panes-scrim`, supporting): behind the supporting sheet, which a press on it closes.

## Variants and sizes

| `splitAt`            | Side by side from | Use for                                                         |
| -------------------- | ----------------- | --------------------------------------------------------------- |
| `medium`             | 37.5 rem          | Panes whose main pane reads well narrow, such as a short list.  |
| `expanded` (default) | 52.5 rem          | Most panes: a document and its details, a list and its detail.  |
| `large`              | 75 rem            | A wide main pane, such as a table or a canvas, beside its pane. |

- The resized pane, the supporting pane or the list, is `defaultSize` wide, 22.5 rem, between `minSize`, 16 rem, and `maxSize`, 40 rem, and never leaves the other pane less than 16 rem. `size` and `onSizeChange` control it, and `persist` keeps the width people choose in a cookie of that name. Read it on the server with `readPanesSize(cookieHeader, key)` and pass it as `defaultSize`, so the server's markup has it and nothing moves as the page hydrates; without that, the kept width applies after the first render. A divider never starts a drag wider than the room allows: a size larger than fits starts from the width that shows.
- The supporting sheet is as wide as the supporting pane in a medium width, at most the width less 3.5 rem, and as wide as the panes in a compact one, at most 85% of their height.

## States and behaviour

- **Nothing measured**: which arrangement shows is CSS alone, from the Panes' own width, so the server's markup is right before any script runs, and Panes in a narrow column of a wide window behave as narrow.
- **open**: the application keeps it, since it knows when an item is chosen or a button pressed. Side by side both panes show, whatever it is. `onOpenChange(false)` comes from Escape, the close button and the scrim, for the supporting sheet, and from the back button, for the detail.
- **Focus**: as the supporting sheet opens, focus moves into it, Tab stays in it while the rest of the panes is inert, and as it closes focus returns to where it was. A sheet that becomes a pane beside the main one, as the panes widen, leaves focus where it is. As the detail opens one pane at a time, focus moves to its back button, and back on the list's current row, the element with `aria-current`, as it closes; focus elsewhere on the page stays.
- **Divider**: the pointer drags it, measuring nothing until it does; the arrow keys move it 1 rem, 5 with Shift, Home and End to the ends, and a double click returns it to `defaultSize`. It shows only while the panes sit side by side.
- **Direction**: everything is logical, so the panes mirror in right-to-left text.

## Do and don't

### Do

- Name each pane with `label` where it is a region people jump to, such as Inbox and the chosen message.
- Give the detail's back button a `backLabel` that names where it goes, such as Inbox.
- Open the supporting pane from a button in the main pane, so people find it where there is no room.

### Don't

- Don't use Panes for content that should stack, such as cards; use [Grid](grid.md).
- Don't put an application's navigation in a supporting pane; the Scaffold shows it.
- Don't nest Panes in a pane; show the next level in the detail.

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

- Named regions for the panes with a `label`; the supporting pane and the list always have one.
- The divider as a focusable `separator` with its value in rem, named by `label`, and `aria-controls` naming the pane it resizes.
- Hidden panes, the back button out of its time and the scrim out of the accessibility tree, by CSS.
- Focus moved and returned as the sheet and the detail open and close.

### You provide

- The `label`s and the `backLabel`, in the application's language.
- `aria-current` on the list's current row, where focus returns.
- The button that opens the supporting pane in less room.

## Examples

### List and detail

The inbox: side by side from an expanded width, the message alone with a back button in less room.

```tsx example=ListAndDetail

```

### Resizable details

`splitAt="medium"` and a divider; the width people choose is kept with `persist`.

```tsx example=ResizableDetails

```

## Changelog

- **1.0.0**: Panes, which replaces SplitPane and ListDetail: the supporting and list-detail behaviors, `splitAt` at a window class, and a divider in rem.
