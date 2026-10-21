---
title: App frame
summary: The application's frame, a Scaffold with a top bar of the name, search and the account menu, the navigation in the form that fits the window, and the page people are on.
status: beta
since: 1.0.0
frame: none
aliases:
  - app frame
  - application frame
  - app layout
  - AppShell
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
  - Scaffold
  - TopBar
  - NavList
  - Button
  - Row
  - Column
  - SearchTrigger
  - CommandPalette
  - Menu
  - AvatarButton
  - Avatar
  - ThemeRadioGroup
  - Page
  - PageHeader
  - EmptyState
  - Text
related:
  - scaffold
  - top-bar
  - nav-list
  - account-menu
  - command-palette
---

# App frame

## Overview

The frame every page of an application sits in, and the reference for building one: a [Scaffold](../components/scaffold.md) whose top bar holds the application's name, search and the account menu, whose navigation shows the destinations in the form that fits the window, and whose body holds the page. Start from it for any application with a handful of destinations; render it once, at the application's root, around the router's outlet. The other templates on `frame: app` pages, such as the [index page](index-page.md), are the pages that go inside it. Set up the providers at the application's root as [setup](../setup.md) says, since the template brings none.

```tsx template=AppFrame

```

## Anatomy

1. **Frame:** a Scaffold at the root: it fills the window, and its body scrolls under the top bar.
2. **Skip links:** the Scaffold's, the first tab stops: Skip to content and Skip to navigation.
3. **Top bar:** a [TopBar](../components/top-bar.md) with the application's name, Northwind, as its title, and a [SearchTrigger](../components/search-trigger.md) `iconOnly` and the [account menu](../patterns/account-menu.md) in its actions.
4. **Navigation:** the same destinations (Home, Projects, Documents, Team, then Settings under Workspace) in each form the Scaffold shows: a bar of buttons at the bottom of a phone, and a [NavList](../components/nav-list.md) in a `nav` named "Primary" at the start of a wider window.
5. **Body:** the page: `children`, or without them a sample [Page](../components/page.md) with a [PageHeader](../components/page-header.md) and an [EmptyState](../components/empty-state.md).
6. **Search:** a [CommandPalette](../components/command-palette.md) the search trigger opens, with the destinations and the projects.

## States and behaviour

- **Navigation by width:** the Scaffold shows the bar in a compact window, below 37.5 rem, and the drawer from medium up, where no rail is given; nothing is measured.
- **Search:** Ctrl+K, or ⌘K on Apple platforms, presses the visible search trigger and opens the palette; Enter on a result goes to it.
- **Current page:** `current` names the current route, and the destination it belongs to is marked, so it stays marked on the pages under it, such as a project's page under Projects.
- **Scrolling:** the body scrolls, not the document; restore and read scroll positions on the Scaffold's `bodyRef`.
- **Widths:** on a desktop the navigation is at the start; on a tablet in portrait, 834 px, it stays there; on a phone it is a bar at the bottom and the page takes the whole width.

### Connect your data

- Render the frame once, at the root, with the router's outlet as its `children`, and pass the current route as `current`; replace the destinations' `routes` with your own.
- Its links are plain paths that route through the application's `LinkProvider` ([setup](../setup.md)); replace `navigate`, which the search uses, with your router's.
- Replace `user` with the signed-in person, `projects` with what search finds, and the name with your application's.

## Content guidelines

- Name destinations with one or two nouns, the same words as the pages' titles: "Projects" in the navigation, "Projects" as the page's heading.
- Name the application in the top bar, in words.
- Keep the account menu to the person's own things: account settings, the theme and Sign out, never "Log out" ([Buttons and actions](../foundations/content.md#buttons-and-actions)).

## Do and don't

### Do

- Keep one primary navigation, the same destinations in every form, and mark the current destination.
- Put the page's own actions in its PageHeader, not in the frame.
- Keep the group labels short, and group only where it helps people find a destination.

### Don't

- Don't put a second navigation in the top bar.
- Don't nest a frame in the body, or render the Scaffold once per page.
- Don't choose the navigation's form in script from the window's width; the Scaffold does it in CSS.

## Accessibility

### Landmarks and headings

- A `banner` for the top bar region, a `nav` named "Primary" for the navigation form that shows, and a `main` for the body.
- The skip links come first: Skip to content moves focus to the body, and Skip to navigation to the navigation form that shows.
- The frame has no heading of its own; the page in the body brings its `h1`, in its PageHeader.

### envUI provides

- The landmarks, the skip links, and only the navigation form that shows in the accessibility tree.
- The search trigger's shortcut, announced as `aria-keyshortcuts`, and the palette's combobox and listbox.
- The account menu's roles and focus handling, from Menu.

### You provide

- The navigation's label, the destinations and which one is current, marked with `aria-current="page"`.
- The page's `h1` inside the body, and moving focus to the body or its heading after a navigation, with `document.title` updated.
- The labels in the application's language.
