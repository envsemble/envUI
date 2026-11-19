---
title: DocumentTabs
summary: Editor-style tabs for the documents people have open.
status: stable
since: 1.0.0
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
  - text: A fixed set of views of the same content, such as Overview and Settings.
    use: SegmentedControl
  - text: Many documents in folders, browsed as a hierarchy.
    use: Tree
components:
  - DocumentTabs
examples:
  OpenDocuments: overview
  DocumentTabsAnatomy: anatomy
  EditorTabs: example
  ManyTabs: example
---

# DocumentTabs

## Variants

### Tabs of an editor

A tab's `content` takes the place of its label, such as a dimmed folder before a name two tabs share, and its `end` (`env-document-tabs-tab-end`) holds a status, such as a count of errors; the label still names the tab. A tab whose `closable` is false stays open, and `contextMenu` adds the application's own items after the built-in ones.

```tsx figure=EditorTabs

```

## Anatomy

```tsx figure=DocumentTabsAnatomy

```

1. **Tabs** (`env-document-tabs-list`)
2. **Item** (`env-document-tabs-item`)
3. **Tab** (`env-document-tabs-tab`)
4. **Icon** (`env-document-tabs-tab > env-icon`, `icon`)
5. **Label** (`env-document-tabs-tab-label`, `label`)
6. **Close button** (`env-document-tabs-close`)
7. **End** (`env-document-tabs-end`, `end`)
8. **Panel** (`env-document-tabs-panel`, `children`)

## Behaviour

### Adapting to width

```tsx figure=ManyTabs widths="48 22" sweep

```

## Accessibility

### Keyboard

| Key                                                | Action                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd>                         | Moves to the previous or next tab and activates it, wrapping, in the reading direction.      |
| <kbd>Home</kbd>, <kbd>End</kbd>                    | Moves to the first or last tab and activates it.                                             |
| <kbd>Delete</kbd> or <kbd>Backspace</kbd>          | Closes the focused tab unless it isn't closable; focus moves to the tab that becomes active. |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd> | Opens the context menu for the focused tab.                                                  |
