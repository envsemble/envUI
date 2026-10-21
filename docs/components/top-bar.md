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

TopBar is the bar at the top of an application or a screen, after Material's small top app bar: start content, such as a navigation or back button or the application's mark, the title, and the actions at the end, in one row at the top bar height that never wraps. It is built from Row, and goes in a [Scaffold](scaffold.md)'s top bar region, which is the banner landmark.

```tsx example=AppTopBar

```

## Anatomy

1. **Bar** (`env-top-bar`): a Row at the top bar height, 3.25 rem, on the page's background with a hairline below.
2. **Start** (`env-top-bar-start`, `start`): a Row of what comes before the title.
3. **Title** (`env-top-bar-title`, `title`): the title, which takes the room left and truncates first. It is no heading.
4. **Actions** (`env-top-bar-actions`, `actions`): a Row of actions at the end.
5. **Page progress** (`env-top-bar-loading-bar`, `loading`): a thin bar along the bottom edge.

## Variants and sizes

| Prop       | Use for                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `sticky`   | A bar in a page whose document scrolls: it sticks at the top. A Scaffold's body scrolls under it. |
| `titleBar` | The window's own title bar, in an installed web app that draws one (Window Controls Overlay).     |
| `loading`  | Page progress along the bottom edge while the next page loads.                                    |

- The top bar height is `--env-top-bar-height`: 3.25 rem, 2.625 rem in the compact scale, and the touch height and a little more under a coarse pointer.
- With `titleBar` the bar takes the title bar area the window leaves free, its controls take the small height and buttons that set no variant are ghost; empty space drags the window, and the title is centred in the window. Put it in a Scaffold with `topBarSpan="full"`.
- `render={<header />}` makes a bar outside a Scaffold the page's banner.

## States and behaviour

- **Loading**: `loading` shows the bar after a short delay, so quick loads never flash it, then completes and fades out; `loadingLabel` names it, such as the page it loads.
- **Narrow**: the title truncates before the start content and the actions shrink; keep the actions few, or move them to a menu.

## Do and don't

### Do

- Name the application or the section in the title, and the page in its PageHeader.
- Keep two or three actions at the end, the account menu last.

### Don't

- Don't put the page's own actions in the top bar; they go in its PageHeader.
- Don't put a second navigation in the top bar; the Scaffold shows the navigation.

## Accessibility

### envUI provides

- A plain element, so a Scaffold's top bar region, the banner, names it; `render` gives it another element.
- The page progress as a named progress bar while it shows.
- In a title bar, controls that stay clickable where the window drags.

### You provide

- Names for icon-only buttons, such as Search or Back to projects.
- A `loadingLabel` that names what loads, in the application's language.

## Examples

### Page progress

`loading` while the next page loads, named by `loadingLabel`.

```tsx example=LoadingPage

```

### The window's title bar

`titleBar` with a menubar at the start and an action at the end.

```tsx example=TitleBar

```

## Changelog

- **1.0.0**: TopBar, which replaces AppShell.Header and WindowFrame.TitleBar, with `sticky`, `titleBar` and `loading`.
