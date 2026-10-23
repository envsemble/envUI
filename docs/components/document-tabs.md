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
  - text: Items people keep open beside the page, such as drafts.
    use: PanelDock
  - text: Many documents in folders, browsed as a hierarchy.
    use: Tree
components:
  - DocumentTabs
---

# DocumentTabs

## Overview

Document tabs are the strip of open documents above an editor, one tab per document, each with a close button. The application owns the documents, the active one and its panel; the strip renders the tabs.

```tsx example=OpenDocuments

```

### Closing

The close button, a middle click, <kbd>Delete</kbd> or <kbd>Backspace</kbd>, and Close in a tab's context menu call `onClose`; focus moves to the tab that becomes active. With `onCloseAll`, the context menu offers Close all tabs.

### Preview and reorder

A `preview` tab shows its label in italics until a double click calls `onPin`. With `onReorder`, a tab dragged with a mouse or pen shows where it will land, and the context menu offers Move left and Move right.

### Buttons after the tabs

`end` puts the application's own content after the tabs, outside the strip that scrolls.

```tsx example=CloseAllButton

```

## When to use

```tsx do=NameAsLabel caption="The document's name as the label, its location as the title."

```

```tsx dont=PathAsLabel caption="Locations as labels: every tab starts the same, and names are cut off."

```

- Activate a neighbour when the active tab closes, and offer a way back when the last one closes.
- Ask before closing a document with unsaved changes, in `onClose`.
- No other controls inside a tab.

## Anatomy

```tsx anatomy=DocumentTabsAnatomy

```

1. **Strip** (`env-document-tabs`)
2. **Item** (`env-document-tabs-item`)
3. **Tab** (`env-document-tabs-tab`)
4. **Icon** (`env-document-tabs-tab > env-icon`, `icon`)
5. **Label** (`env-document-tabs-tab-label`, `label`)
6. **Close button** (`env-document-tabs-close`)
7. **End** (`env-document-tabs-end`, `end`)

## Adapting to width

The strip takes the width it is given and scrolls sideways where its tabs don't fit; tabs fade at an edge they run past, and the active one scrolls into view.

```tsx example=ManyTabs widths="22 48"

```

## Accessibility

### Keyboard

| Key                                                | Action                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>    | Moves to the active tab, the strip's one tab stop, and out; close buttons aren't stops. |
| <kbd>←</kbd>, <kbd>→</kbd>                         | Moves to the previous or next tab and activates it, wrapping, in the reading direction. |
| <kbd>Home</kbd>, <kbd>End</kbd>                    | Moves to the first or last tab and activates it.                                        |
| <kbd>Enter</kbd> or <kbd>Space</kbd>               | Activates the focused tab.                                                              |
| <kbd>Delete</kbd> or <kbd>Backspace</kbd>          | Closes the focused tab; focus moves to the tab that becomes active.                     |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd> | Opens the context menu for the focused tab.                                             |

### envUI provides

- A `tablist` of `tab`s with `aria-selected`, `aria-controls` and `aria-keyshortcuts` for the keys that close them.
- Each close button beside its tab, hidden from assistive technology, so the context menu and the keys close it instead.
- Touch-sized tabs, whose close buttons always show on coarse pointers.

### You provide

- An `aria-label` for the strip, and the `tabpanel` with `panelId`, named after the active document.
- The labels in the application's language, through `messages.documentTabs`.

## Changelog

- **1.0.0**: `onReorder`: a tab dragged with a mouse or pen shows where it will land and moves there when let go, and each tab's context menu offers Move left and Move right. `end` holds content after the tabs, such as a button that closes them all. Tabs that run past an edge fade out toward it. Rebuilt on Base UI Tabs: each tab sits beside its close button, an IconButton with a cross hidden from assistive technology, instead of around it, which fixes the nested-interactive control, and announces Delete and Backspace, which close it, through `aria-keyshortcuts`. Each tab opens a context menu with Close, also without `onCloseAll`, which adds Close all tabs. The arrow keys and the wheel follow the text direction. Strings come from `messages.documentTabs`, and the strip takes `ref` and `style`. Classes: `env-document-tabs-item` lays out each tab, and `env-document-tab`, `-label` and `-close` are `env-document-tabs-tab`, `-tab-label` and `env-document-tabs-close`.
- **0.6.0**: `onCloseAll`: the strip and each tab open a compact context menu with Close all tabs, and on a tab, closing that tab; focus moves to the tab that becomes active.
- **0.5.0**: DocumentTabs, with preview tabs, pinning and closing.
