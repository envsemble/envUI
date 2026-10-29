---
title: Panes
summary: Two panes side by side, after Material's pane layouts, a main pane with a supporting one or a list and its detail, that make the most of less room.
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
  - readPanesSize
examples:
  SupportingPane:
    role: overview
    caption: A main pane and a supporting one.
    motion: true
  ListAndDetail:
    role: overview
    caption: A list and its detail.
    motion: true
  ResizableDetails: example
  PanesAnatomy: anatomy
  SupportingByWidth: example
  ListDetailByWidth: example
  DetailsButton:
    role: do
    caption: A button that opens the details where there is no room.
  NoWayToDetails:
    role: dont
    caption: 'No button: in less room, the details can’t be reached.'
---

# Panes

## Variants

### Side by side

The panes sit side by side once they are as wide as a medium, an expanded or a large window.

| Side by side from | Use for                                             |
| ----------------- | --------------------------------------------------- |
| Medium            | A main pane that reads well narrow, such as a list. |
| Expanded          | Most panes. The default.                            |
| Large             | A wide main pane, such as a table or a canvas.      |

### Resizable

People can resize the supporting pane or the list by the gap between the panes, with its small grip, by pointer or with the arrow keys.

```tsx figure=ResizableDetails motion

```

## Anatomy

```tsx figure=PanesAnatomy width="38"

```

1. **Root** (`env-panes`)
2. **List** (`env-panes-list`)
3. **Divider** (`env-panes-divider`)
4. **Detail** (`env-panes-detail`)

## Behaviour

### Scrolling

Each pane scrolls on its own where the panes have a height, as in a [Scaffold](scaffold.md) whose body scrolls. Where the page scrolls, the panes scroll with it.

### Adapting to width

The panes decide how they sit from their own width alone.

- A supporting pane becomes a side sheet in a medium width and a bottom sheet in a compact one, which a button in the main pane opens. The sheet is on a [Sheet](sheet.md)'s color, so a surface in the pane reads as the same panel.
- In less room a list and its detail show one at a time, and a back button named after the list, here Team inbox, returns to it.

```tsx figure=SupportingByWidth motion

```

```tsx figure=ListDetailByWidth widths="24 54" sweep classes fit

```

## Rules

Whatever the room, people can reach both panes.

```tsx figure=DetailsButton wide motion

```

```tsx figure=NoWayToDetails wide motion

```

### Between two surfaces

A resizable gap goes between two surfaces, one in each pane.

- Beside content that floats on the page, such as a list beside bare text, its grip hangs in empty space with nothing to say what it resizes.
- So leave it out where the panes have no surfaces.

### Navigation and nesting

The application's navigation goes in the [Scaffold](scaffold.md), not in a supporting pane.

- The next level shows in the detail rather than in panes inside a pane.

## Accessibility

### Keyboard

| Key                                                     | Action                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| <kbd>Esc</kbd> in the supporting sheet                  | Closes it, and focus returns to where it was.                      |
| <kbd>←</kbd>, <kbd>→</kbd> on the divider               | Moves the divider a little; further with <kbd>Shift</kbd>.         |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> on the divider | Moves the divider further.                                         |
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

## Compose

### Usage

Panes.Root takes a `behavior`: `supporting` holds Panes.Main and Panes.Supporting, such as a document and its details, and `list-detail` holds Panes.List and Panes.Detail, such as messages and the one chosen, each pair with an optional Panes.Divider between them.

- Below `splitAt`, the supporting pane is a modal sheet over the main one while `open`, and a list-detail shows the detail instead of the list while `open`.
- The application keeps `open`, setting it as an item is chosen or the sheet's button is pressed.
- `onOpenChange` receives `false` as people close it: <kbd>Esc</kbd>, the close button or a press on the backdrop close the sheet, and the back button returns to the list.

```tsx source=SupportingPane

```

#### Names and buttons

Panes.Supporting and Panes.List take a `label`, which names their region; on Panes.Main and Panes.Detail it is optional, and makes the pane a region landmark, for the panes of a page's main layout.

- Panes.Trigger is a Button, `primary` by default, that opens the supporting sheet and hides while the panes sit side by side.
- `closeLabel` names the sheet's close button, Close by default, and `backLabel` the back button, Back by default, from EnvUIProvider's `messages.panes`; name where it goes, such as Inbox.
- Set `aria-current` on the list's current row.

```tsx
<Panes.Root behavior="list-detail" open={open} onOpenChange={setOpen} backLabel="Inbox">
  <Panes.List label="Inbox">
    <Surface padding={2} style={{ minBlockSize: '100%' }}>
      <List.Root aria-label="Messages">…</List.Root>
    </Surface>
  </Panes.List>
  <Panes.Divider label="Resize the inbox" />
  <Panes.Detail label={chosen.subject}>
    <Surface padding={4} style={{ minBlockSize: '100%' }}>
      …
    </Surface>
  </Panes.Detail>
</Panes.Root>
```

#### Side by side

`splitAt` is the window class of the Panes' own width from which they sit side by side: `medium`, 37.5 rem, `expanded`, 52.5 rem and the default, or `large`, 75 rem. CSS decides it, so the server's markup is already right.

#### Resizable

Panes.Divider, named by its `label`, Resize panes by default, resizes the supporting pane or the list, by pointer and the arrow keys; a double click returns it to `defaultSize`, 22.5 rem by default.

- It stays between `minSize` and `maxSize`, 16 and 40 rem by default, and never leaves the other pane less than 16 rem.
- The arrow keys move it 1 rem, 5 rem with <kbd>Shift</kbd>, and <kbd>Page Up</kbd> and <kbd>Page Down</kbd> 5 rem.
- `size` and `onSizeChange`, which receives each width in rem and `committed` once a drag ends or a key moves it, let the application control it.
- The divider is the gap between two surfaces: give each pane a Surface as tall as the pane, with `min-block-size: 100%`, and where the detail shows alone, its surface fills the room below the back button.
- Panes keeps the same gap without a divider.

`persist` keeps the width people choose in a cookie of that name. Read it on the server with `readPanesSize(cookieHeader, key)` and pass it as `persistedSize`, so nothing moves as the page hydrates.

```tsx
<Panes.Root
  behavior="supporting"
  defaultSize={18}
  minSize={14}
  maxSize={28}
  persist="details-width"
>
  <Panes.Main label="Canvas">…</Panes.Main>
  <Panes.Divider label="Resize details" />
  <Panes.Supporting label="Canvas details">…</Panes.Supporting>
</Panes.Root>
```

### Composition

The parts are the root, `env-panes`, with `data-behavior`, `data-split-at` and `data-open`; the main pane, `env-panes-main`, and the supporting one, `env-panes-supporting`, with its close button, `env-panes-close`, and its backdrop, `env-panes-backdrop`, while it is a sheet, and the trigger that opens it, `env-panes-trigger`; the list, `env-panes-list`, and the detail, `env-panes-detail`, with its back button, `env-panes-back`; and the divider, `env-panes-divider`. Panes paints no background of its own: the surfaces in its panes do. `name` names the node for dev mode, as `data-env-name`.

## Changelog

- **1.0.0-prerelease.5**: The supporting sheet is on a Sheet's fill, `--env-color-bg-default`, rather than `--env-color-bg-raised`, which differ only at high contrast in the light theme.
- **1.0.0**: Panes, which replaces SplitPane and ListDetail: the supporting and list-detail behaviors, `splitAt` at a window class, a divider in rem, and Panes.Trigger, which opens the supporting sheet.
