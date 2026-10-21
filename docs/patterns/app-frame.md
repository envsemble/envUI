---
title: App frame
summary: Frame an application's screens with a Scaffold, a TopBar and the same destinations as a Bar, a Rail or a Drawer, by the width of the window.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - app frame
  - application frame
  - app layout
  - AppShell
  - app shell
  - shell
  - sidebar layout
  - main navigation
useWhen:
  - An application has a handful of destinations people move between, and a page for each.
avoidWhen:
  - text: A window that draws its own title bar, in an installed application.
    see: window-frame
  - text: Moving between views of one object, such as its overview and its activity.
    use: Tabs
composes:
  - Scaffold
  - TopBar
  - Bar
  - Rail
  - Drawer
  - Sheet
  - Panes
  - SearchTrigger
  - CommandPalette
  - Menu
  - AvatarButton
  - Avatar
  - ThemeRadioGroup
  - Page
  - PageHeader
  - EmptyState
  - IconButton
  - Button
  - Row
  - Column
  - Text
related:
  - scaffold
  - top-bar
  - drawer
  - navigation
  - account-menu
---

# App frame

## Overview

Use this pattern to frame every screen of an application: a [Scaffold](../components/scaffold.md) with a [TopBar](../components/top-bar.md) of the name, search and the [account menu](account-menu.md), one array of destinations that the Scaffold shows as a [Bar](../components/bar.md) on a phone, a [Rail](../components/rail.md) on a tablet and a [Drawer](../components/drawer.md) from expanded, and the page in its body. Render it once, at the application's root, around the router's outlet. Narrow the window to see the forms change.

```tsx example=AppFrame

```

## Anatomy

1. **Frame:** a Scaffold at the root; its body scrolls under the top bar, and its skip links come first.
2. **Top bar:** a TopBar with the application's name as its `title`, and a SearchTrigger `iconOnly` and the account menu in its `actions`.
3. **Navigation:** one array of destinations, `{ label, icon, href, current }`, given to `<Bar>`, `<Rail>` and `<Drawer>` in the Scaffold's `navigation`; a `group` heads a run of them in the Drawer.
4. **Body:** the page, a [Page](../components/page.md) with its [PageHeader](../components/page-header.md), or [Panes](../components/panes.md) for side content.
5. **Search:** a [CommandPalette](../components/command-palette.md) the search trigger opens.

## States and behaviour

- **By width:** the Scaffold shows the Bar below 37.5 rem of its own width, the Rail to 52.5 rem and the Drawer from there, in CSS; `forms` changes them.
- **Current page:** mark one destination `current` from the router, on every form at once.
- **Menu on phones:** with many destinations or none with icons, set `forms={{ compact: 'none' }}` and open the same Drawer in a [Sheet](../components/sheet.md) from a menu button in the top bar.

## Content guidelines

- Name destinations with one or two nouns, the words of the pages' titles: "Projects" in the navigation and as the page's heading.
- Keep the account menu to the person's own things, and say "Sign out" ([content](../foundations/content.md#buttons-and-actions)).

## Do and don't

### Do

- Pass the same destinations to every form, so people find them at every width.
- Put the page's own actions in its PageHeader.

### Don't

- Don't choose the form in script from the window's width; the Scaffold does it.
- Don't put a second navigation in the top bar.

## Accessibility

### Focus and keyboard

Tab reaches the skip links first, Skip to content and Skip to navigation, then the top bar, the navigation form that shows, and the body. After a destination opens its page, move focus to the body or the page's heading.

### envUI provides

- The banner and main landmarks, the skip links, and only the form that shows in the accessibility tree.
- A `nav` landmark per form, with `aria-current="page"` on the current destination.

### You provide

- The destinations and which one is current, and `document.title` for each page.
- The page's one `h1`, in its PageHeader.

## Examples

### A menu on phones

A guide's chapters, without icons: a Drawer from medium, and the same Drawer in a Sheet from the top bar's menu button on a phone.

```tsx example=MenuOnPhones

```

### Details beside the page

Side content that is not navigation goes in a supporting pane of Panes, in the body.

```tsx example=WithDetails

```

## Changelog

- **1.0.0**: The app frame is a pattern built from Scaffold, TopBar and the navigation forms, in place of AppShell and the app frame template.
