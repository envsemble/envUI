---
title: TopBar
summary: The bar at the top of an application or a screen, with start content, a title that truncates first and actions, which can stick, show page progress or be the window's title bar.
status: beta
since: 1.0.0
category: Navigation
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
  - The top of an application's screen, in a Scaffold's top bar region, with its name, search and the account menu.
  - A window that draws its own title bar, in an installed web app.
avoidWhen:
  - text: A page's own title, description and actions.
    use: PageHeader
  - text: A row of actions inside a page.
    use: Toolbar
related:
  - scaffold
  - page-header
  - menubar
  - window-frame
components:
  - TopBar
---

# TopBar

## Overview

The top bar sits at the top of an application or a screen, after Material's small top app bar: start content, the title and the actions, in one row. It goes in a [Scaffold](scaffold.md)'s top bar region, which is the banner landmark.

```tsx example=AppTopBar

```

### Page progress

`loading` shows a thin bar along the bottom edge while the next page loads, after a short delay so quick loads never flash it.

```tsx example=LoadingPage

```

## Variants

### Title bar

`titleBar` makes the bar the window's own title bar in an installed web app: empty space drags the window, the title is centred and the controls are small. Put it in a Scaffold with `topBarSpan="full"`.

```tsx example=TitleBar

```

`sticky` keeps a bar outside a Scaffold at the top as the document scrolls, and `render={<header />}` makes it the page's banner.

## When to use

```tsx do=FewActions caption="Two or three actions, the account last."

```

```tsx dont=ManyActions caption="Many actions: the title is cut down to nothing."

```

- The title names the application or the section; the page's own title and actions go in its [PageHeader](page-header.md).
- The navigation goes in the Scaffold's navigation region, not in the top bar.

## Anatomy

```tsx anatomy=TopBarAnatomy

```

1. **Bar** (`env-top-bar`)
2. **Start** (`env-top-bar-start`, `start`)
3. **Title** (`env-top-bar-title`, `title`)
4. **Actions** (`env-top-bar-actions`, `actions`)

Not shown: the page progress, `env-top-bar-loading-bar`.

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

## Changelog

- **1.0.0**: TopBar, which replaces AppShell.Header and WindowFrame.TitleBar, with `sticky`, `titleBar` and `loading`.
