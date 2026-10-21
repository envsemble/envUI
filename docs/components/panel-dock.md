---
title: PanelDock
summary: Panels docked side by side at the bottom of a region, for work beside the page, that minimize to tabs and maximize while their content stays mounted.
status: stable
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
  - text: A short message about something that happened.
    use: Toast
related:
  - dialog
  - document-tabs
  - scaffold
  - menu
  - tooltip
  - accessibility
components:
  - PanelDock
---

# PanelDock

## Overview

A panel dock holds panels people work in beside the page, such as drafts and conversations. Open panels stand side by side on the bottom inline-end edge of a region, a maximized panel fills the region, and minimized panels wait as tabs along the bottom, as on a taskbar. A panel's content mounts once and stays mounted through every change of mode and order, so a draft in its own state survives being minimized.

The application owns the panels: which exist, their order and mode, which one is active and any height it keeps. The dock asks for changes through its callbacks and shows what it is given. Two parts work together:

- **PanelDock.Root** lays out the panels and their tabs and renders each panel's content from `children`.
- **PanelDock.Header** is a panel's sticky header: the title and metadata, the application's actions and the window controls, Minimize, Maximize or Restore, and Close, which `controls={false}` leaves out.

```tsx example=DocumentDrafts

```

## Anatomy

1. **Dock**: fills its positioned container and lies over it; around its panels and tabs, presses reach the content beneath. It keeps a 1.5 rem gutter for the panels' shadows.
2. **Row**: the open panels, 0.5 rem apart at the bottom inline-end edge, the newest at the end.
3. **Panel** (each item of `panels`): a labelled region on the dialog surface, with a hairline border and a shadow, its top corners 1.75 rem. The active panel is in front, with a deeper shadow.
4. **Resize handle**: the panel's top edge, a 0.75 rem band between its rounded corners; a 2.5 rem bar shows on hover, in the focus color with the keyboard and while dragging.
5. **Header** (PanelDock.Header): sticks to the top of the content, with 0.75 rem block and 1.5 rem start padding. The **title** is a heading in 1.125 rem medium text and the **meta** below it 0.875 rem muted text; the **actions**, whose buttons take the ghost variant unless they set another, and the **window controls** are 2 rem small icon buttons at the end; `children`, such as Tabs, go below the title row.
6. **Content**: the panel's body from `children`, which scrolls within the panel below the header.
7. **Strip of tabs**: minimized panels at the bottom inline-end, in panel order. Each **tab** is 2 rem tall and at most 14 rem wide, on the popup surface with 0.5 rem top corners: an optional icon, the label, an attention dot and a close button.
8. **Maximized panel**: fills the region above the tabs, behind the open panels, without border or corners.

## Variants and sizes

| Mode        | Use for                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `open`      | Working beside the page: side by side with the other open panels, at a height people can change. |
| `minimized` | Setting a panel aside as a tab, with its content kept.                                           |
| `maximized` | Giving one panel the whole region, behind the open panels.                                       |

- **Overflow**: once the open panels can't all fit at their minimum widths, the row scrolls sideways, `overflow="scroll"`, the default; with `overflow="minimize"` the dock keeps every panel in view by asking to minimize the least recently active one instead.
- **Widths**: each open panel takes `preferredWidth`, 32 rem by default, while the row has room; then the panels shrink in proportion down to `minWidth`, 20 rem, and the row scrolls or makes room. `maxWidth`, 48 rem, caps a panel.
- **Heights**: without `height` a panel starts at 85% of the room above the tabs, up to 40 rem, and keeps the height people choose. Resizing stays between `minHeight`, 15 rem, and `maxHeight`, the room above the tabs; a shorter region holds the panel lower without changing its height.
- **Narrow regions**: below `stackBelow`, 40 rem of the dock's own width by default, one panel at a time fills the region like a sheet, and the others wait as tabs.
- **Header**: the title keeps about 10 rem beside the actions and window controls; in a narrower panel they take a row of their own above it, at the inline end, and the title wraps between words.

## States and behaviour

