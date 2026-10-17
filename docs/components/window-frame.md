---
title: WindowFrame
summary: A window without the app frame's sidebars that draws its own title bar, with its content scrolling below it, or the title bar on its own.
status: beta
since: 0.5.0
category: Navigation
aliases:
  - title bar
  - TitleBar
  - window controls overlay
  - desktop window
  - installed app window
  - start page
useWhen:
  - An installed web app or desktop shell draws its own title bar over the window (the Window Controls Overlay), for a start page or a simple window.
  - A title bar on its own, at the top of a window the application lays out itself.
avoidWhen:
  - text: The frame of an application with sidebars, whose header can be the title bar.
    use: AppShell
  - text: A row of a page's actions.
    use: Toolbar
related:
  - app-shell
  - menubar
  - toolbar
components:
  - WindowFrame
---

# WindowFrame

## Overview

WindowFrame is a window without the app frame's sidebars, for an installed web app or a desktop shell that draws its own title bar while the system draws the window controls over the page. `WindowFrame.Root` fills the window with `WindowFrame.TitleBar` on top and `WindowFrame.Content` scrolling below it, so the window controls never cover a scrollbar; the keyboard scrolls the content as it would the document. A frame with sidebars is [AppShell](../components/app-shell.md), whose header can be the title bar too.

```tsx example=StartPageWindow

```

## Anatomy

1. **Title bar** (`WindowFrame.TitleBar`): `start`, such as the mark and a Menubar; its `children`, centred in the window; and `end`, such as actions. The window controls follow it.
2. **Content** (`WindowFrame.Content`): scrolls below the title bar; its `ref` is the element that scrolls.

## Variants and sizes

- The title bar takes the height of the title bar area the window reports, and at least `--env-title-bar-height` (2.5 rem, 2 rem in the compact scale), so its small controls fit once the page is zoomed in; in an ordinary browser window it spans the full width.
- Buttons in the title bar that set no variant are ghost, at the small control height, as the window controls beside them; under a coarse pointer they grow to 2.75 rem, as every control does.

## States and behaviour

- **Dragging**: empty space in the title bar drags the window; controls, fields and their labels stay clickable, and text fields keep text selection.
- **Window controls**: the bar leaves room for them through `env(titlebar-area-x)` and `env(titlebar-area-width)`, on whichever side they are, also in right-to-left text.
- **Frame variables**: `WindowFrame.Root` publishes the same `--env-frame-header-block-size` (the title bar's size) and `--env-frame-sticky-top` (`0px`, the top of the content, which scrolls under the bar) as AppShell.Root, and `useAppShell()` inside it returns the content as `getScrollElement()` and `0` from `getStickyTop()`.
- **Scrolling keys**: <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd>, <kbd>Home</kbd>, <kbd>End</kbd> and the arrow keys scroll the content from anywhere a control doesn't take them, as they would scroll the document. Pressing the content focuses it.

## Content guidelines

- Keep the title to the document's or the window's name.
- Put the application's menus at the start and two or three actions at the end; the rest belongs in the menus.

## Do and don't

### Do

- Put `WindowFrame.TitleBar` first in `WindowFrame.Root`, and the window's content in `WindowFrame.Content`.
- Stick content inside the window at `var(--env-frame-sticky-top)`.

### Don't

- Don't put a sticky or fixed `WindowFrame.TitleBar` above a scrolling document; put it in `WindowFrame.Root` above `WindowFrame.Content`.
- Don't use WindowFrame for an application with sidebars; use AppShell, whose header can be the title bar.

## Accessibility

### Keyboard

| Key                                                                                                                     | Action                                                                     |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | Scroll the content as they would the document, unless a control uses them. |

### envUI provides

- A `header` for the title bar, controls that stay reachable and clickable in the drag region, and keyboard scrolling of the content.

### You provide

- The window's `main` landmark inside the content where the window has one, and its heading.

## Examples

### Sticky sections

Content inside the window sticks at `var(--env-frame-sticky-top)`, the top of the content below the title bar.

```tsx example=StickySection

```

## Changelog

- **1.0.0**: TitleBar and WindowFrame are one namespace, `WindowFrame.Root`, `WindowFrame.TitleBar` and `WindowFrame.Content`; buttons in a title bar that set no variant are ghost. The root publishes `--env-frame-header-block-size` and `--env-frame-sticky-top`, and `useAppShell` works inside it. The page moves out of AppShell's.
- **0.5.0**: TitleBar and WindowFrame.
