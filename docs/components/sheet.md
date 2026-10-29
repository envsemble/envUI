---
title: Sheet
summary: A panel that slides in over the page from the end, the start or the bottom edge of the window, for filters, details, an inspector or a short set of choices.
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
  - text: Items people keep open and work on beside the page, such as drafts.
    use: PanelDock
  - text: Side content that sits beside the main content in a wide window, such as details.
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

The end is the right edge in left-to-right text, and the left in right-to-left text.

| Side            | Use for                                                 |
| --------------- | ------------------------------------------------------- |
| From the end    | Details, settings, filters and inspectors. The default. |
| From the start  | Panels about what sits at the start of the page.        |
| From the bottom | A short set of choices or actions.                      |

<!-- specimen: Sides -->

### Choices from the bottom

A sheet from the bottom is as tall as its content.

```tsx figure=ShareChoices open

```

### Widths

A medium side sheet takes the whole width of a compact window, and a large one of a compact or medium window.

- A bottom sheet is as wide as the window, up to a comfortable reading width.

| Width  | Use for                               |
| ------ | ------------------------------------- |
| Medium | Details and filters. The default.     |
| Large  | Tables, comparisons and longer forms. |

## Anatomy

```tsx figure=SheetAnatomy stage=shaded open

```

1. **Sheet** (`env-sheet`)
2. **Title** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Close button** (`env-dialog-heading > env-button`, `closeLabel`)
5. **Content** (`env-sheet env-checkbox`, `children`)
6. **Action** (`env-dialog-actions > env-button`, `actions`)

Not shown: the scrim behind a modal sheet, and the handle on a resizable sheet's inner edge.

## Behaviour

### A dialog at the edge

A sheet has a dialog's surface, title, description and actions.

- On a touch screen a swipe toward its edge closes it too.
- A mouse or a pen never moves the sheet, and a drag inside it selects text.
- In a sheet too short for all it holds, its content scrolls between the title and the actions, which stay in view.
- A sheet is on the navigation's color, so a [Drawer](drawer.md) in it looks as it does at the window's edge; its fill and the scrim set it apart.

### Inspector beside the page

The page can stay usable beside the sheet.

- The sheet then stays open while people choose another row.
- When it closes, focus returns to the row it showed last.

```tsx figure=InspectorPanel stage=shaded motion

```

### Resizable

People can resize a side sheet by its inner edge, by pointer or with the arrow keys, with the same grip as between [Panes](panes.md).

- It stays between a smallest and a largest width, and never grows past the window.

```tsx figure=ResizableDetails motion

```

## Rules

A sheet is named after what it holds, and shows one level at a time.

### Names

Name the sheet after what it holds, such as Filters or Alex Morgan.

### Closing

Keep its close button unless another control in the sheet closes it.

### One level

Show the next level inside the sheet rather than opening another.

## Accessibility

### Keyboard

| Key                                                    | Action                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger    | Opens the sheet and moves focus into it.                                                  |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>        | Moves through the sheet; a modal sheet keeps focus inside, a non-modal one lets it go on. |
| <kbd>Esc</kbd>                                         | Closes the sheet, or first what is open inside it; nothing while its work runs.           |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a close button | Closes the sheet; focus returns to the trigger, or where the application sends it.        |
| <kbd>←</kbd>, <kbd>→</kbd> on the resize handle        | Resizes a resizable side sheet a little; further with <kbd>Shift</kbd>.                   |
| <kbd>Home</kbd>, <kbd>End</kbd> on the resize handle   | Resizes it to its smallest or largest width.                                              |

### envUI provides

- `role="dialog"`, named by the title and described by the description, and the trigger's `aria-haspopup`, `aria-expanded` and `aria-controls`.
- Focus moved in on open, kept inside a modal sheet and returned on close.
- In a modal sheet, the rest of the page hidden, closed to presses and locked from scrolling.
- A close button for touch screen reader users, who have no <kbd>Esc</kbd>, disabled while `pending`.
- Its side, slide and touch swipe in the text direction.
- With `resizable`, a focusable separator on its inner edge, named Resize, with its width as its value.

### You provide

