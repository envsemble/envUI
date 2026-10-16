---
title: AppShell
summary: The frame of a whole application, with a topbar, a collapsible navigation sidebar and the content area, or a window title bar.
status: beta
since: 0.3.0
category: Navigation
aliases:
  - AppFrame
  - app frame
  - frame
  - layout
  - app layout
  - shell
  - sidebar
  - collapsible sidebar
  - sidebar toggle
  - hamburger
  - topbar
  - header
  - app bar
  - title bar
  - window frame
  - TitleBar
  - WindowFrame
useWhen:
  - An application needs its frame, with a topbar with the page's title and actions, a navigation sidebar that collapses to icons, and the page's content.
  - An installed web app or desktop shell draws its own title bar over the window (`titleBar`, TitleBar).
  - The application's first load shows the frame before the data arrives (AppShellSkeleton).
avoidWhen:
  - text: The destinations inside the sidebar.
    use: NavList
  - text: A panel that opens beside the page for one item.
    use: Dialog
  - text: Items people keep open beside the page, such as drafts.
    use: PanelDock
  - text: A region of a page with a fill and padding.
    use: Surface
related:
  - nav-list
  - menu
  - menubar
  - avatar
  - skeleton
  - setup
components:
  - AppShell
  - AppShellSkeleton
  - useAppShell
  - TitleBar
  - WindowFrame
---

# AppShell

## Overview

AppShell is the frame of an application: a topbar with the context, the page's title and its actions, a navigation sidebar that collapses to icons and opens over the content on narrow windows, and the content area. It owns the frame's behaviour; the application owns what goes inside: routing, the selected destination and the page.

The family:

- **AppShellSkeleton** is the same frame with placeholders, for the first load.
- **useAppShell** gives content inside the shell `closeNarrowSidebar` and `getScrollElement`.
- **TitleBar** is the shell's title bar on its own, for a start page or a simple window, and **WindowFrame** puts it above content that scrolls below it.

AppShell will be rebuilt from composable parts; this page describes the current API.

```tsx example=ProductShell

```

## Anatomy

1. **Toggle** (`brand`): the application's mark, which turns into the sidebar icon while the sidebar's area is hovered; it collapses and expands the sidebar, named by `collapseLabel` and `expandLabel`.
2. **Context** (`context`): beside the toggle, such as an OrganizationSwitcher; in the split topbar it sits above the sidebar.
3. **Title** (`title`) and **actions** (`actions`): the page's name, and controls at the end, such as an account menu.
4. **Loading bar** (`loading`): page progress along the topbar's bottom edge, named by `loadingLabel` (Loading page).
5. **Sidebar** (`navigation`, `navigationLabel`): the navigation, NavList.Items in a landmark, with `sidebarContent` below it, such as a Tree.
6. **Resize handle** (`resizable`): the sidebar's inline-end edge, named by `resizeLabel` (Resize sidebar).
7. **Content** (`children`): the page, in a `main` landmark.

## Variants and sizes

| Topbar           | Use for                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `topbar="split"` | Most applications: the context sits above the sidebar, as wide as it, beside the page's title and actions. The default.     |
| `topbar="full"`  | One row across the window, independent of the sidebar, for a context that holds more, such as a menubar and a picker.       |
| `titleBar`       | The topbar is the window's title bar, in apps that draw their own (the Window Controls Overlay); meant for the full topbar. |

- Expanded, the sidebar fits its widest content between 12 and 20 rem; collapsed, it is one control plus its insets wide, showing only the icons of NavList.Items.
- With `resizable`, people choose the expanded width between `sidebarMinWidth` (12 rem) and `sidebarMaxWidth` (32 rem); `sidebarWidth` and `onSidebarWidthChange` control it.
- On narrow windows (40 rem wide, or 54 rem wide and 32 rem tall) the sidebar opens over the content as a drawer at least 20 rem wide, and the title is hidden.
- A title bar is at least `--title-bar-height` tall (2.5 rem, 3 rem on coarse pointers), and its controls are compact. `dividers` (true) draws hairlines between the topbar, the sidebar and the content.

## States and behaviour

