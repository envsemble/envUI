---
title: Sidebar
summary: A frame's sidebar and its parts, which collapse to a rail of icons or out of view, open over the content, resize and become a drawer on phones, with the trigger that opens and closes it.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - side navigation
  - sidenav
  - navigation drawer
  - collapsible sidebar
  - sidebar toggle
  - hamburger
  - drawer button
  - menu button
  - rail
  - navigation rail
  - resize handle
  - splitter
useWhen:
  - An application's navigation sits in a column at the start that collapses to icons, or out of view.
  - A directory, an outline or filters sit in a column beside the page that people open, close and resize.
  - A settings page has its own sub-navigation beside its content, without the app frame (Sidebar.Provider).
avoidWhen:
  - text: The frame around the sidebars, with the header and the main content.
    use: AppShell
  - text: The destinations inside a sidebar.
    use: NavList
  - text: Two panes of a page that people resize, such as a list and its detail.
    use: SplitPane
  - text: A panel that slides in for a task, such as filters on a phone.
    use: Drawer
related:
  - app-shell
  - nav-list
  - account-menu
  - search-trigger
  - drawer
components:
  - Sidebar
  - SidebarTrigger
  - useSidebar
---

# Sidebar

## Overview

A sidebar is a column of a frame, a landmark named by its `label`: the application's navigation at the start, or a directory, an outline or an inspector at the end. It collapses to a **rail** of icons or out of view (**off canvas**), its rail opens over the content when the pointer rests on it, people can resize it, and below the frame's breakpoint its content moves into a drawer from its side. Expanding and collapsing never remount its content, so focus stays on the same element.

- **Sidebar.Root**: the column, with `side`, `collapsible`, `dockAt`, `peek`, `width` and `resizable`.
- **Sidebar.Header**, **Sidebar.Content**, **Sidebar.Group**, **Sidebar.Footer**: its top row, its scrolling sections, its labelled groups and its bottom row.
- **Sidebar.Handle**: its edge, a window splitter that resizes it and collapses or expands it.
- **SidebarTrigger**: the button that opens and closes it, wherever it is: in the sidebar's header, in AppShell.Header or in a page's own header.
- **Sidebar.Provider**: the state of sidebars and their triggers without AppShell.Root, which provides the same.
- **useSidebar**: a side's state and controls, for content that adapts to a rail or closes the sidebar after a choice.

```tsx example=Rail

```

## Anatomy

1. **Header** (`Sidebar.Header`): as tall as AppShell.Header, so the two line up, usually a SidebarTrigger with the application's mark and an OrganizationSwitcher; in a rail it shows only the trigger.
2. **Content** (`Sidebar.Content`): a section that scrolls when it alone overflows, such as a NavList.Root; `fill` takes the remaining height, such as for a Tree, and hides in a rail; `align="stretch"` gives its children the full width, such as a search field.
3. **Group** (`Sidebar.Group`): a `label` above related content, as a heading with `headingLevel` or naming a `group`, with an `action` at its end; in a rail the label is visually hidden and a hairline separates the groups.
4. **Footer** (`Sidebar.Footer`): at the bottom, such as an AccountMenu, whose automatic trigger is a row in the sidebar and an avatar in its rail.
5. **Handle** (`Sidebar.Handle`): at the inline end (the inline start at the end side), inside the sidebar; added automatically to a `resizable` sidebar without one.

## Variants and sizes

| Prop          | Values                                   | Use for                                                                                                                          |
| ------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `collapsible` | `rail` (default)                         | Collapses to its icons, in a column one control and its insets wide, so the trigger and the icons share a centre line.           |
|               | `offcanvas`                              | Collapses out of view, inert, and its column closes.                                                                             |
|               | `none`                                   | Always expanded above the breakpoint; its trigger is hidden there.                                                               |
| `peek`        | `hover-focus` (default), `hover`, `none` | How a rail opens over the content: on a rest of `peekDelay` (200 ms) and on keyboard focus, on the rest only, or never.          |
| `dockAt`      | `sm`, `md`, `lg`, `xl`                   | From this width people can dock it expanded; between the frame's breakpoint and dockAt it is a rail that opens over the content. |
| `width`       | `content` (default), a number            | `content` fits the content between 12 and 20 rem; a number is a width in rem.                                                    |
| `resizable`   | `true`                                   | People choose the width between `minWidth` (12 rem) and `maxWidth` (32 rem) with the handle.                                     |
| `side`        | `start` (default), `end`                 | The frame's side; an end sidebar is a `complementary` landmark unless `landmark` says otherwise.                                 |
| `mobile`      | `drawer` (default), `none`               | Below the breakpoint, a drawer from its side, or nothing, for an application that brings its own.                                |

- Every size is a token: the rail is `--env-control-height` plus twice `--env-sidebar-inset` (0.75 rem) wide, and grows with the controls to 2.75 rem plus its insets under a coarse pointer, where the trigger is 44 px. The drawer is at least 20 rem wide and leaves 2 rem of the page in view.
- Widths are kept in rem, so a chosen width follows the reader's font size.

## States and behaviour

The trigger, the shortcut and the handle act by the window's width:

| Where                             | A press on the trigger                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| At or above `dockAt`              | Docks or collapses it, the preference the frame remembers; over the content, docks it ("Keep sidebar open"). |
| Between the breakpoint and dockAt | Holds the rail open over the content, or closes it.                                                          |
| Below the breakpoint              | Opens its drawer, which the trigger inside it closes.                                                        |

