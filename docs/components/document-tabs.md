---
title: DocumentTabs
summary: Editor-style tabs for open documents, which people switch, close, pin and close all; the application renders the active document.
status: beta
since: 0.5.0
category: Navigation
aliases:
  - editor tabs
  - file tabs
  - document tab strip
  - tab strip
  - tab bar
  - closable tabs
  - open files
  - workspace tabs
  - preview tab
useWhen:
  - People open several documents or files and switch between them, such as in an editor or a workspace.
  - Tabs open and close as people work, and one may be a preview until it is kept (`preview`, `onPin`).
avoidWhen:
  - text: Switching between a fixed set of views of the same content, such as Overview and Settings.
    use: Tabs
  - text: Destinations in an application's navigation.
    use: NavList
  - text: Choosing one of a few options or filters.
    use: SegmentedControl
  - text: Items people keep open beside the page, such as drafts.
    use: PanelDock
related:
  - tabs
  - tree
  - menu
  - app-shell
  - panel-dock
  - accessibility
components:
  - DocumentTabs
---

# DocumentTabs

## Overview

DocumentTabs is the strip of open documents above an editor: one tab per document, the active one marked, each with a close button. People switch with a click or the arrow keys, close with the button, a middle click or <kbd>Delete</kbd>, keep a preview tab with a double click, and, with `onCloseAll`, close one or all tabs from a context menu. The strip renders only the tabs: the application owns the open documents, the active one and its panel.

```tsx example=OpenDocuments

```

## Anatomy

1. **Strip**: a `tablist` named by `aria-label`, 2.5 rem tall, that scrolls sideways when its tabs overflow.
2. **Tab** (each entry of `items`): an optional `icon`, the `label` and a close button, with rounded top corners; its `title` shows as a native tooltip, the label by default.
3. **Active indicator**: the active tab's fill and a 0.125 rem selection-blue line along its bottom edge.
4. **Close button**: a 1.5 rem round button named by `closeLabel`, shown on the active tab, on hover and with keyboard focus.
5. **Context menu** (with `onCloseAll`): a compact menu named `contextMenuLabel` (Tab actions), with the tab's close item and `closeAllLabel` (Close all tabs).

## Variants and sizes

- Tabs are 2.5 rem tall, and 2.75 rem on touch screens; labels are in the small body type and end with an ellipsis beyond about 14 rem.
- A preview tab (`preview`) shows its label in italics until it is pinned.
- The close button keeps its space while hidden, so tabs don't change width; on touch screens it always shows, as tall and wide as its tab.
- The strip takes the width it is given and never widens its container.

## States and behaviour

- **Switching**: a click, the arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> call `onValueChange` with the tab's `id`; the arrow keys wrap at the ends and follow the reading direction. The active tab scrolls into view within the strip when it changes.
- **Hover and focus**: a tab takes a state layer on hover and press, and keyboard focus shows a focus outline.
- **Closing**: the close button, a middle click (which doesn't activate the tab) and <kbd>Delete</kbd> on the focused tab call `onClose`. When the focused tab closes, however it closes, focus moves to the tab that becomes active.
- **Pinning**: a double click on a tab, outside its close button, calls `onPin`, such as to keep a preview tab.
- **Context menu**: with `onCloseAll`, a right click, a long press, the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd> on the strip opens a compact context menu with Close all tabs; on a tab, it first offers closing that tab. Close all tabs is unavailable while the strip is empty. Without `onCloseAll`, the strip keeps the browser's context menu.
- **Scrolling**: a strip whose tabs overflow scrolls with the wheel, touch or the keyboard, without a scrollbar.
- **Application keys**: keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application, such as <kbd>Ctrl</kbd>+<kbd>W</kbd> bound to `onClose`.

## Content guidelines

- Use the document's name as the label, and its full path or location as the `title`.
- Name the strip after what it holds, with `aria-label`: "Open documents".
- Translate `closeLabel`, `closeAllLabel` and `contextMenuLabel` where the interface is not in English.

## Do and don't

### Do

- Activate a neighbour when the active tab closes, and render its panel below the strip with `panelId`.
- Offer a way back when the last tab closes, such as an empty state with recent documents.
- Give the strip the width of its pane, and let it scroll.

### Don't

- Don't use document tabs for a fixed set of views; use [Tabs](../components/tabs.md).
- Don't put other controls inside a tab.
- Don't close a document with unsaved changes without asking; `onClose` is where the application asks.

## Accessibility

### Keyboard

| Key                                                | Action                                                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>    | Moves focus to the active tab, the strip's one tab stop, and out of the strip; close buttons are not tab stops. |
| <kbd>←</kbd>, <kbd>→</kbd>                         | Moves to the previous or next tab and activates it, wrapping at the ends, in the reading direction.             |
| <kbd>Home</kbd>, <kbd>End</kbd>                    | Moves to the first or last tab and activates it.                                                                |
| <kbd>Enter</kbd> or <kbd>Space</kbd>               | Activates the focused tab.                                                                                      |
| <kbd>Delete</kbd>                                  | Closes the focused tab; focus moves to the tab that becomes active.                                             |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd> | With `onCloseAll`, opens the context menu for the focused tab.                                                  |

### envUI provides

- A `tablist` of `tab`s named by their labels, with `aria-selected` on the active tab and `aria-controls` pointing at `panelId`.
- A roving tab stop on the active tab, focus kept on a tab as tabs close, and the active tab scrolled into view.
- Close buttons named after their tab, such as "Close Roadmap.md", reached with <kbd>Delete</kbd> from the keyboard.
- The context menu's keys and its return of focus, as ContextMenu provides them.
- A focus outline, and touch-sized tabs with close buttons that always show on coarse pointers.

### You provide

- An `aria-label` for the strip, and the `tabpanel` with `panelId`, named after the active document.
- The documents, the active one, and what closing and pinning do.
- The labels in the application's language.

## Examples

### Many open documents

In a narrow pane the strip scrolls sideways, and the active tab stays in view.

```tsx example=ManyTabs

```

## Changelog

- **0.6.0**: `onCloseAll`: the strip and each tab open a compact context menu with Close all tabs, and on a tab, closing that tab; focus moves to the tab that becomes active.
- **0.5.0**: DocumentTabs, with preview tabs, pinning and closing.
