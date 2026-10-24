---
title: Window frame
summary: Frame an installed application's window that draws its own title bar, with the title bar across the top and the content scrolling below it.
status: beta
since: 1.0.0
intent: Frame the application
aliases:
  - WindowFrame
  - window frame
  - title bar
  - Window Controls Overlay
  - installed app
  - desktop app
  - start page
useWhen:
  - An installed app that draws its own title bar
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

The title bar, a [TopBar](../components/top-bar.md), runs across the whole window, and only the [Scaffold](../components/scaffold.md)'s body scrolls below it, so the window controls never cover a scrollbar.

```tsx example=StartPageWindow stage=shaded

```

### Outside such a window

In a browser tab the title bar area is undefined, and the TopBar falls back to its own height across the full width. Zoomed in, the window reports a smaller area, which the small controls still fit.

## Variants

### A menubar in the title bar

A [Menubar](../components/menubar.md) at the start of the title bar, and a page whose header sticks at the top of the body.

```tsx example=WithMenubar stage=shaded

```

### Navigation below the title bar

The navigation, here a [Drawer](../components/drawer.md), sits beside the body, below the title bar.

```tsx example=WithNavigation stage=shaded

```

## When to use

```tsx do=QuietTitleBar stage=shaded caption="The title and the menubar, with empty space to drag the window by."

```

```tsx dont=CrowdedTitleBar stage=shaded caption="The page's actions in the title bar: no room is left to drag the window."

```

### Content

Title the bar as the window's title would read: the document's or the application's name. Order the menubar's menus as the platform does: File, Edit, View.

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

## In code

### Usage

Give the Scaffold `topBarSpan="full"`, so its `topBar` runs across the whole window above the navigation, and `scroll="body"`, so only the body scrolls under it. The `topBar` is a TopBar with `titleBar` and the window's `title`: in a window that draws its own title bar, through the Window Controls Overlay, it fills the title bar area, leaves room for the system's window controls, drags the window by its empty space and centres its title, and its controls are small, with buttons that set no variant ghost. Elsewhere it falls back to its own height across the full width.

```tsx source=StartPageWindow

```

#### A menubar in the title bar

Put a Menubar in the TopBar's `start`. Give the page's PageHeader `sticky`, so it sticks at the top of the scrolling body.

```tsx source=WithMenubar

```

#### Navigation

The Scaffold's `navigation`, such as `{ drawer: <Drawer … /> }`, sits beside the body, under the full-width title bar.

### Composition

The parts are the title bar, `env-top-bar`, from the Scaffold's `topBar`; the menubar, `env-menubar`, in the TopBar's `start`; the title, `env-top-bar-title`, from `title`; and the body, `env-scaffold-body`.

## Changelog

- **1.0.0**: The window frame is a pattern built from Scaffold and TopBar, in place of the WindowFrame component. The page is on the figure template.
