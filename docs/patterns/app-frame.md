---
title: App frame
summary: Frame an application's screens with a Scaffold, a TopBar and the same destinations as a Bar, a Rail or a Drawer, by the width of the window.
status: beta
since: 1.0.0
intent: Frame the application
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
  - A handful of destinations, each with a page
avoidWhen:
  - text: A window that draws its own title bar, in an installed application.
    see: window-frame
  - text: Moving between views of one object, such as its overview and its activity.
    use: Tabs
  - text: Choosing between a bar, a rail and a drawer.
    see: navigation
composes:
  - Scaffold
  - TopBar
  - Bar
  - Rail
  - Drawer
  - Sheet
  - Panes
  - Tooltip
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
---

# App frame

## Overview

The app frame is one [Scaffold](../components/scaffold.md) at the application's root, around the router's outlet: a [TopBar](../components/top-bar.md) with the name, [search](search-trigger.md) and the [account menu](account-menu.md), the navigation, and the page in the body.

```tsx example=AppFrame stage=shaded

```

## Variants

### A menu on phones

With many destinations, or none with icons, a phone shows no bar: a menu button in the top bar opens the same Drawer in a [Sheet](../components/sheet.md).

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

### One list of destinations

The bar, the rail and the drawer show the same destinations, with the current one marked from the router.

### The frame chooses the form

The Scaffold chooses the bar, the rail or the drawer from its own width; don't choose it in script from the window's width.

### Content

Name each destination with one or two nouns, the words of its page's title. Keep the account menu to the person's own things, ending with Sign out.

## Anatomy

```tsx anatomy=AppFrameAnatomy stage=shaded

```

1. **Top bar** (`env-top-bar`)
2. **Search** (`env-top-bar-actions > env-icon-button`)
3. **Account menu** (`env-avatar-button`)
4. **Navigation** (`env-rail`)
5. **Page header** (`env-page-header`)
6. **Page** (`env-page`)

Not shown: the [CommandPalette](../components/command-palette.md) the search opens, as the [search trigger](search-trigger.md) describes.

## Adapting to width

A bar on a narrow window, a rail on a medium one and a drawer from a wide one.

```tsx example=FrameByWidth stage=shaded widths="24 44 60"

```

## Accessibility

<kbd>Tab</kbd> reaches the skip links first, then the top bar, the navigation that shows and the body. After a destination opens its page, move focus to the body or the page's heading.

### envUI provides

- The banner and main landmarks, the skip links, and only the form that shows in the accessibility tree.
- A `nav` per form, with `aria-current="page"` on the current destination.

### You provide

- Which destination is current, and `document.title` for each page.
- The page's one `h1`, in its PageHeader.

## In code

### Usage

Render one Scaffold at the application's root, around the router's outlet. Its `topBar` is a TopBar with the application's `title` and, in `actions`, the search IconButton in a Tooltip and the account menu's AvatarButton. Its `navigation` takes `bar`, `rail` and `drawer`, a Bar, a Rail and a Drawer given the same array of destinations, with `current` set from the router. The router's page, a Page with its PageHeader, is the Scaffold's children.

```tsx source=AppFrame

```

#### A menu on phones

`forms={{ compact: 'none', medium: 'drawer' }}` shows no navigation on a compact window and the drawer from medium. A menu IconButton in the TopBar's `start` opens a Sheet with `side="start"` holding the same Drawer, which closes the sheet when a destination is chosen.

```tsx source=MenuOnPhones

```

#### Details beside the page

`Panes.Root` with `behavior="supporting"` fills the Scaffold's body: `Panes.Main` holds the page, with a `Panes.Trigger` that opens `Panes.Supporting`, and each pane scrolls on its own.

#### By width

The Scaffold shows the bar on a `compact` window, the rail on a `medium` one and the drawer from `expanded`, by its own container's width; `forms` changes the form for a window class. Don't choose the form in script from the window's width.

### Composition

The parts are the top bar, `env-top-bar`, the search button, `env-top-bar-actions > env-icon-button`, the account menu's `env-avatar-button`, the rail, `env-rail`, and the page, `env-page`, with its `env-page-header`. Search opens a CommandPalette, as the [search trigger](search-trigger.md) shows, and the account menu is the [account menu](account-menu.md) pattern.

## Changelog

- **1.0.0**: The app frame is a pattern built from Scaffold, TopBar and the navigation forms, in place of AppShell and the app frame template. The page is on the figure template.