- A `title`, or an `aria-label`, and a `closeLabel` where several panels close nearby.
- `finalFocus` when the trigger is gone, or something other than `trigger` opened the sheet.

## Compose

### Usage

A Sheet opens from its `trigger`, such as a Button, and holds its `title`, a `description`, its content as `children`, which scrolls, and `actions` at the end, the primary action last.

- DialogClose, a Button, closes it.
- Leave it uncontrolled, or control it with `open` and `onOpenChange`; `defaultOpen` opens it on the first render.
- Name it with a `title`, or an `aria-label` where it has none.

```tsx source=FilterPanel

```

#### Side and width

`side` is `end`, the default, `start` or `bottom`, in the text direction: `end` is the right edge in left-to-right text. `width` is `md`, 24 rem and the default, or `lg`, 44 rem, for a side sheet; the widths follow the window classes of its container. A bottom sheet is as tall as its content, and as wide as the window up to 40 rem.

```tsx
<Sheet side="bottom" title="Share" trigger={<Button>Share</Button>}>
  …
</Sheet>
```

#### Beside the page

With `modal={false}` the page stays usable beside the sheet. `disablePointerDismissal` keeps it open while people choose another row, and `finalFocus` returns focus to the row it showed last; `initialFocus` picks where focus goes on opening.

```tsx
<Sheet
  open={person !== undefined}
  onOpenChange={(open) => !open && setSelected(null)}
  modal={false}
  disablePointerDismissal
  finalFocus={opener}
  title={person?.name ?? 'Person'}
  closeLabel="Close details"
>
  …
</Sheet>
```

#### Resizable

With `resizable`, people resize a side sheet by its inner edge, between `minWidth` and `maxWidth`, 16 and 60 rem by default, and never past the window.

- The arrow keys on the handle resize it 1 rem, 5 rem with <kbd>Shift</kbd>.
- It starts at `defaultWidth`; `width` and `onWidthChange` let the application keep the width, as a number of rem.
- A CSS length as `width`, such as `min(30rem, 90%)`, is ignored then, with a warning while developing.
- `resizeLabel` names the handle.

```tsx
<Sheet
  resizable
  minWidth={20}
  maxWidth={48}
  title="Northwind launch"
  trigger={<Button>Project details</Button>}
>
  …
</Sheet>
```

#### Pending work

While `pending`, <kbd>Esc</kbd>, presses outside, swipes and the close button can't dismiss the sheet, so work started from it finishes first.

### Composition

The close button is an IconButton named by `closeLabel`, which `closeButton={false}` leaves out. Put the content in a Column, and show the next level inside the sheet rather than opening another.

### Customize

A Sheet shares Dialog's parts: its heading, `env-dialog-heading`, with the title, `env-dialog-title`, and the close button; the description, `env-dialog-description`; and the actions, `env-dialog-actions`. The panel is `env-sheet`, its content, which scrolls between the heading and the actions, `env-sheet-body`, the scrim behind a modal sheet `env-sheet-backdrop` and the handle on a resizable sheet's inner edge `env-sheet-resize-handle`, the same grip as Panes.Divider's.

## Changelog

- **1.0.0-prerelease.5**: A Sheet has no edge line: its fill and its scrim set it apart, and its edge returns at high contrast. A side sheet keeps its actions at its foot, however little its body holds.
- **1.0.0-prerelease.5**: A Sheet is on the navigation's background, `--env-color-bg-default`, rather than the popup's, in every theme, so navigation that opens in it in a narrow window keeps its color.
- **1.0.0-prerelease.2**: With `resizable`, people resize a side sheet by its inner edge, between `minWidth` and `maxWidth`, from `defaultWidth`; `width` takes a number of rem, which `onWidthChange` keeps. The handle is `env-sheet-resize-handle`, the same grip as Panes.Divider's. Only a finger swipes a sheet closed; a mouse or a pen no longer moves it.
- **1.0.0**: Sheet, which was Drawer in 1.0.0-prerelease.0, adds `side="bottom"`, and its widths follow the window classes of its container. Drawer, for the panels that were Dialog's `placement="right"`, with `side`, `width`, a swipe to close and the text direction.
