---
title: PanelDock
summary: Panels docked at the bottom of a region, for work beside the page.
status: alpha
since: 1.0.0
category: App frame & layout
aliases:
  - dock
  - docked panels
  - floating panels
  - floating windows
  - window manager
  - chat windows
  - compose windows
  - minimized panels
  - taskbar
  - PanelDockHeader
  - PanelDockControls
  - PanelDockPanel
useWhen:
  - Items worked on beside the page, such as drafts or conversations
  - Work that must survive being set aside, such as an unsaved draft
  - Several windows open in a workspace, minimized, maximized, resized and closed
avoidWhen:
  - text: A task that needs an answer before people go on.
    use: Dialog
  - text: Switching between open documents in one place, as in an editor.
    use: DocumentTabs
  - text: One item’s details or settings at the edge of the window, closed when done.
    use: Sheet
components:
  - PanelDock
examples:
  DocumentDrafts:
    role: overview
    device: window
  MaximizedPanel: example
  PanelDockAnatomy: anatomy
  MinimizeWhatDoesNotFit: example
  NarrowRegion: example
---

# PanelDock

## Variants

```tsx figure=MaximizedPanel motion device=window

```

## Anatomy

```tsx figure=PanelDockAnatomy width="34"

```

1. **Dock** (`env-panel-dock`)
2. **Panel** (`env-panel-dock-panel`)
3. **Header** (`env-panel-dock-header`)
4. **Title** (`env-panel-dock-title`, `title`)
5. **Meta** (`env-panel-dock-meta`, `meta`)
6. **Actions** (`env-panel-dock-actions`, `actions`)
7. **Window controls** (`env-panel-dock-controls`)
8. **Tab** (`env-panel-dock-tab`)

## Behaviour

### Make room

```tsx figure=MinimizeWhatDoesNotFit motion

```

### Adapting to width

```tsx figure=NarrowRegion widths="48 24" sweep

```

## Accessibility

### Keyboard

| Key                                                | Action                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a resize handle      | Makes the panel a little taller or shorter, more with <kbd>Shift</kbd>. |
| <kbd>Home</kbd>, <kbd>End</kbd> on a resize handle | Makes the panel its lowest or greatest height.                          |
