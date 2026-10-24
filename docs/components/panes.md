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
  - readPanesSize
---

# Panes

## Overview

Panes never paints. Each pane scrolls on its own where the panes have a height, as in a [Scaffold](scaffold.md) whose body scrolls; where the page scrolls, the panes scroll with it.

### A main pane and a supporting one

In less room, the supporting pane is a sheet over the main one, which a button in the main pane opens. The button hides while the panes sit side by side.

```tsx example=SupportingPane

```

### A list and its detail

In less room, one pane shows at a time: the detail once an item is chosen, with a back button to the list.

```tsx example=ListAndDetail

```

## Variants

### Side by side

The panes sit side by side from a width of their own.

| Side by side from | Width    | Use for                                             |
| ----------------- | -------- | --------------------------------------------------- |
| Medium            | 37.5 rem | A main pane that reads well narrow, such as a list. |
| Expanded          | 52.5 rem | Most panes. The default.                            |
| Large             | 75 rem   | A wide main pane, such as a table or a canvas.      |

### Resizable

People can resize the supporting pane or the list by the gap between the panes, with its small grip, by pointer or with the arrow keys. The application can keep the width they choose.

```tsx example=ResizableDetails widths="44"

```

## When to use

```tsx do=DetailsButton caption="A button in the main pane that opens the details where there is no room."

```

```tsx dont=NoWayToDetails caption="No button: in less room, the details can't be reached."

```

```tsx do=BackToInbox caption="A back button that names where it goes."

```

```tsx dont=GenericBack caption="Back alone: people can't tell where it leads."

```

### Between two surfaces

A resizable gap goes between two surfaces, one in each pane. Beside content that floats on the page, such as a list beside bare text, its grip hangs in empty space with nothing to say what it resizes, so leave it out where the panes have no surfaces.

### Navigation and nesting

The application's navigation goes in the [Scaffold](scaffold.md), not in a supporting pane, and the next level shows in the detail rather than in panes inside a pane.

## Anatomy

```tsx anatomy=PanesAnatomy

```

1. **Root** (`env-panes`)
2. **List** (`env-panes-list`)
3. **Divider** (`env-panes-divider`)
4. **Detail** (`env-panes-detail`)

Not shown: the main and supporting panes, the supporting sheet's close button and scrim, the button that opens it, and the detail's back button.

## Adapting to width

The panes decide how they sit from their own width alone, before anything runs. A supporting pane becomes a side sheet in a medium width and a bottom sheet in a compact one; press Details to open it.

```tsx example=SupportingByWidth widths="24 44 60"

```

### A list and its detail by width

In less room the list and its detail show one at a time: choose a message, and Inbox returns to the list.

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
- Panes.Trigger, which opens the supporting sheet, says whether it is open with `aria-expanded`, and hides while the panes sit side by side.

### You provide

- The `label`s and the `backLabel`, in the application's language.
- `open`, and `aria-current` on the list's current row.
- A Panes.Trigger, or a button of your own, that opens the supporting pane in less room.

## In code

### Usage

Panes.Root takes a `behavior`: `supporting` holds Panes.Main and Panes.Supporting, such as a document and its details, and `list-detail` holds Panes.List and Panes.Detail, such as messages and the one chosen, each pair with an optional Panes.Divider between them. Below `splitAt`, the supporting pane is a modal sheet over the main one while `open`, and a list-detail shows the detail instead of the list while `open`. The application keeps `open`, setting it as an item is chosen or the sheet's button is pressed, and `onOpenChange` receives `false` as people close it: <kbd>Esc</kbd>, the close button or a press on the scrim close the sheet, and the back button returns to the list.

```tsx source=SupportingPane

```

#### Names and buttons

Panes.Supporting and Panes.List take a `label`, which names their region; on Panes.Main and Panes.Detail it is optional, and makes the pane a region landmark, for the panes of a page's main layout. Panes.Trigger is a Button, `primary` by default, that opens the supporting sheet and hides while the panes sit side by side. `closeLabel` names the sheet's close button, Close by default, and `backLabel` the back button, Back by default, from EnvUIProvider's `messages.panes`; name where it goes, such as Inbox. Set `aria-current` on the list's current row.

```tsx source=ListAndDetail

```

#### Side by side

`splitAt` is the window class of the Panes' own width from which they sit side by side: `medium`, 37.5 rem, `expanded`, 52.5 rem and the default, or `large`, 75 rem. CSS decides it, so the server's markup is already right.

#### Resizable

Panes.Divider, named by its `label`, Resize panes by default, resizes the supporting pane or the list, by pointer and the arrow keys; a double click returns it to `defaultSize`, 22.5 rem by default. It stays between `minSize` and `maxSize`, 16 and 40 rem by default, and never leaves the other pane less than 16 rem. `size` and `onSizeChange`, which receives each width in rem and `committed` once a drag ends or a key moves it, let the application control it. The divider is the gap between two surfaces: give each pane a Surface as tall as the pane, with `min-block-size: 100%`, and where the detail shows alone, its surface fills the room below the back button. Panes keeps the same gap without a divider.

`persist` keeps the width people choose in a cookie of that name. Read it on the server with `readPanesSize(cookieHeader, key)` and pass it as `persistedSize`, so nothing moves as the page hydrates.

```tsx source=ResizableDetails

```

### Composition

The parts are the root, `env-panes`, with `data-behavior`, `data-split-at` and `data-open`; the main pane, `env-panes-main`, and the supporting one, `env-panes-supporting`, with its close button, `env-panes-close`, and its scrim, `env-panes-scrim`, while it is a sheet, and the trigger that opens it, `env-panes-trigger`; the list, `env-panes-list`, and the detail, `env-panes-detail`, with its back button, `env-panes-back`; and the divider, `env-panes-divider`. `name` names the node for dev mode, as `data-env-name`.

## Changelog

- **1.0.0**: Panes, which replaces SplitPane and ListDetail: the supporting and list-detail behaviors, `splitAt` at a window class, a divider in rem, and Panes.Trigger, which opens the supporting sheet.