- **Content stays mounted**: a panel's content mounts when the panel first appears and stays until it closes. Minimizing, maximizing and restoring it, a stacked dock showing another panel, resizing and reordering never mount it again: its state, effects and subscriptions stay, and so do focus and the scroll positions inside it. A minimized panel stays in the document, inert and out of sight, so a frame or a video in it carries on. A reorder moves the panel's element; the dock keeps focus and scroll positions where they were, also in content that scrolls itself meanwhile, though a frame inside reloads, as browsers do with moved frames.
- **Asking for changes**: the window controls and the tabs call `onModeChange` and `onClose`; pressing or focusing inside a panel that is not active, and bringing it back from its tab, call `onActivate`. The application answers by rendering the dock with the change. Keep at most one panel maximized, and activate a panel when it opens.
- **The row**: free room gathers before the panels, so they sit at the inline end. A panel that joins the row scrolls into view, so the newest stays visible, also as the region narrows; touch, a sideways wheel and moving focus scroll an overflowing row, and its scrollbar works.
- **Making room**: with `overflow="minimize"` the dock asks `onModeChange` to minimize the least recently active open panel until the rest fit. It never asks for the active panel, the newest one, such as one just brought back from its tab, or the one that holds focus, as where people type, and so never for a panel alone in the row; where those can't fit by themselves, the row scrolls instead. It asks for one change at a time and waits for the answer, also one that comes in a transition or after an asynchronous step. A panel the application keeps open for 5 seconds, or opens again itself, stays until the region changes size, and the dock asks for the next one. Once the region widens and a panel it minimized fits again at its width while open, the dock asks to open it, the most recently active first. Room people free brings no panel back, and panels people minimize stay tabs.
- **Resizing**: dragging the top edge of an open panel changes its height, and `onHeightChange` receives it in pixels once the drag ends; the arrow keys change it by 16 px, 64 px with <kbd>Shift</kbd>, and <kbd>Home</kbd> and <kbd>End</kbd> reach its bounds, reported on each key press. The edge reads the height as its share of the room above the tabs, such as 85%. A cancelled drag keeps the height it began with, and a drag ends without a change when the edge goes, as when the panel is maximized meanwhile.
- **Maximized**: a maximized panel fills the region above the tabs, behind the open panels, which keep their modes and leave the first row of its header in view. Restore returns it to the row.
- **Tabs**: pressing a tab brings its panel back and activates it; its close button closes the panel. A label truncates beyond about 14 rem, so pass the full title as `tooltip`; `attention` shows a dot and describes the tab, such as Unsaved changes. A vertical wheel scrolls an overflowing strip sideways.
- **Stacked**: `stackBelow` follows the dock's own width, not the window's. Below it the active panel, or else the newest, fills the region, without its resize handle and Maximize, and the others wait as tabs. A tab shows its panel instead, also where the application doesn't activate it, until another panel becomes active or the dock widens; a panel that opens meanwhile shows in its place. The dock has `data-stacked`, and `onStackedChange` reports each change. A hidden dock keeps its layout until it shows again.
- **Covering the page**: while a panel fills the region, maximized or alone in a stacked dock, the dock covers the content beneath, also around the tabs.
- **Focus follows the panels**: minimizing the focused panel moves focus to its tab, also from a popup the panel opened, such as a menu. Bringing it back returns focus to the element in its content that had it last, scrolled into view where the panel hid it entirely, also inside a list that scrolls on its own, or else to the panel. Closing the focused panel moves focus to the active panel in view, else to the last open panel in the row, else to the panel that fills the region, or else to the last tab; closing a tab moves focus to the tab that takes its place. The page scrolls only where the element would otherwise lie entirely outside the window, and focus outside the dock stays there.
- **Popups**: pressing a window control closes a menu or popover open in the panel, as any press outside it does. When the application hides a panel itself while one is open, as from a keyboard shortcut, the popup stays until the next press or <kbd>Esc</kbd>.
- **The sticky header**: the content's scroll padding follows the header's height, so a control that takes focus beneath it comes out below it. Once the content scrolls beneath the header, a hairline in the panel's border color sets it apart, also where the header sits in a form that holds the content; it fades in over 0.12 s, at once with reduced motion. Buttons in the header's actions that set no variant are ghost, as the window controls are.
- **Motion**: panels rise 1.5 rem into the row, a maximized or stacked panel grows into the region, and tabs rise into their strip; with reduced motion they only fade in. A reorder moves them without their entrance, and panels rendered on a server are in place without one.
- **Right to left**: the dock gathers at the left, its inline end, and the newest panel stays at the left edge of an overflowing row.

## Content guidelines

- Title a panel after what it holds, such as "Quarterly report" or a person's name for a conversation, and keep it short; put detail in `meta`, such as who changed it last.
- Give a long title a shorter tab `label`, such as "Budget", and the full title as `tooltip`.
- Describe a tab's dot with what it means in a few words, such as "Unsaved changes" or "New message".
- Put the application's actions for the panel in `actions`, such as Edit and a Menu of more, and leave the window controls last.

## Do and don't

### Do

