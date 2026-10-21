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
  - EmptyState
  - Button
  - Column
  - Drawer
  - Text
related:
  - scaffold
  - top-bar
  - menubar
  - app-frame
---

# Window frame

## Overview

Use this pattern to frame a window that draws its own title bar, as an installed web app with the Window Controls Overlay does: a [Scaffold](../components/scaffold.md) with a [TopBar](../components/top-bar.md) `titleBar` across its whole width, and the content scrolling in the body below it, so the window controls drawn over the title bar never cover a scrollbar. It is a pattern rather than a component: the Scaffold is the frame, and the application chooses what the title bar and the body hold.

```tsx example=StartPageWindow

```

## Anatomy

1. **Frame:** a Scaffold with `topBarSpan="full"`, which fills the window; its body scrolls.
2. **Title bar:** a TopBar with `titleBar` in the Scaffold's `topBar`: it takes the title bar area the window leaves free, empty space drags the window, its title is centred and its controls are small; a [Menubar](../components/menubar.md) can sit in its `start`.
3. **Navigation** (optional): the Scaffold's navigation forms, below the title bar.
4. **Content:** a [Page](../components/page.md) in the body, with its PageHeader, which can stick at the body's top.

## States and behaviour

- **Outside such a window**, in a browser tab, the title bar area is undefined, and the TopBar falls back to the title bar height across the full width.
- **Zoom:** the window reports a smaller title bar area once the page is zoomed in; the small controls still fit.
- **Scrolling:** the body scrolls below the title bar, and the keyboard scrolls it as it would the document.

## Content guidelines

- Title the bar with the document's or the application's name, as the window's title would read.
- Keep the menubar's menus to the application's commands, in the platform's order: File, Edit, View.

## Do and don't

### Do

- Run the title bar across the whole width with `topBarSpan="full"`, so it lies under the window controls.
- Keep empty space in the title bar, so people can drag the window.

### Don't

- Don't fill the title bar with controls; the page's own actions go in its PageHeader.
- Don't scroll the document; the Scaffold's body scrolls under the title bar.

## Accessibility

### Focus and keyboard

The Scaffold's skip links come first, then the title bar's controls, then the navigation and the body. The menubar is one tab stop whose menus the arrow keys open.

### envUI provides

- The banner and main landmarks, and the skip links, from the Scaffold.
- Controls in the title bar that stay clickable where the window drags.

### You provide

- The window's title in `document.title` as well as the bar.
- Names for icon-only controls in the title bar.

## Examples

### A menubar in the title bar

The menubar at the start of the title bar, and a page whose header sticks at the top of the body.

```tsx example=WithMenubar

```

### Navigation below the title bar

The navigation runs below the title bar, which spans the window.

```tsx example=WithNavigation

```

## Changelog

- **1.0.0**: The window frame is a pattern built from Scaffold and TopBar, in place of the WindowFrame component.
