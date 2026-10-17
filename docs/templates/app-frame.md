---
title: App frame with sidebar
summary: The application's frame, with a sidebar of destinations that collapses to a rail, search, the account menu and a phone's top bar, around the page people are on.
status: beta
since: 1.0.0
frame: none
aliases:
  - app frame
  - application frame
  - app layout
  - sidebar layout
  - shell
  - navigation frame
  - main navigation
useWhen:
  - An application has a handful of destinations people move between, and a page for each.
  - The frame needs search, the account menu and a phone layout without building them.
avoidWhen:
  - text: A screen people see before they sign in, or when the application fails to load.
    see: sign-in-page
  - text: Moving between views of one object, such as its overview and its activity.
    use: Tabs
composes:
  - AppShell
  - Sidebar
  - SidebarTrigger
  - NavList
  - SearchTrigger
  - CommandPalette
  - AccountMenu
  - Menu
  - Page
  - PageHeader
  - EmptyState
  - Text
related:
  - app-shell
  - sidebar
  - nav-list
  - account-menu
  - command-palette
---

# App frame with sidebar

## Overview

The frame every page of an application sits in: a sidebar at the start with the application's name, search and its destinations, the account menu at its foot, and the page in the main region. The sidebar collapses to a rail of icons, and on a phone it becomes a drawer that a top bar opens. Start from it for any application with a handful of destinations; render it once, at the application's root, around the router's outlet. The other templates on `frame: app` pages, such as the [index page](index-page.md), are the pages that go inside it. Set up the providers at the application's root as [setup](../setup.md) says, since the template brings none.

```tsx template=AppFrame

```

## Anatomy

1. **Frame:** [AppShell.Root](../components/app-shell.md) with `breakpoint="md"` and `persist="app.frame"`: the document scrolls, the sidebar sticks, and its docked or rail state is remembered on the device.
2. **Skip links:** AppShell.SkipLinks, the first tab stops: Skip to content and Skip to Primary.
3. **Sidebar:** a [Sidebar.Root](../components/sidebar.md) labelled "Primary", `collapsible="rail"`:
   - **Header:** a [SidebarTrigger](../components/sidebar.md) with a generic icon as its `mark`, and the application's name, Northwind;
   - **Content:** a [SearchTrigger](../components/search-trigger.md) `fullWidth`, then a [NavList](../components/nav-list.md) of the destinations (Home, Projects, Documents, Team), then a `Sidebar.Group` "Workspace" with Settings;
   - **Footer:** an [AccountMenu](../components/account-menu.md) with Account settings, the theme submenu and Sign out.
4. **Top bar:** AppShell.Header with `mobileOnly`, only below the breakpoint: a SidebarTrigger and the name at the start, a SearchTrigger `iconOnly` and the account menu at the end.
5. **Main:** AppShell.Main, which holds the page: `children`, or without them a sample [Page](../components/page.md) with a [PageHeader](../components/page-header.md) and an [EmptyState](../components/empty-state.md).
6. **Search:** a [CommandPalette](../components/command-palette.md) both search triggers open, with the destinations and the projects.

## States and behaviour

- **Expanded:** the sidebar is docked open, as wide as its content between 12 and 20 rem, and Main fills the rest.
- **Rail:** the trigger collapses the sidebar to its icons, with the names as tooltips. Resting the pointer on the rail, or moving focus into it, opens it over the page without moving it; the trigger then keeps it open. The frame remembers the choice.
- **Phone:** below 48 rem the sidebar renders nothing inline; the top bar's trigger opens it as a drawer from the start, and choosing a destination closes it and moves focus to Main.
- **Search:** Ctrl+K, or ⌘K on Apple platforms, presses the visible search trigger and opens the palette; Enter on a result goes to it.
- **Current page:** `current` names the current route, and the destination it belongs to is selected, so it stays selected on the pages under it, such as a project's page under Projects.
- **Shortcut:** none by default. Add `shortcut="mod+b"` to AppShell.Root to toggle the sidebar with Ctrl+B or ⌘B, unless the application has a text editor, where Mod+B is Bold.
- **Widths:** on a desktop the sidebar is docked and the top bar hidden; on a tablet in portrait, 834 px, it stays a sidebar; on a phone the top bar shows and the page takes the whole width.

### Connect your data

- Render the frame once, at the root, with the router's outlet as its `children`, and pass the current route as `current`; replace the destinations' `routes` with your own.
- Its links are plain paths that route through the application's `LinkProvider` ([setup](../setup.md)); replace `navigate`, which the search uses, with your router's.
- Replace `user` with the signed-in person, `projects` with what search finds, and the name and mark with your application's.
- For a server-rendered application, pass `persist={{ key: 'app.frame', storage: 'cookie' }}` and the state `readAppShellCookie` reads, so a collapsed sidebar doesn't flash open ([AppShell](../components/app-shell.md)).

## Content guidelines

- Name destinations with one or two nouns, the same words as the pages' titles: "Projects" in the sidebar, "Projects" as the page's heading.
- Name the application in the sidebar's header and the top bar, in words; the mark is a generic icon, not a logo.
- Keep the account menu to the person's own things: account settings, the theme and Sign out, never "Log out" ([Buttons and actions](../foundations/content.md#buttons-and-actions)).

## Do and don't

### Do

- Keep one primary navigation, in the sidebar, and mark the current destination.
- Put the page's own actions in its PageHeader, not in the frame.
- Keep the group labels short, and group only where it helps people find a destination.

### Don't

- Don't put a second navigation in the top bar; on a phone it holds the trigger, search and the account menu.
- Don't nest a frame in Main, or render AppShell.Root once per page.
- Don't turn the shortcut on in an application with a text editor.

## Accessibility

### Landmarks and headings

- A `nav` landmark named "Primary" for the sidebar and its drawer, a `main` for the page, and a `banner` for the top bar only while it shows, on a phone.
- The skip links come first: Skip to content moves focus to Main, and Skip to Primary to the sidebar.
- The frame has no heading of its own; the page in Main brings its `h1`, in its PageHeader.

### envUI provides

- The landmarks, the skip links, the drawer's focus handling and the rail's tooltips and peek on focus.
- `aria-current="page"` on the selected destination, and the trigger's name and state for each width: collapse or expand, keep open, or open the drawer.
- The search triggers' shortcut, announced as `aria-keyshortcuts`, and the palette's combobox and listbox.

### You provide

- The sidebar's label, the destinations and which one is current.
- The page's `h1` inside Main, and moving focus to Main or its heading after a navigation, with `document.title` updated.
- The labels in the application's language.
