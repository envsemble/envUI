---
title: DocumentTabs
summary: Editor-style tabs for open documents, which people switch, close, pin and close all; the application renders the active document.
status: stable
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
  - scaffold
  - panel-dock
  - accessibility
components:
  - DocumentTabs
---

# DocumentTabs

## Overview

DocumentTabs is the strip of open documents above an editor: one tab per document, the active one marked, each with a close button. People switch with a click or the arrow keys, close with the button, a middle click, <kbd>Delete</kbd> or <kbd>Backspace</kbd>, or from a tab's context menu, keep a preview tab with a double click, and, with `onCloseAll`, close all tabs from that menu too. The strip renders only the tabs: the application owns the open documents, the active one and its panel.

```tsx example=OpenDocuments

```

## Anatomy

1. **Strip**: a `tablist` named by `aria-label`, as tall as a medium control: 2.5 rem, and 2 rem in the compact scale, that scrolls sideways when its tabs overflow.
2. **Item**: one entry of `items`, with rounded top corners, that lays out its tab and its close button side by side, so the button isn't nested in the tab.
3. **Tab**: an optional `icon` and the `label`; its `title` shows as a native tooltip, the label by default.
4. **Active indicator**: the active tab's fill and a 0.125 rem selection-blue line along its bottom edge.
5. **Close button**: a 1.5 rem round CloseButton, a pointer's affordance with `closeLabel` as its tooltip, shown on the active tab, on hover and with keyboard focus.
6. **Context menu**: a compact menu named `contextMenuLabel` (Tab actions), with the tab's close item, with `onReorder` Move left and Move right, and with `onCloseAll` `closeAllLabel` (Close all tabs).
7. **End** (`end`): the application's own content after the tabs, outside the strip that scrolls and on its hairline, such as a button that closes every tab.

## Variants and sizes

- Tabs are 2.5 rem tall, 2 rem in the compact scale, and 2.75 rem on touch screens; labels are in the small body type and end with an ellipsis beyond about 14 rem.
- A preview tab (`preview`) shows its label in italics until it is pinned.
- The close button keeps its space while hidden, so tabs don't change width; on touch screens it always shows, as tall and wide as its tab.
- The strip takes the width it is given and never widens its container.

## States and behaviour

- **Switching**: a click, the arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> call `onValueChange` with the tab's `id`; the arrow keys wrap at the ends and follow the reading direction, EnvUIProvider's `dir` or the direction at the strip. The active tab scrolls into view within the strip when it changes.
- **Hover and focus**: a tab takes a state layer on hover and press, and keyboard focus shows a focus outline.
- **Closing**: the close button, a middle click (which doesn't activate the tab), <kbd>Delete</kbd> or <kbd>Backspace</kbd> on the focused tab and Close in its context menu call `onClose`. When the focused tab closes, however it closes, focus moves to the tab that becomes active.
- **Pinning**: a double click on a tab, outside its close button, calls `onPin`, such as to keep a preview tab.
- **Overflow**: tabs that run past an edge of the strip fade out toward it over 2.5 rem, so the strip shows there is more; the fade goes once the strip is scrolled to that end.
- **Reordering**: with `onReorder`, a tab dragged with a mouse or pen, once it has moved 4 px, dims in place while a copy of it follows the pointer, and a line marks the gap between tabs nearest the pointer, where it will land, also the gaps on either side of the tab itself, which leave it in place; near an edge the strip scrolls with it. Letting go moves it there; <kbd>Esc</kbd> cancels, and the release that ends a drag selects nothing more. Touch scrolls the strip instead; on touch and with the keyboard, Move left and Move right in the tab's context menu move it one place, in the direction they say on screen, also in right-to-left text. `onReorder` receives every tab's id in the new order.
- **Context menu**: a right click, a long press, the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd> on a tab opens a compact context menu that offers closing that tab, so the keyboard can close a tab where <kbd>Delete</kbd> is missing. With `onCloseAll`, the menu also offers Close all tabs, and the strip around the tabs opens it too; Close all tabs is unavailable while the strip is empty. Without `onCloseAll`, the strip around the tabs opens no menu.
- **Scrolling**: a strip whose tabs overflow scrolls with the wheel, touch or the keyboard, without a scrollbar; the wheel turned down scrolls toward the end, the left in right-to-left text.
- **Application keys**: keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application, such as <kbd>Ctrl</kbd>+<kbd>W</kbd> bound to `onClose`.

## Content guidelines

- Use the document's name as the label, and its full path or location as the `title`.
- Name the strip after what it holds, with `aria-label`: "Open documents".
- Set the strings in the application's language with EnvUIProvider's `messages.documentTabs`, or `closeLabel`, `closeAllLabel` and `contextMenuLabel` for one strip.

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
| <kbd>Delete</kbd> or <kbd>Backspace</kbd>          | Closes the focused tab; focus moves to the tab that becomes active.                                             |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd> | Opens the context menu for the focused tab.                                                                     |

### envUI provides

- A `tablist` of `tab`s named by their labels, with `aria-selected` on the active tab and `aria-controls` pointing at `panelId`.
- A roving tab stop on the active tab, focus kept on a tab as tabs close, and the active tab scrolled into view.
- Tabs built on Base UI Tabs, each beside its close button rather than around it: the close button is hidden from assistive technology and out of the tab order, and each tab announces <kbd>Delete</kbd> and <kbd>Backspace</kbd>, which close it, through `aria-keyshortcuts`; the context menu closes it too.
- The context menu's keys and its return of focus, as ContextMenu provides them.
- A focus outline, and touch-sized tabs with close buttons that always show on coarse pointers.

### You provide

- An `aria-label` for the strip, and the `tabpanel` with `panelId`, named after the active document.
- The documents, the active one, and what closing and pinning do.
- The labels in the application's language.

## Examples

### Many open documents

In a narrow pane the strip scrolls sideways, the active tab stays in view, and tabs fade at an edge they run past. Drag a tab to reorder it: a line shows where it will land, and near an edge the strip scrolls with it.

```tsx example=ManyTabs

```

### Buttons after the tabs

`end` puts the application's own content after the tabs, outside the strip that scrolls and on its hairline, such as a button that opens a new document and one that closes them all.

```tsx example=CloseAllButton

```

## Changelog

- **1.0.0**: `onReorder`: a tab dragged with a mouse or pen shows where it will land and moves there when let go, and each tab's context menu offers Move left and Move right. `end` holds content after the tabs, such as a button that closes them all. Tabs that run past an edge fade out toward it. Rebuilt on Base UI Tabs: each tab sits beside its close button, a CloseButton hidden from assistive technology, instead of around it, which fixes the nested-interactive control, and announces Delete and Backspace, which close it, through `aria-keyshortcuts`. Each tab opens a context menu with Close, also without `onCloseAll`, which adds Close all tabs. The arrow keys and the wheel follow the text direction. Strings come from `messages.documentTabs`, and the strip takes `ref` and `style`. Classes: `env-document-tabs-item` lays out each tab, and `env-document-tab`, `-label` and `-close` are `env-document-tabs-tab`, `-tab-label` and `env-document-tabs-close`.
- **0.6.0**: `onCloseAll`: the strip and each tab open a compact context menu with Close all tabs, and on a tab, closing that tab; focus moves to the tab that becomes active.
- **0.5.0**: DocumentTabs, with preview tabs, pinning and closing.