- **Collapsing**: the toggle collapses and expands the sidebar on wide windows; `collapsed`, `defaultCollapsed` and `onCollapsedChange` control it, and `storageKey` keeps the choice and the width in local storage. A collapsed sidebar expands over the content while the pointer is over it or the area above it, while it holds keyboard focus, and while a popup opened from it is open.
- **Narrow windows**: the toggle opens the sidebar over the content; it closes after navigation, with <kbd>Esc</kbd> and on the backdrop. Content inside the shell closes it with `useAppShell().closeNarrowSidebar()`.
- **Collapsed items**: NavList.Items in a collapsed sidebar show their icons, and their text as their name and as a tooltip on hover and keyboard focus. `sidebarContent` hides while the sidebar is compact.
- **Resizing**: drag the sidebar's edge, or focus it and use the arrow keys. A collapsed or narrow sidebar has no handle.
- **Scrolling**: without `titleBar` the document scrolls, with scroll padding as tall as the topbar, so focused elements and anchors land below it; with `titleBar` the content area scrolls below the title bar, and the keyboard scrolls it as it would the document. `useAppShell().getScrollElement()` returns the element that scrolls the page's content; sticky content uses `inset-block-start: var(--app-sticky-top)`, and `--topbar-height` holds the topbar's height.
- **Title bar**: empty space drags the window, controls stay clickable, and the bar leaves room for the window controls through `env(titlebar-area-*)`; in an ordinary browser window it spans the full width.
- **Loading frame**: AppShellSkeleton with the same `brand`, `storageKey`, `topbar`, `titleBar` and resize bounds starts in the same place, and announces its `label` (Loading).
- **TitleBar and WindowFrame**: TitleBar lays out `start`, its centred `children` and `end`; WindowFrame fills the window with it on top and its content scrolling below, with the same keyboard scrolling as a title-bar shell.

## Content guidelines

- Name the sidebar with `navigationLabel`, such as "Main navigation".
- Keep the title to the current page's name; the topbar truncates it first.
- Translate `expandLabel`, `collapseLabel`, `loadingLabel` and `resizeLabel` where the interface is not in English.

## Do and don't

### Do

- Render AppShell once, at the root of the application, with a `LinkProvider` so navigation stays on the client.
- Give every NavList.Item an icon, so the collapsed sidebar can show it.
- Use the same `storageKey` and `brand` on AppShellSkeleton as on the AppShell it precedes.

### Don't

- Don't lay out the page inside the shell with fixed heights; give `sidebarContent` `block-size: 100%` and let it scroll.
- Don't put a sticky or fixed TitleBar above a scrolling document; use WindowFrame.
- Don't nest shells.

## Accessibility

### Keyboard

| Key                                                                                                                     | Action                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                                                         | Moves through the toggle, the context, the sidebar, the resize handle, the topbar's actions and the content. |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the toggle                                                                      | Collapses or expands the sidebar, or opens it on a narrow window.                                            |
| <kbd>Esc</kbd>                                                                                                          | Closes the sidebar that is open over the content on a narrow window.                                         |
| <kbd>←</kbd>, <kbd>→</kbd> on the resize handle                                                                         | Narrows or widens the sidebar by 16 px, and by 48 px with <kbd>Shift</kbd>.                                  |
| <kbd>Home</kbd>, <kbd>End</kbd> on the resize handle                                                                    | Sets the sidebar to its smallest or largest width.                                                           |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | In a title-bar shell or a WindowFrame, scroll the content as they would the document.                        |

### envUI provides

- A `header`, an `aside` holding a `nav` named by `navigationLabel`, and a `main` landmark.
- A toggle named by `expandLabel` or `collapseLabel`, and a resize handle, a `separator` named by `resizeLabel` with the width and its bounds as its value.
- Collapsed NavList.Items named by their text, with tooltips, and focus that keeps a collapsed sidebar expanded.
- A narrow sidebar that closes with <kbd>Esc</kbd>, a loading bar and a loading frame that announce their labels, and scroll padding that keeps focused elements clear of the topbar.

### You provide

- `navigationLabel`, the destinations and the selected one.
- The page's own heading in the content.
- The labels in the application's language.

## Examples

### A title bar

With `topbar="full"` and `titleBar`, the topbar is one row across the window that drags it: the mark, a menubar and a back button, the title and the actions.

```tsx example=TitleBarShell

```

### A start page window

TitleBar without the shell, inside a WindowFrame whose content scrolls below it.

```tsx example=StartPageWindow

```

### The first load

AppShellSkeleton shows the frame with placeholders until the application's data arrives.

```tsx example=LoadingFrame

```

## Changelog

- **1.0.0**: `LoadingBar` and `useSidebarCompact` are internal: `loading` and `loadingLabel` show page progress, and `collapsed` and `onCollapsedChange` keep the sidebar's state.
- **0.5.0**: `titleBar` on AppShell and AppShellSkeleton, TitleBar and WindowFrame; `topbar="full"`, `resizable` and `sidebarContent`; a drawer sidebar on narrow windows.
- **0.4.0**: The sidebar fits its widest content between 12 and 20 rem; `loading` shows page progress along the topbar.
- **0.3.0**: AppShell and AppShellSkeleton.
