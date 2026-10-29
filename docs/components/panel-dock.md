---
title: PanelDock
summary: Panels docked side by side at the bottom of a region, for work beside the page, that minimize to tabs and maximize while their content stays mounted.
status: experimental
since: 0.6.0
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
  - Items worked on beside the page and switched between, such as drafts or conversations
  - Work that must survive being set aside, such as an unsaved draft
  - Several windows open in a workspace, minimized, maximized, resized and closed
avoidWhen:
  - text: A task that needs an answer before people go on, or one panel beside the page that inspects it.
    use: Dialog
  - text: Switching between open documents in one place, as in an editor.
    use: DocumentTabs
  - text: One item’s details or settings at the edge of the window, closed when done.
    use: Sheet
components:
  - PanelDock
examples:
  DocumentDrafts: overview
  MaximizedPanel:
    role: example
    caption: A maximized panel fills the region; Restore returns it to the row.
  PanelDockAnatomy: anatomy
  MinimizeWhatDoesNotFit: example
  NarrowRegion: example
  ShortTabLabels:
    role: do
    caption: A short tab label, with the full title as its tooltip.
---

# PanelDock

## Variants

| Mode      | Use for                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| Open      | Working beside the page, at a height people can change.                                       |
| Minimized | Setting a panel aside as a tab over the bottom edge, with its content kept and nothing moved. |
| Maximized | Giving one panel the whole region, behind the open panels.                                    |

```tsx figure=MaximizedPanel motion

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

Not shown: the resize handle, an invisible strip along an open panel's top edge.

## Behaviour

### The header

Each panel's header stays in view as its content scrolls, with its title, the application's actions and the window controls.

### Make room

Open panels take their preferred width and shrink to a minimum, then the row scrolls sideways.

- The dock can instead minimize the panel used longest ago, and open it again once there is room.

```tsx figure=MinimizeWhatDoesNotFit motion

```

### Adapting to width

Where the dock is narrow, such as on a phone, one panel at a time fills the region like a sheet, and the others wait as tabs. In a narrow panel, the header's actions and controls take a row of their own above the title.

```tsx figure=NarrowRegion widths="48 24" sweep

```

## Rules

Keep the tabs short, and one panel at the front.

```tsx figure=ShortTabLabels motion

```

### Where it goes

Put the dock in a region with a height of its own, or directly in a [Scaffold](scaffold.md)'s body, where it lies over the visible area.

### One panel at the front

Activate a panel when it opens, and keep at most one maximized.

- While a panel fills the region, keep people from reaching the content beneath it.

## Accessibility

### Keyboard

| Key                                                          | Action                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>              | Moves through each panel's resize handle, header and content, then through the tabs. |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a resize handle                | Makes the panel a little taller or shorter, more with <kbd>Shift</kbd>.              |
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

## Compose

### Usage

PanelDock.Root takes the application's `panels`, in order, each a `PanelDockPanel` with its `id`, its `title`, which names its region and its tab, and its `mode`, `open`, `minimized` or `maximized`.

- Its `children` is a function that renders a panel's content from its panel, which mounts once and stays mounted until the panel closes.
- The application owns the panels, their order, modes, the active one and their heights, and the dock asks for changes: `onModeChange` with the mode a panel asks for, `onClose`, `onActivate` when people press or focus inside a panel that isn't `active`, and `onHeightChange` with a new height in pixels.
- Open panels sit side by side at the bottom inline-end, the newest at the end.

```tsx source=DocumentDrafts

```

#### Header

PanelDock.Header is each panel's sticky header.

- Its `title` is a heading at `headingLevel`, 2 by default, with `meta` below it.
- The application's `actions` take the ghost variant where they set none.
- The window controls, Minimize, Maximize or Restore, and Close, follow them; `controls={false}` leaves them out.
- Its `children` stay with the header below the title row, such as Tabs.

#### Tabs

A minimized panel is a tab.

- `label` gives the tab a shorter text than the title, and `icon` an icon.
- `tooltip` gives it the full title.
- `attention` gives it a dot, described by its text, such as Unsaved changes.

#### Make room

A panel takes `preferredWidth`, 32 rem, where the row has room, and shrinks to `minWidth`, 20 rem, up to `maxWidth`, 48 rem; then the row scrolls sideways.

- With `overflow="minimize"`, the dock instead asks `onModeChange` to minimize the open panel active longest ago, one at a time, until the rest fit, and to open it again once there is room. It never asks for the active panel, the newest one or the one that holds focus.
- A panel starts at 85% of the dock's room, up to 40 rem, unless `height` sets it, and people resize it between `minHeight`, 15 rem, and `maxHeight`, the dock's room; all of them are in pixels.
- The tabs float over the bottom of the open panels, so a panel minimized or brought back never moves the others; their content keeps the tabs' height clear at its end, so it scrolls out from beneath them.
- The arrow keys on a resize handle change the height by 16 px, and by 64 px with <kbd>Shift</kbd>.

```tsx
<PanelDock.Root
  panels={panels}
  overflow="minimize"
  onModeChange={changeMode}
  onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
  onActivate={(id) => update((panel) => ({ ...panel, active: panel.id === id }))}
  onHeightChange={(id, height) =>
    update((panel) => (panel.id === id ? { ...panel, height } : panel))
  }
>
  {(panel) => <PanelDock.Header title={panel.title} />}
</PanelDock.Root>
```

#### Stacking

Below `stackBelow`, 40 rem of the dock's own width, or a number of pixels, one panel at a time fills the region and the others wait as tabs.

- A container query on the dock decides it, so the server's markup and the first paint already stack.
- The dock then reads the layout to report it with `data-stacked` and `onStackedChange`, and to make the panels it leaves out inert.
- The dock is an inline-size container, so an unnamed `@container` query in panel content resolves against it.
- An `em` set on the dock itself scales with `stackBelow`, as the dock's font size is `stackBelow` / 37.5.

### Composition

Put the dock in a positioned container with a height, or directly in a Scaffold's body.

- Set `inert` on the content beneath while a panel is maximized.
- `minimizedLabel`, `openLabel`, `closeLabel` and `resizeLabel` name the list of tabs, a tab's buttons and the resize handles for one dock, from EnvUIProvider's `messages.panelDock` by default.

The parts are the dock, `env-panel-dock`; each panel, `env-panel-dock-panel`, with its resize handle, `env-panel-dock-resize-handle`, its header, `env-panel-dock-header`, which holds the title, `env-panel-dock-title`, the meta, `env-panel-dock-meta`, the actions, `env-panel-dock-actions`, and the window controls, `env-panel-dock-controls`, and its content, `env-panel-dock-content`; and the tabs, `env-panel-dock-tab`, in the strip, `env-panel-dock-strip`. The dock has `data-tabs` while it shows tabs.

## Changelog

- **1.0.0**: One namespace, `PanelDock.Root` and `PanelDock.Header`; PanelDockControls is internal, `controls` is a boolean and the controls' names come from EnvUIProvider's `messages.panelDock`. Minimized panels are tabs, `env-panel-dock-tab` and `data-tabs`, where they were chips, and a header's application buttons are ghost by default. `showLabel`, which names a tab's button, is `openLabel`. A panel's resize handle, `env-panel-dock-resize`, is `env-panel-dock-resize-handle`, as every resize handle is named.
- **0.6.0**: PanelDock, PanelDockHeader and PanelDockControls: open panels side by side on the bottom inline-end edge, a maximized panel filling the region and minimized panels as chips, with content that stays mounted, resizing from the top edge, `overflow="minimize"`, stacking below `stackBelow`, focus that follows the panels, and labels that localize the dock.