- **Peeking**: a rail opens over the content when the pointer rests on it with no button pressed (mouse only), and with `hover-focus` when keyboard focus enters it. A press during the rest cancels it, so a quick click on an icon reaches what it started on. The column keeps its width, so Main doesn't move. A menu or popover opened from the sidebar keeps the state it had until it closes. After its trigger collapses it under the pointer it stays a rail until the pointer leaves.
- **Closing**: <kbd>Esc</kbd>, a press outside it and a link inside it (`closeOnNavigate`) close a peek, a held rail or a drawer; so does `useSidebar().dismiss()`, such as after a choice in a list. A docked sidebar stays.
- **Focus**: collapsing off canvas, or to a rail that hides the focused control, moves focus to the sidebar's trigger, or else to AppShell.Main. A drawer returns focus to its trigger after <kbd>Esc</kbd> or its backdrop, moves it to Main after a navigation, and when the window widens past the breakpoint gives it to the same control in the inline sidebar.
- **Without the frame**: in a Sidebar.Provider, or on its own, a sidebar is a static column, not sticky, with the same collapsing, rail, drawer and persistence. A trigger needs the provider (AppShell.Root, Sidebar.Provider, or its own Sidebar.Root around it), and controls the sidebar around it, else the start one. A Sidebar.Root that isn't one of AppShell.Root's own children, such as a settings page's sub-navigation in AppShell.Main, is on its own too: it keeps its own state and leaves the frame's sidebars, skip links and shortcut alone. Give it a Sidebar.Provider for a trigger outside it, and a Sidebar.Provider in a title-bar frame keeps its sidebars out of the title bar.
- **State attributes**: `data-state="expanded"` or `"collapsed"`, `data-collapsible`, `data-rail` while it shows icons only, `data-peek` while it shows over the content and `data-held` while its trigger holds it there.

## Content guidelines

- Give every NavList.Item an icon, so the rail can show it.
- Name the sidebar by its content: Main navigation, Directory, Filters.
- Adapt content that doesn't shrink to icons by itself with `useSidebar().isRail`, such as a list that shows avatars only, or a Create button that becomes an IconButton.

## Do and don't

### Do

- Put a SidebarTrigger for its side in the sidebar's header, or in the frame's header where the header runs across the window.
- Use `peek="hover"` when the rail's controls are named icon buttons people Tab through, so the layout doesn't change under the keyboard.
- Close a sidebar after a choice that leaves it with `useSidebar().dismiss()`.

### Don't

- Don't nest sidebars, or put two on one side of a frame.
- Don't hide the trigger of an off-canvas sidebar inside it: once collapsed it can't be reached.
- Don't restyle the sidebar's classes for its width; use `width`, `minWidth`, `maxWidth` and `resizable`.

## Accessibility

### Keyboard

| Key                                                 | Action                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger | Docks, collapses, holds or opens the sidebar, as the table above says.                                       |
| <kbd>Esc</kbd>                                      | Closes a peek, a held rail or the drawer, unless a popup inside takes it.                                    |
| <kbd>←</kbd>, <kbd>→</kbd> on the handle            | Narrows or widens a resizable sidebar by 1 rem, 4 rem with <kbd>Shift</kbd>, mirrored in right-to-left text. |
| <kbd>Home</kbd>, <kbd>End</kbd> on the handle       | Sets its smallest or largest width.                                                                          |
| <kbd>Enter</kbd> on the handle                      | Collapses or expands it.                                                                                     |
| The frame's shortcut                                | Toggles it, where AppShell.Root or Sidebar.Provider sets `shortcut`.                                         |

### envUI provides

- A `nav` (start) or `aside` (end) landmark named by `label`, a drawer named by it, and a skip link to it.
- A trigger that reports `aria-expanded`, `aria-controls` and the shortcut in `aria-keyshortcuts`, with its name and keys in a tooltip, and 44 px under a coarse pointer.
- A handle that is an APG window splitter: a `separator` with its width and bounds as its value, read as the width in rem (16 rem), or Collapsed, named by `resizeLabel` (Resize sidebar). On a sidebar that isn't resizable its value is Expanded or Collapsed, and it is named Collapse sidebar or Expand sidebar.
- A trigger that controls its sidebar from the server's markup on, and is hidden there already where its sidebar has nothing to toggle (`collapsible="none"` above the breakpoint, `mobile="none"` below it).
- Icon-only NavList items named by their labels in a rail, a drawer that traps focus, and focus that never stays on a hidden control.

### You provide

- The sidebar's `label`, an icon for each destination, and the selected destination.
- The labels in the application's language, through EnvUIProvider's `messages.appShell`.

## Examples

### Off canvas

Collapsed off canvas, the sidebar leaves the window; its trigger in the header brings it back.

```tsx example=Offcanvas

```

### At the end

AppShell.Aside is the page's region at the end, below the header, here resizable; `SidebarTrigger side="end"` opens and closes it.

```tsx example=EndSidebar

```

### Resizable

A resizable sidebar with its handle: drag it or use its keys; Enter or a click collapses it, and the frame remembers the width.

```tsx example=Resizable

```

### Groups

Groups with headings and an action; in the rail the headings hide and hairlines separate the groups.

```tsx example=Groups

```

### Without the frame

A settings page's sub-navigation in a Sidebar.Provider, with its trigger in the page's own header.

```tsx example=Standalone

```

## Changelog

- **1.0.0**: Sidebar.Root, Provider, Header, Content, Group, Footer and Handle, SidebarTrigger and useSidebar, which replace AppShell's `navigation`, `sidebarContent`, `resizable` and toggle props and `useSidebarCompact`.
