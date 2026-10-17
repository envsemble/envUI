---
title: AppShell
summary: The frame of a whole application, built from parts, with a header, sidebars, the main content and an aside, and the frame's published sizes.
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
  - topbar
  - header
  - app bar
  - skip link
  - title bar
  - window controls overlay
  - skip to content
  - AppShellSkeleton
  - loading frame
useWhen:
  - An application needs its frame, with a header with the page's title and actions, sidebars that collapse, and the page's content.
  - Content needs to stick below the frame's header, or to know which element scrolls (useAppShell).
  - The application's first load shows the frame before the data arrives.
  - An installed web app or desktop shell with sidebars draws its own title bar over the window (`titleBar`).
avoidWhen:
  - text: The sidebar's own parts, its trigger and its state.
    use: Sidebar
  - text: A window without sidebars, such as a start page, that draws its own title bar.
    use: WindowFrame
  - text: The column a page's content sits in.
    use: Page
  - text: Items people keep open beside the page, such as drafts.
    use: PanelDock
related:
  - sidebar
  - window-frame
  - page
  - page-header
  - nav-list
  - account-menu
components:
  - AppShell
  - useAppShell
  - readAppShellCookie
---

# AppShell

## Overview

AppShell is the frame of an application, made of parts: `AppShell.Root` lays out a header, a [Sidebar](../components/sidebar.md) at the start and another at the end, the main content and an aside in a grid that follows the text direction. The Root keeps the sidebars' state, remembers it, and below its breakpoint turns the sidebars into drawers their triggers open. The application owns what goes inside: routing, the selected destination and the page.

- **AppShell.Root**: the grid, the sidebars' state (`persist`, `breakpoint`, `shortcut`, `sidebarOpen`), how the frame scrolls and how its header spans.
- **AppShell.SkipLinks**: links before everything else that move focus past the frame.
- **AppShell.Header**: the banner, one row with start content, the title and actions.
- **AppShell.Main**: the page's `main` landmark.
- **AppShell.Aside**: a region beside Main for the page's supplementary content, such as an inspector.
- **useAppShell**: the element that scrolls and where sticky content sticks, inside AppShell.Root or WindowFrame.Root.
- **readAppShellCookie**: reads the remembered state on the server, so the first paint is already right.

```tsx example=SidebarFrame

```

## Anatomy

1. **Skip links** (`AppShell.SkipLinks`): Skip to content, then Skip to each sidebar in reach.
2. **Sidebar** (`Sidebar.Root`): at the start, and optionally at the end, with its header, content, footer and handle.
3. **Header** (`AppShell.Header`): `start`, such as a SidebarTrigger and the mark; the title (children), which truncates first; and `end`, the actions.
4. **Loading bar** (`loading`): page progress along the header's bottom edge, across the frame, named by `loadingLabel` (Loading page).
5. **Main** (`AppShell.Main`): the page, usually a [Page](../components/page.md); no padding of its own.
6. **Aside** (`AppShell.Aside`): at the end, below the header, named by `label`.

## Variants and sizes

