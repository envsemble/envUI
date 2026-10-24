---
title: TopBar
summary: The bar at the top of an application or a screen, with start content, a title that truncates first and actions, which can stick, show page progress or be the window's title bar.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - top app bar
  - app bar
  - header
  - toolbar at the top
  - title bar
  - AppShell.Header
  - WindowFrame.TitleBar
  - page progress
useWhen:
  - The top of an application's screen, with its name, search and the account menu
  - A window that draws its own title bar, in an installed web app
avoidWhen:
  - text: A page's own title, description and actions.
    use: PageHeader
  - text: A row of actions inside a page.
    use: Toolbar
  - text: Desktop menus such as File and Edit across the top.
    use: Menubar
  - text: An installed application's window that draws its own title bar.
    see: window-frame
components:
  - TopBar
---

# TopBar

## Overview

A [Scaffold](scaffold.md)'s top bar region, which holds the TopBar, is the banner landmark.

```tsx example=AppTopBar

```

### Its background

The bar is a plain rectangle in the navigation's background, with no line below, or it sits on the page's background instead, opaque when it sticks, while the navigation keeps its own, as [Scaffold](scaffold.md#backgrounds) shows.

### Page progress

A thin bar along the bottom edge shows that the next page is loading, after a short delay, so quick loads never flash it.

```tsx example=LoadingPage

```

## Variants

### Title bar

The bar can be the window's own title bar in an installed web app: empty space drags the window, the title is centred and the controls are small. It then spans the whole Scaffold.

```tsx example=TitleBar

```

### Outside a Scaffold

A bar outside a Scaffold can stay at the top as the document scrolls, and be the page's banner.

## When to use

```tsx do=FewActions caption="Two or three actions, the account last."

```

```tsx dont=ManyActions caption="Many actions: the title is cut down to nothing."

```

### What goes where

The title names the application or the section, and the navigation goes in the Scaffold's navigation region, not in the top bar.

## Anatomy

```tsx anatomy=TopBarAnatomy

```

1. **Bar** (`env-top-bar`)
2. **Start** (`env-top-bar-start`, `start`)
3. **Title** (`env-top-bar-title`, `title`)
4. **Actions** (`env-top-bar-actions`, `actions`)

Not shown: the page progress.

## Adapting to width

The bar never wraps: the title is cut short first, and the start content and actions keep their size.

```tsx example=TitleFirstToGo widths="20 40"

```

## Accessibility

### envUI provides

- A plain element, which the Scaffold's banner region names; `render` gives it another element.
- The page progress as a named progress bar while it shows.
- In a title bar, controls that stay clickable where the window drags.

### You provide

- Names for icon-only buttons, such as Search or Back to projects.
- A `loadingLabel` that names what loads, in the application's language.

## In code

### Usage

A TopBar holds `start` content before the title, such as a navigation or back IconButton or the application's mark; its `title`, the application's or the section's name, which is no heading and is cut short first; and `actions` at the end, such as a search trigger and the account menu, in reading order. Put it in a Scaffold's top bar region, which is the banner landmark.

```tsx source=AppTopBar

```

#### Background

`background` is `default`, the navigation's background, as a plain rectangle with no line below, or `page`, which puts it on the page's background, opaque when it sticks, while the navigation keeps its own. On a surface, such as a Sheet, both take the surface's color.

#### Page progress

`loading` shows a thin bar along the bottom edge while the next page loads, after a short delay so quick loads never flash it. `loadingLabel` names it, Loading page by default, from EnvUIProvider's `messages.topBar`.

```tsx source=LoadingPage

```

#### Title bar

`titleBar` makes the bar the window's own title bar in an installed web app that draws its own, through the Window Controls Overlay: empty space drags the window, it leaves room for the controls the system draws, the title is centred and the controls are small. Put it in a Scaffold with `topBarSpan="full"`.

```tsx source=TitleBar

```

#### Outside a Scaffold

`sticky` keeps a bar outside a Scaffold at the top of the scrolling area as the document scrolls; in a Scaffold's top bar region it is unneeded, since the body scrolls under it. `render={<header />}` makes such a bar the page's banner; it is a `div` by default.

### Composition

The parts are the bar, `env-top-bar`, its start, `env-top-bar-start`, its title, `env-top-bar-title`, its actions, `env-top-bar-actions`, and the page progress, `env-top-bar-loading-bar`. Keep the navigation in the Scaffold's navigation region, and two or three actions in the bar, the account last.

## Changelog

- **1.0.0**: TopBar, which replaces AppShell.Header and WindowFrame.TitleBar, with `sticky`, `titleBar` and `loading`.
