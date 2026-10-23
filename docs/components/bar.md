---
title: Bar
summary: The navigation bar for compact windows, such as phones, with three to five destinations, each an icon above its label.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - navigation bar
  - bottom navigation
  - bottom bar
  - tab bar
  - bottom tabs
  - mobile navigation
  - NavigationBar
  - BottomNavigation
useWhen:
  - An application's main destinations on a compact window, such as a phone, where Scaffold places the bar at the bottom.
  - Three to five destinations of equal weight that people move between often.
avoidWhen:
  - text: The same destinations on a medium window, such as a tablet.
    use: Rail
  - text: The same destinations on an expanded or larger window, or more than five, or in groups.
    use: Drawer
  - text: Switching between views of the same content in one place.
    use: Tabs
  - text: Actions, such as New or Share.
    use: Toolbar
components:
  - Bar
---

# Bar

## Overview

The navigation bar holds an application's main destinations across the bottom of a compact window. It takes the same destinations as [Rail](rail.md) and [Drawer](drawer.md), and [Scaffold](scaffold.md) shows the form that fits the width.

```tsx example=PhoneDestinations

```

It fills a plain rectangle with the navigation's background, the same as the [TopBar](top-bar.md)'s; `background="page"` puts it on the page's background instead.

### More than five

Past five destinations, the fifth place is More, which opens the rest in a menu and takes the current fill when it holds the current page.

```tsx example=MoreDestinations

```

## When to use

- Three to five destinations; group headings don't show, so order the array.
- Set `current` from the router; a press doesn't select by itself.

## Anatomy

```tsx anatomy=BarAnatomy enlarge

```

1. **Bar** (`env-bar`)
2. **Item** (`env-bar li:nth-child(2) > env-bar-item`)
3. **Indicator** (`env-bar-icon`)
4. **Count** (`env-bar-count`, `count`)
5. **Label** (`env-bar-text`)

Not shown: More, `env-bar-more`.

## Adapting to width

The destinations share the bar's width equally, and labels stay on one line.

```tsx example=SharedWidth widths="20 36"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop.       |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination without `href`; opens More. |
| <kbd>Space</kbd>                                | Selects a destination without `href`; opens More.                    |
| <kbd>↑</kbd>, <kbd>↓</kbd> in More's menu       | Move between the destinations in the menu.                           |
| <kbd>Esc</kbd> in More's menu                   | Closes the menu and returns focus to More.                           |

### envUI provides

- A `nav` landmark named Main, of native links and buttons, with `aria-current="page"` on the current one.
- A count in its destination's name, such as Inbox, 4 new.
- More as a menu button, named with its counts and whether it holds the current page.
- Items at least 2.75 rem tall.

### You provide

- `current` from the router, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Unique labels, and `messages.navigation` in the application's language.

## Changelog

- **1.0.0**: Bar, the navigation bar, with Rail and Drawer; together they replace NavList.
