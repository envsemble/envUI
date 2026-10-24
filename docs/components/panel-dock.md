---
title: PanelDock
summary: Panels docked side by side at the bottom of a region, for work beside the page, that minimize to tabs and maximize while their content stays mounted.
status: experimental
since: 0.6.0
category: Navigation
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
  - Items people work on beside the page and switch between, such as drafts, conversations or documents.
  - Work that must survive being set aside, such as an unsaved draft in a panel people minimize.
  - Several windows open at once in a workspace, which people minimize, maximize, resize and close.
avoidWhen:
  - text: A task that needs an answer before people go on, or one panel beside the page that inspects it.
    use: Dialog
  - text: Switching between open documents in one place, as in an editor.
    use: DocumentTabs
  - text: One item’s details or settings at the edge of the window, closed when done.
    use: Sheet
components:
  - PanelDock
---

# PanelDock

## Overview

A panel dock holds panels people work in beside the page, such as drafts and conversations: open panels side by side at the bottom inline-end edge, and minimized ones as tabs, as on a taskbar. A panel's content stays mounted through every change, so a draft survives being minimized.

The application owns the panels, their order, modes, the active one and their heights; the dock asks for changes through its callbacks. PanelDock.Header is each panel's sticky header, with the title, the application's actions and the window controls.

```tsx example=DocumentDrafts

```

## Variants

| Mode        | Use for                                                    |
| ----------- | ---------------------------------------------------------- |
| `open`      | Working beside the page, at a height people can change.    |
| `minimized` | Setting a panel aside as a tab, with its content kept.     |
| `maximized` | Giving one panel the whole region, behind the open panels. |

```tsx example=MaximizedPanel caption="A maximized panel fills the region; Restore returns it to the row."

```

### Make room

Open panels take `preferredWidth`, 32 rem, and shrink to `minWidth`, 20 rem; then the row scrolls sideways. With `overflow="minimize"` the dock asks to minimize the panel active longest ago instead, and opens it again once there is room.

```tsx example=MinimizeWhatDoesNotFit

```

## When to use

```tsx do=ShortTabLabels caption="A short tab label, with the full title as its tooltip."

```

```tsx dont=LongTabLabels caption="Long titles on the tabs: they truncate and crowd the strip."

```

- Put the dock in a positioned container with a height, or directly in a [Scaffold](scaffold.md)'s body, where it lies over the visible area.
- Make the content beneath inert while a panel fills the region.
- Activate a panel when it opens, and keep at most one maximized.
- Panels are regions, never modal: a task to finish first is a [Dialog](dialog.md).

## Anatomy

```tsx anatomy=PanelDockAnatomy

```

1. **Dock** (`env-panel-dock`)
2. **Panel** (`env-panel-dock-panel`)
3. **Resize handle** (`env-panel-dock-resize`)
4. **Header** (`env-panel-dock-header`)
5. **Title** (`env-panel-dock-title`, `title`)
6. **Meta** (`env-panel-dock-meta`, `meta`)
7. **Actions** (`env-panel-dock-actions`, `actions`)
8. **Window controls** (`env-panel-dock-controls`)
9. **Tab** (`env-panel-dock-tab`)

## Adapting to width

Below `stackBelow`, 40 rem of the dock's own width, one panel at a time fills the region like a sheet, and the others wait as tabs. A container query on the dock decides it, so the server's markup and the first paint already stack; the dock then reads the layout to report it with `data-stacked` and `onStackedChange` and to make the panels it leaves out inert. The dock is an inline-size container, so an unnamed `@container` query in panel content resolves against it, and an `em` set on the dock itself scales with `stackBelow`, as the dock's font size is `stackBelow` / 37.5. In a narrow panel, the header's actions and controls take a row of their own above the title.

```tsx example=NarrowRegion widths="24 48"

```

## Accessibility

### Keyboard

| Key                                                          | Action                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>              | Moves through each panel's resize handle, header and content, then through the tabs. |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a resize handle                | Makes the panel 16 px taller or shorter, 64 px with <kbd>Shift</kbd>.                |
| <kbd>Home</kbd>, <kbd>End</kbd> on a resize handle           | Makes the panel its lowest or greatest height.                                       |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Minimize             | Minimizes the panel and moves focus to its tab.                                      |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Maximize or Restore  | Fills the region with the panel, or returns it to the row.                           |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Close                | Closes the panel and moves focus to the panel that remains, or to the last tab.      |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a tab                | Brings its panel back, with focus where it was in its content.                       |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a tab's close button | Closes the panel and moves focus to the tab in its place.                            |

### envUI provides

- Each panel as a region named by its title, never a dialog, so focus is never trapped.
- The resize handle as a focusable `separator` with its height and its share of the room.
- Tabs in a list named Hidden panels, each a Show button described by its `attention` text.
- Hidden panels inert, and focus that follows panels as they hide, come back and close.
- Scroll padding that keeps a focused control clear of the sticky header.

### You provide

- A positioned container with a height, and `inert` on the content beneath while a panel fills the region.
- A PanelDock.Header with a title in each panel.
- `attention` text for a tab's dot, and a `tooltip` where labels truncate.
- The names in the page's language, through `messages.panelDock`.

## Changelog

- **1.0.0**: One namespace, `PanelDock.Root` and `PanelDock.Header`; PanelDockControls is internal, `controls` is a boolean and the controls' names come from EnvUIProvider's `messages.panelDock`. Minimized panels are tabs, `env-panel-dock-tab` and `data-tabs`, where they were chips, and a header's application buttons are ghost by default. `showLabel`, which names a tab's button, is `openLabel`.
- **0.6.0**: PanelDock, PanelDockHeader and PanelDockControls: open panels side by side on the bottom inline-end edge, a maximized panel filling the region and minimized panels as chips, with content that stays mounted, resizing from the top edge, `overflow="minimize"`, stacking below `stackBelow`, focus that follows the panels, and labels that localize the dock.