- Put the dock in a positioned container with a height, such as the area below a header, beside page content that scrolls on its own.
- In a [Scaffold](../components/scaffold.md), put the dock directly in its body: it lies over the body's visible area and stays there while the body scrolls, with no positioning of your own.
- Keep each panel's work, such as a draft, in the panel's own state; the dock keeps it mounted.
- Make the content beneath inert while a panel fills the region: while a panel is maximized, or while the dock stacks and a panel is not minimized.
- Activate a panel when it opens, and keep at most one panel maximized.

### Don't

- Don't use a panel for a task that must be finished before people go on; use a [Dialog](../components/dialog.md).
- Don't use the dock for documents people switch between in one place; use [DocumentTabs](../components/document-tabs.md).
- Don't trap focus in a panel or make it modal; panels are regions beside the page.
- Don't hide a panel from a shortcut while a popup it opened is open; close the popup first.

## Accessibility

### Keyboard

| Key                                                          | Action                                                                                                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>              | Moves through each panel in order, its resize handle, its header's actions and window controls, then its content, and then through the tabs, each a Show button and its close button. |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a resize handle                | Makes the panel 16 px taller or shorter, 64 px with <kbd>Shift</kbd>.                                                                                                                 |
| <kbd>Home</kbd>, <kbd>End</kbd> on a resize handle           | Makes the panel its lowest or greatest height.                                                                                                                                        |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Minimize             | Minimizes the panel and moves focus to its tab.                                                                                                                                       |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Maximize or Restore  | Fills the region with the panel, or returns it to the row.                                                                                                                            |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Close                | Closes the panel and moves focus to the panel that remains, or to the last tab.                                                                                                       |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a tab                | Brings its panel back, with focus where it was in the panel's content.                                                                                                                |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a tab's close button | Closes the panel and moves focus to the tab in its place.                                                                                                                             |

### envUI provides

- Each panel as a region named by its title, never a dialog: panels don't trap focus, and the page stays usable around them.
- A focusable resize handle with the `separator` role, named Resize and the title, with its height in `aria-valuenow`, `aria-valuemin` and `aria-valuemax` and its share of the room in `aria-valuetext`.
- Window controls as icon buttons with their names in tooltips, and the title as a heading at `headingLevel`.
- Tabs in a list named Hidden panels, each a Show button, described by its `attention` text, and a CloseButton; decorative icons and the dot hidden from assistive technology.
- Hidden panels inert and out of sight, and focus that follows panels as they hide, come back and close.
- Scroll padding that keeps a focused control from hiding beneath the sticky header.
- A taller resize band with its bar always shown, header controls that grow to 2.75 rem, and tabs whose buttons grow to 2.75 rem, on coarse pointers.

### You provide

- A positioned container with a height, or a Main that scrolls with the dock directly in it, and `inert` on the content beneath while a panel fills the region. While a dock is directly in Main, Main is a size container, so an unnamed `@container` query on a block size inside it resolves against Main.
- The panels: their order, modes, the active one and their heights, through the callbacks.
- A PanelDock.Header with a title in each panel, which names it for people who see it.
- `attention` text for a tab's dot, and a `tooltip` with the full title where labels truncate.
- The names in the page's language, through EnvUIProvider's `messages.panelDock`: the window controls (`minimize`, `maximize`, `restore`, `close`), the list of tabs (`hidden`), and the tabs' and resize handles' names (`show`, `closePanel`, `resize`). `minimizedLabel`, `openLabel`, `closeLabel` and `resizeLabel` override them for one dock.

## Examples

### Maximized panel

A maximized panel fills the region behind the open panels, which keep their modes; Restore returns it to the row.

```tsx example=MaximizedPanel

```

### Minimize what does not fit

With `overflow="minimize"` three panels that can't sit side by side at 20 rem make room: the one active longest ago waits as a tab. It comes back once the region widens.

```tsx example=MinimizeWhatDoesNotFit

```

### Narrow region

Below `stackBelow` one panel at a time fills the region, here the active conversation, and its tab shows the other.

```tsx example=NarrowRegion

```

## Changelog

- **1.0.0**: One namespace, `PanelDock.Root` and `PanelDock.Header`; PanelDockControls is internal, `controls` is a boolean and the controls' names come from EnvUIProvider's `messages.panelDock`. Minimized panels are tabs, `env-panel-dock-tab` and `data-tabs`, where they were chips, and a header's application buttons are ghost by default. `showLabel`, which names a tab's button, is `openLabel`.
- **0.6.0**: PanelDock, PanelDockHeader and PanelDockControls: open panels side by side on the bottom inline-end edge, a maximized panel filling the region and minimized panels as chips, with content that stays mounted, resizing from the top edge, `overflow="minimize"`, stacking below `stackBelow`, focus that follows the panels, and labels that localize the dock.
