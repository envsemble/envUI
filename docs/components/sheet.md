---
title: Sheet
summary: A panel that slides in over the page from the end, the start or the bottom edge of the window, for filters, details, an inspector or a short set of choices.
status: beta
since: 1.0.0
category: Feedback & overlays
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
  - An item's details or settings open beside the list they belong to, modal or with the page usable beside them.
  - Filters for a list or a table, applied when people close the panel.
  - A short set of choices from the bottom of the window, such as the ways to share.
avoidWhen:
  - text: A focused task or a decision in the middle of the window.
    use: Dialog
  - text: Details or a few fields beside the control that opens them.
    use: Popover
  - text: Items people keep open and work on beside the page, such as drafts.
    use: PanelDock
  - text: Side content that sits beside the main content in a wide window, such as details.
    use: Panes
components:
  - Sheet
---

# Sheet

## Overview

A sheet is a panel at an edge of the window, over the page or beside it, after Material's side and bottom sheets: an item's details, filters, an inspector or a short set of choices. It shares Dialog's surface, title, description and actions, and DialogClose closes it.

```tsx example=FilterPanel open

```

### Inspector beside the page

With `modal={false}` the page stays usable beside the sheet; `disablePointerDismissal` keeps it open while people choose another row, and `finalFocus` returns focus to the row it showed last.

```tsx example=InspectorPanel

```

### Choices from the bottom

`side="bottom"` holds a short set of choices, as tall as its content.

```tsx example=ShareChoices open

```

## Variants

| Option          | Use for                                                        |
| --------------- | -------------------------------------------------------------- |
| `side="end"`    | Details, settings, filters and inspectors. The default.        |
| `side="start"`  | Panels about what sits at the start of the page.               |
| `side="bottom"` | A short set of choices or actions.                             |
| `width="md"`    | 24 rem, for details and filters. The default.                  |
| `width="lg"`    | 44 rem, for tables, comparisons and longer forms.              |
| `modal={false}` | A panel beside a page that stays usable, such as an inspector. |

`side` is logical: `end` is the right edge in left-to-right text. A `md` side sheet takes the whole width of a compact window, and a `lg` one of a compact or medium window; a bottom sheet is as wide as the window up to 40 rem.

## When to use

- Name the sheet after what it holds, such as Filters or Alex Morgan, with a `title` or an `aria-label`.
- Keep the close button unless another control in the sheet closes it.
- Show the next level inside the sheet rather than opening another; side content that fits beside the page is a [Panes](panes.md) supporting pane.

## Anatomy

```tsx anatomy=SheetAnatomy open

```

1. **Sheet** (`env-sheet-popup`)
2. **Title** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Close button** (`env-dialog-heading > env-button`, `closeLabel`)
5. **Content** (`env-sheet-popup env-checkbox`, `children`)
6. **Action** (`env-dialog-actions > env-button`, `actions`)

Not shown: the scrim behind a modal sheet, `env-sheet-backdrop`.

## Accessibility

### Keyboard

| Key                                                    | Action                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger    | Opens the sheet and moves focus into it.                                                  |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>        | Moves through the sheet; a modal sheet keeps focus inside, a non-modal one lets it go on. |
| <kbd>Esc</kbd>                                         | Closes the sheet, or first what is open inside it; nothing while `pending`.               |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a close button | Closes the sheet; focus returns to the trigger or `finalFocus`.                           |

### envUI provides

- `role="dialog"`, named by the title and described by the description, and the trigger's `aria-haspopup`, `aria-expanded` and `aria-controls`.
- Focus moved in on open, kept inside a modal sheet and returned on close.
- In a modal sheet, the rest of the page hidden, closed to presses and locked from scrolling.
- A close button for touch screen reader users, who have no <kbd>Esc</kbd>, disabled while `pending`.
- Its side, slide and swipe in the text direction.

### You provide

- A `title`, or an `aria-label`, and a `closeLabel` where several panels close nearby.
- `finalFocus` when the trigger is gone, or something other than `trigger` opened the sheet.

## Changelog

- **1.0.0**: Sheet, which was Drawer in 1.0.0-prerelease.0, adds `side="bottom"`, and its widths follow the window classes of its container. Drawer, for the panels that were Dialog's `placement="right"`, with `side`, `width`, a swipe to close and the text direction.
