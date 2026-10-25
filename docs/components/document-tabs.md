---
title: DocumentTabs
summary: Editor-style tabs for open documents, which people switch, close, pin and close all.
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
  - Switching between several open documents or files, such as in an editor
  - Tabs that open and close as people work, one perhaps a preview until kept
avoidWhen:
  - text: Switching between a fixed set of views of the same content, such as Overview and Settings.
    use: Tabs
  - text: Items people keep open beside the page, such as drafts.
    use: PanelDock
  - text: Many documents in folders, browsed as a hierarchy.
    use: Tree
components:
  - DocumentTabs
examples:
  OpenDocuments: overview
  CloseAllButton: example
  DocumentTabsAnatomy: anatomy
  ManyTabs: example
  NameAsLabel:
    role: do
    caption: The document's name as the label, its location as the title.
  PathAsLabel:
    role: dont
    caption: 'Locations as labels: every tab starts the same, and names are cut off.'
---

# DocumentTabs

## Variants

### Buttons after the tabs

The application's own content can follow the tabs, outside the strip that scrolls.

```tsx figure=CloseAllButton

```

## Anatomy

```tsx figure=DocumentTabsAnatomy

```

1. **Strip** (`env-document-tabs`)
2. **Item** (`env-document-tabs-item`)
3. **Tab** (`env-document-tabs-tab`)
4. **Icon** (`env-document-tabs-tab > env-icon`, `icon`)
5. **Label** (`env-document-tabs-tab-label`, `label`)
6. **Close button** (`env-document-tabs-close`)
7. **End** (`env-document-tabs-end`, `end`)

## Behaviour

### Closing

Several ways close a tab, and focus moves to the tab that becomes active.

- The close button, a middle click, <kbd>Delete</kbd> or <kbd>Backspace</kbd>.
- Close in a tab's context menu, which can also offer Close all tabs.
- On touch screens the close buttons always show.

### Preview and reorder

A preview tab shows its label in italics until a double click keeps it.

- Where tabs can be put in order, a tab dragged with a mouse or pen shows where it will land.
- The context menu then offers Move left and Move right.

### Adapting to width

The strip takes the width it is given and scrolls sideways where its tabs don't fit.

- Tabs fade at an edge they run past.
- The active tab scrolls into view.

```tsx figure=ManyTabs widths="22 48"

```

## Rules

A tab names its document, and closing one never loses work.

```tsx figure=NameAsLabel

```

```tsx figure=PathAsLabel

```

### When a tab closes

Activate a neighbour when the active tab closes.

- Offer a way back when the last one closes.
- Ask before closing a document with unsaved changes.

### Inside a tab

A tab holds its icon, its name and its close button, and no other controls.

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

## Compose

### Usage

```tsx
<DocumentTabs
  aria-label="Open documents"
  items={documents}
  value={active}
  onValueChange={setActive}
  onClose={close}
  panelId="document-panel"
/>
<div role="tabpanel" id="document-panel" aria-label={activeDocument.label}>…</div>
```

`items` are the open documents in tab order, each with an `id`, its `label`, an optional `icon`, a `title`, the native tooltip, such as the full path, and `preview`. `value` is the active tab's id, or `null`. `onClose` is called from every way of closing a tab: remove the tab there, activate a neighbour when it was active, and ask first about unsaved changes.

#### Preview, pin and reorder

A `preview` tab's double click calls `onPin`, where the application clears `preview`. With `onReorder`, a drag or Move left and Move right report every tab's id in the new order; without it, the tabs keep their order.

#### Close all and after the tabs

Each tab opens a context menu with Close on right click, long press, the <kbd>Menu</kbd> key and <kbd>Shift</kbd>+<kbd>F10</kbd>. `onCloseAll` adds Close all tabs to it, and the strip around the tabs opens it too. `end` holds content after the tabs, outside the strip that scrolls, as the CloseAllButton example does.

### Composition

`closeLabel`, a function of the tab's label, `closeAllLabel` and `contextMenuLabel` name the close actions and the menu, from EnvUIProvider's `messages.documentTabs` by default. `className`, `style` and `ref` reach the strip, the tab list. Each item, `env-document-tabs-item`, lays out its tab beside its close button, an IconButton with a cross hidden from assistive technology.

## Changelog

- **1.0.0**: `onReorder`: a tab dragged with a mouse or pen shows where it will land and moves there when let go, and each tab's context menu offers Move left and Move right. `end` holds content after the tabs, such as a button that closes them all. Tabs that run past an edge fade out toward it. Rebuilt on Base UI Tabs: each tab sits beside its close button, an IconButton with a cross hidden from assistive technology, instead of around it, which fixes the nested-interactive control, and announces Delete and Backspace, which close it, through `aria-keyshortcuts`. Each tab opens a context menu with Close, also without `onCloseAll`, which adds Close all tabs. The arrow keys and the wheel follow the text direction. Strings come from `messages.documentTabs`, and the strip takes `ref` and `style`. Classes: `env-document-tabs-item` lays out each tab, and `env-document-tab`, `-label` and `-close` are `env-document-tabs-tab`, `-tab-label` and `env-document-tabs-close`.
- **0.6.0**: `onCloseAll`: the strip and each tab open a compact context menu with Close all tabs, and on a tab, closing that tab; focus moves to the tab that becomes active.
- **0.5.0**: DocumentTabs, with preview tabs, pinning and closing.