| Prop                  | Values                           | Use for                                                                                                                                                 |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headerSpan`          | `main` (default)                 | The sidebars run the full height and the header sits beside them; a sidebar's header lines up with it, with one hairline.                               |
|                       | `full`                           | The header runs across the window and the sidebars sit below it, such as for a menubar and a picker beside the trigger.                                 |
| `scroll`              | `document` (default)             | The document scrolls under a sticky header; the sidebars stick.                                                                                         |
|                       | `main`                           | The frame fills its container (`100dvh`, or `--env-app-shell-block-size`) and Main scrolls, with the keyboard scrolling it as the document.             |
| `breakpoint`          | `sm`, `md` (default), `lg`, `xl` | Below 40, 48, 64 or 80 rem the sidebars are drawers; `md` also covers short landscape windows (32 rem tall and 54 rem wide).                            |
| `titleBar`            | `true`                           | The header is the window's title bar, in an app that draws its own (the Window Controls Overlay); Main scrolls below it. Meant for `headerSpan="full"`. |
| `header` `mobileOnly` | `true`                           | A phone's top bar: the header shows only below the breakpoint, with the triggers that open the drawers.                                                 |

- The header is `--env-app-shell-header-height` tall (3.25 rem; 2.625 rem in the compact scale; 3.25 rem under a coarse pointer, where its controls grow to 2.75 rem). It never wraps, which is what lets the frame publish its size from CSS.
- `dividers` (true) draws hairlines between the header, the sidebars and the content. `landmarks={false}` renders the parts without landmark roles, for a preview of a frame inside another page.
- AppShell.Aside resizes between `minWidth` (16 rem) and `maxWidth` (40 rem) with `resizable`. A frame has an end Sidebar.Root or an AppShell.Aside, not both.

## States and behaviour

- **Frame variables**: the Root publishes `--env-frame-header-block-size`, the header's size (0 without one), and `--env-frame-sticky-top`, where sticky content sticks: the header's size while the document scrolls, `0px` where Main scrolls under it. Sticky content uses `inset-block-start: var(--env-frame-sticky-top)`; a full-height region uses `calc(100dvh - var(--env-frame-header-block-size))`. While the document scrolls the Root also writes the measured header size on `<html>`, for content portaled out of the frame and for the document's scroll padding, which keeps focused elements and anchor targets below the header; the application's own scroll padding wins.
- **useAppShell**: `getScrollElement()` returns Main where it scrolls, else the document's scrolling element; `getStickyTop()` returns `--env-frame-sticky-top` in pixels, to scroll an element into view below the header without measuring it; `scroll` says which.
- **Persistence**: `persist="app.frame"` keeps each sidebar's docked preference and chosen width (in rem) in localStorage, read after hydration. `persist={{ key, storage: 'cookie' }}` keeps them in a cookie the server reads with `readAppShellCookie(cookieHeader, key)`, passed as `initialState`, so the server's markup and the first paint agree. Without `initialState` the frame reads either storage after hydration, so hydration never mismatches: a page rendered only in the browser reads it before its first paint, and a server-rendered one shows the defaults until then, so pass `initialState` there. Controlled props come first, then `initialState`, then storage, then `defaultSidebarOpen` and `defaultSidebarWidth`. Peeks, holds and drawers are never kept.
- **Shortcut**: `shortcut="mod+b"` (⌘B on Apple platforms, Ctrl+B elsewhere) toggles the start sidebar, or its drawer below the breakpoint; it is off by default, as Mod+B is Bold in editors, and it leaves text fields and editors alone. Per side: `shortcut={{ start: 'mod+b', end: 'mod+shift+b' }}`.
- **Below the breakpoint**: the sidebars render nothing inline, even before hydration, and their content opens in a drawer from their side; the header's title hides.
- **Title bar**: with `titleBar` the header takes the height of the title bar area the window reports, and at least `--env-title-bar-height` (2.5 rem, 2 rem in the compact scale); empty space drags the window, its controls stay clickable and are small, with buttons that set no variant ghost, and it leaves room for the window controls through `env(titlebar-area-*)`, as [WindowFrame](../components/window-frame.md)'s title bar does. A trigger in it keeps the centre line of a rail's icons below it, and beside a title bar a sidebar's header drags the window too. The frame scrolls Main, so `--env-frame-sticky-top` is `0px`.
- **Loading**: `loading` shows page progress along the header's bottom edge after a short delay, then completes.
- **Loading frame**: the same parts, with [NavList.Skeleton](../components/nav-list.md) in `Sidebar.Content` and the same `persist`, stand in for the frame on the first load inside a [LoadingState](../components/skeleton.md).
- **Motion**: the sidebars' widths animate after the first frame and never under a reduced-motion preference.

## Content guidelines

- Keep the header's title to the current page's name; it truncates first and hides on phones.
- Name each sidebar by its content, such as Main navigation or Directory; the name is its landmark's, its drawer's and its skip link's.
- Translate the strings through EnvUIProvider's `messages.appShell` where the interface is not in English.

## Do and don't

### Do

- Render AppShell.Root once, at the root of the application, with a `LinkProvider` so navigation stays on the client.
- Put AppShell.SkipLinks first, and a Page with a PageHeader in Main.
- Use `storage: 'cookie'` and `readAppShellCookie` in a server-rendered application, so a collapsed sidebar doesn't flash open.
- Read `--env-frame-sticky-top` or `getStickyTop()` rather than measuring the header.

### Don't

- Don't set `--env-frame-*` yourself or restyle the frame's classes; the frame sets them from its parts.
- Don't nest frames, or put both an end Sidebar.Root and an AppShell.Aside in one.
- Don't give Main padding; Page has it.

## Accessibility

### Keyboard

| Key                                                                                                                     | Action                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd> from the top of the page                                                                                 | Shows the skip links, the first tab stops; <kbd>Enter</kbd> moves focus to the region.                  |
| The shortcut, such as <kbd>Ctrl</kbd>+<kbd>B</kbd>                                                                      | Toggles the sidebar, or opens and closes its drawer, where the frame sets one.                          |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | With `scroll="main"` or `titleBar`, scroll Main as they would the document, unless a control uses them. |

The sidebars' keys are on the [Sidebar](../components/sidebar.md) page.

### envUI provides

- A `header` (banner), a `nav` or `aside` per sidebar named by its `label`, a `main` and an `aside` for AppShell.Aside, with skip links to each region in reach.
- Scroll padding that keeps focused elements below a sticky header, and Main as the focus target after a navigation in a drawer.
- A loading bar named by `loadingLabel`, and a frame that renders the remembered state on the server without a flash.

### You provide

- The sidebars' labels, the page's heading inside Main, and the destinations and the selected one.
- The labels in the application's language.

## Examples

### A header across the window

With `headerSpan="full"` the header runs across the window with the trigger at its start, in line with a rail below it; this sidebar collapses off canvas.

```tsx example=HeaderAcross

