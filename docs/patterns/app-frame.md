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

The app frame is one [Scaffold](../components/scaffold.md) at the application's root, around the router's outlet: a [TopBar](../components/top-bar.md) with the name, search and the [account menu](account-menu.md), one array of destinations, and the page in the body.

```tsx example=AppFrame stage=shaded

```

## Variants

### A menu on phones

With many destinations, or none with icons, `forms={{ compact: 'none' }}` hides the bar, and a menu button in the top bar opens the same Drawer in a [Sheet](../components/sheet.md).

```tsx example=MenuOnPhones stage=shaded

```

### Details beside the page

Side content that is not navigation goes in a supporting pane of [Panes](../components/panes.md), in the body.

```tsx example=WithDetails stage=shaded

```

## When to use

```tsx do=DestinationsInNavigation stage=shaded caption="Every destination in the navigation, and the page's own action in its header."

```

```tsx dont=DestinationsInTopBar stage=shaded caption="More destinations in the top bar: people look for them in two places."

```

- Pass the same array to the Bar, the Rail and the Drawer, and mark the current one from the router.
- Let the Scaffold choose the form; don't choose it in script from the window's width.

### Content

- Name each destination with one or two nouns, the words of its page's title.
- Keep the account menu to the person's own things, ending with Sign out.

## Anatomy

```tsx anatomy=AppFrameAnatomy stage=shaded

```

1. **Top bar** (`env-top-bar`)
2. **Search** (`env-search-trigger`)
3. **Account menu** (`env-avatar-button`)
4. **Navigation** (`env-rail`)
5. **Page header** (`env-page-header`)
6. **Page** (`env-page`)

Not shown: the [CommandPalette](../components/command-palette.md) the search opens.

## Adapting to width

The bar on a compact width, the rail on a medium one and the drawer from expanded, from the one array.

```tsx example=FrameByWidth stage=shaded widths="24 44 60"

```

## Accessibility

Tab reaches the skip links first, then the top bar, the navigation that shows and the body. After a destination opens its page, move focus to the body or the page's heading.

### envUI provides

- The banner and main landmarks, the skip links, and only the form that shows in the accessibility tree.
- A `nav` per form, with `aria-current="page"` on the current destination.

### You provide

- Which destination is current, and `document.title` for each page.
- The page's one `h1`, in its PageHeader.

## Changelog

- **1.0.0**: The app frame is a pattern built from Scaffold, TopBar and the navigation forms, in place of AppShell and the app frame template. The page is on the figure template.
