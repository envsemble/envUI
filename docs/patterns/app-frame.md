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
  - WindowFrame
  - window frame
  - title bar
  - Window Controls Overlay
  - installed app
  - desktop app
useWhen:
  - A handful of destinations, each with a page
  - An installed app that draws its own title bar
avoidWhen:
  - text: Moving between views of one object, such as its overview and its activity.
    use: Tabs
  - text: Choosing between a bar, a rail and a drawer by the window's width.
    use: Scaffold
  - text: A page's own title and actions.
    use: PageHeader
composes:
  - Scaffold
  - TopBar
  - Bar
  - Rail
  - Drawer
  - Sheet
  - Panes
  - Menubar
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

The app frame is one [Scaffold](../components/scaffold.md) at the application's root, around the router's outlet: a [TopBar](../components/top-bar.md) with the name, [search](../components/command-palette.md#opening-it-the-button-and-the-shortcut) and the [account menu](account-and-organizations.md), the navigation, and the page in the body.

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

### An installed app's window

An installed app that draws its own title bar runs it across the whole window, above the navigation, with a [Menubar](../components/menubar.md) at its start where the app has one. Only the body scrolls below it, so the window's controls never cover a scrollbar.

```tsx example=InstalledWindow stage=shaded

```

## When to use

```tsx do=DestinationsInNavigation stage=shaded caption="Every destination in the navigation, and the page's own action in its header."

```

```tsx dont=DestinationsInTopBar stage=shaded caption="More destinations in the top bar: people look for them in two places."

```

### Content

Name each destination with one or two nouns, the words of its page's title. In an installed app, title the bar as the window's title would read, the document's or the application's name, and order the menubar's menus as the platform does: File, Edit, View.

## Anatomy

```tsx anatomy=AppFrameAnatomy stage=shaded

```

1. **Top bar** (`env-top-bar`)
2. **Search** (`env-top-bar-actions > env-icon-button`)
3. **Account menu** (`env-avatar-button`)
4. **Navigation** (`env-rail`)
5. **Page header** (`env-page-header`)
6. **Page** (`env-page`)

Not shown: the [CommandPalette](../components/command-palette.md) the search opens.

## Accessibility

After a destination opens its page, move focus to the body or the page's heading.

### envUI provides

- The banner and main landmarks, the skip links, and only the form that shows in the accessibility tree.
- A `nav` per form, with `aria-current="page"` on the current destination.
- In an installed app's title bar, controls that stay clickable where the window drags.

### You provide

- Which destination is current, and `document.title` for each page, also in an installed app's window.
- The page's one `h1`, in its PageHeader.
- Names for icon-only controls in the title bar.

## In code

### Usage

Render one Scaffold at the application's root, around the router's outlet. Its `topBar` is a TopBar with the application's `title` and, in `actions`, the search IconButton in a Tooltip and the account menu's AvatarButton. Its `navigation` takes `bar`, `rail` and `drawer`, a Bar, a Rail and a Drawer given the same array of destinations, with `current` set from the router. The router's page, a Page with its PageHeader, is the Scaffold's children. The Scaffold shows the bar on a `compact` window, the rail on a `medium` one and the drawer from `expanded`, by its own container's width, and `forms` changes the form for a window class; don't choose the form in script from the window's width.

```tsx source=AppFrame

```

#### A menu on phones

`forms={{ compact: 'none', medium: 'drawer' }}` shows no navigation on a compact window and the drawer from medium. A menu IconButton in the TopBar's `start` opens a Sheet with `side="start"` holding the same Drawer, which closes the sheet when a destination is chosen.

```tsx source=MenuOnPhones

```

#### Details beside the page

`Panes.Root` with `behavior="supporting"` fills the Scaffold's body: `Panes.Main` holds the page, with a `Panes.Trigger` that opens `Panes.Supporting`, and each pane scrolls on its own.

#### An installed app's window

Give the Scaffold `topBarSpan="full"`, so its `topBar` runs across the whole window above the navigation, and `scroll="body"`, so only the body scrolls under it. The `topBar` is a TopBar with `titleBar` and the window's `title`: in a window that draws its own title bar, through the Window Controls Overlay, it fills the title bar area, leaves room for the system's window controls, drags the window by its empty space and centres its title, and its controls are small, with buttons that set no variant ghost. A Menubar goes in the TopBar's `start`; give the page's PageHeader `sticky` to keep it at the top of the scrolling body.

In a browser tab the title bar area is undefined, and the TopBar falls back to its own height across the full width. Zoomed in, the window reports a smaller area, which the small controls still fit.

```tsx source=InstalledWindow

```

### Composition

The parts are the top bar, `env-top-bar`, the search button, `env-top-bar-actions > env-icon-button`, the account menu's `env-avatar-button`, the rail, `env-rail`, and the page, `env-page`, with its `env-page-header`. Search opens a [CommandPalette](../components/command-palette.md#opening-it-the-button-and-the-shortcut), and the account menu is the [account and organizations](account-and-organizations.md) pattern. In an installed app's window, the title bar is the Scaffold's `env-top-bar`, its menubar `env-menubar` and its title `env-top-bar-title`, above the body, `env-scaffold-body`.

## Changelog

- **1.0.0**: The app frame is a pattern built from Scaffold, TopBar and the navigation forms, in place of AppShell, the app frame template and the WindowFrame component; the window frame pattern is its installed app's window. The page is on the figure template.
