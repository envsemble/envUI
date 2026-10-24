---
title: Window frame
summary: Frame an installed application's window that draws its own title bar, with the title bar across the top and the content scrolling below it.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - WindowFrame
  - window frame
  - title bar
  - Window Controls Overlay
  - installed app
  - desktop app
  - start page
useWhen:
  - An installed web app or a desktop shell draws its own title bar, with the window controls over the page.
avoidWhen:
  - text: An application's screen in a browser tab, with its top bar and navigation.
    see: app-frame
  - text: A page's own title and actions.
    use: PageHeader
composes:
  - Scaffold
  - TopBar
  - Menubar
  - Menu
  - Page
  - PageHeader
  - Button
  - IconButton
  - Column
  - Drawer
  - Text
---

# Window frame

## Overview

A [Scaffold](../components/scaffold.md) with `topBarSpan="full"` puts a [TopBar](../components/top-bar.md) with `titleBar` across the window, and `scroll="body"` scrolls only the body, so the window controls never cover a scrollbar.

```tsx example=StartPageWindow stage=shaded

```

### Outside such a window

In a browser tab the title bar area is undefined, and the TopBar falls back to its own height across the full width. Zoomed in, the window reports a smaller area, which the small controls still fit.

## Variants

### A menubar in the title bar

A [Menubar](../components/menubar.md) in the TopBar's `start`, and a page whose header sticks at the top of the body.

```tsx example=WithMenubar stage=shaded

```

### Navigation below the title bar

The Scaffold's `navigation`, here a [Drawer](../components/drawer.md), sits beside the body.

```tsx example=WithNavigation stage=shaded

```

## When to use

```tsx do=QuietTitleBar stage=shaded caption="The title and the menubar, with empty space to drag the window by."

```

```tsx dont=CrowdedTitleBar stage=shaded caption="The page's actions in the title bar: no room is left to drag the window."

```

### Content

- Title the bar as the window's title would read: the document's or the application's name.
- Order the menubar's menus as the platform does: File, Edit, View.

## Anatomy

```tsx anatomy=WindowFrameAnatomy stage=shaded

```

1. **Title bar** (`env-top-bar`, `topBar`)
2. **Menubar** (`env-menubar`, `start`)
3. **Title** (`env-top-bar-title`, `title`)
4. **Body** (`env-scaffold-body`)

## Accessibility

The skip links come first, then the title bar's controls, then the navigation and the body. The menubar is one tab stop whose menus the arrow keys open.

### envUI provides

- The banner and main landmarks, and the skip links, from the Scaffold.
- Controls in the title bar that stay clickable where the window drags.

### You provide

- The window's title in `document.title` as well as the bar.
- Names for icon-only controls in the title bar.

## Changelog

- **1.0.0**: The window frame is a pattern built from Scaffold and TopBar, in place of the WindowFrame component. The page is on the figure template.