```

### A title bar

With `titleBar` and `headerSpan="full"`, the header is the window's title bar: the trigger and a menubar at its start, the title and an action, all small, and the page scrolling below it.

```tsx example=TitleBarFrame

```

### Two sidebars

A start and an end sidebar, each with its own trigger, state and rail; content adapts to the rail with `useSidebar('end').isRail`.

```tsx example=TwoSidebars

```

### The first load

The same parts with NavList.Skeleton and the same `persist` key stand in for the frame in a LoadingState until the application's data arrives.

```tsx example=LoadingFrame

```

## Changelog

- **1.0.0**: AppShell is made of parts: `AppShell.Root`, `SkipLinks`, `Header`, `Main` and `Aside`, with [Sidebar](../components/sidebar.md), SidebarTrigger and useSidebar for the sidebars, per side. AppShellSkeleton is gone: the same parts with NavList.Skeleton make the loading frame. The frame publishes `--env-frame-header-block-size` and `--env-frame-sticky-top`, which replace `--env-app-topbar-block-size` and `--env-app-sticky-top`; `useAppShell().getStickyTop()` reads the second, and `closeNarrowSidebar` is `useSidebar().dismiss()`. Persistence keeps both sides in one entry, in localStorage or a cookie that `readAppShellCookie` reads on the server. The phone breakpoint moves from 40 to 48 rem. WindowFrame has a page of its own.
- **0.5.0**: `titleBar` on AppShell and AppShellSkeleton, TitleBar and WindowFrame; `topbar="full"`, `resizable` and `sidebarContent`; a drawer sidebar on narrow windows.
- **0.4.0**: The sidebar fits its widest content between 12 and 20 rem; `loading` shows page progress along the topbar.
- **0.3.0**: AppShell and AppShellSkeleton.
