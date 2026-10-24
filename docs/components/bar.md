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
  - An application's main destinations on a phone
  - Three to five destinations people move between often
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

Bar takes the same destinations as [Rail](rail.md) and [Drawer](drawer.md), and [Scaffold](scaffold.md) shows the form that fits the width, the bar at the bottom of a compact window.

```tsx example=PhoneDestinations

```

### More than five

Past five destinations, the fifth place is More, which opens the rest in a menu and takes the current fill when it holds the current page.

```tsx example=MoreDestinations

```

## Variants

### Backgrounds

The bar is a plain rectangle across the window.

| Background | Use for                                                         |
| ---------- | --------------------------------------------------------------- |
| Navigation | The navigation's own fill, the same as a TopBar's. The default. |
| Page       | A bar on the page's color, such as under a TopBar with a fill.  |

## When to use

### Order

The bar shows no group headings, so put the destinations in the order people look for them.

### The current page

The application marks the current destination as people move: a press doesn't select one by itself.

## Anatomy

```tsx anatomy=BarAnatomy enlarge

```

1. **Bar** (`env-bar`)
2. **Item** (`env-bar li:nth-child(2) > env-bar-item`)
3. **Indicator** (`env-bar-icon`)
4. **Count** (`env-bar-count`, `count`)
5. **Label** (`env-bar-text`)

Not shown: More.

### Colors

One bar can take colors of its own: the pill around an icon at rest and when current, the labels and the icons. Its hover, focus and press then follow them; with none set, it keeps its own colors.

## Adapting to width

The destinations share the bar's width equally, and labels stay on one line.

```tsx example=SharedWidth widths="20 36"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop.         |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination that is a button; opens More. |
| <kbd>Space</kbd>                                | Selects a destination that is a button; opens More.                    |
| <kbd>↑</kbd>, <kbd>↓</kbd> in More's menu       | Move between the destinations in the menu.                             |
| <kbd>Esc</kbd> in More's menu                   | Closes the menu and returns focus to More.                             |

### envUI provides

- A `nav` landmark named Main, of native links and buttons, with `aria-current="page"` on the current one.
- A count in its destination's name, such as Inbox, 4 new.
- More as a menu button, named with its counts and whether it holds the current page.
- Items at least 2.75 rem tall.

### You provide

- `current` from the router, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Unique labels, and `messages.navigation` in the application's language.

## In code

### Usage

Bar takes `destinations`, the same array of `Destination`s that Rail and Drawer take. Each has a `label`, an `icon` and an optional `count`, and either an `href`, a native link through the link component of `LinkProvider`, or `onSelect` alone, a button. Set `current` on one from the router; a press doesn't select by itself. [Scaffold](scaffold.md) places the bar at the bottom of a compact window.

```tsx source=PhoneDestinations

```

#### More than five

Give the bar three to five destinations: past five it shows the first four and More, which opens the rest in a menu. A destination's `group` shows no heading in the bar, so order the array.

```tsx source=MoreDestinations

```

#### Background and name

`background` is `default`, the navigation's fill as a plain rectangle and the default, or `page`, the page's background; on a surface, such as a Sheet, both take the surface's color. `aria-label` names the landmark, Main by default from `messages.navigation`; give each landmark of a page its own.

```tsx
<Bar background="page" aria-label="Project" destinations={destinations} />
```

### Composition

The parts are the bar, `env-bar`; its row of destinations, `env-bar-list`; each destination, `env-bar-item`, with its indicator, `env-bar-icon`, its count, `env-bar-count`, and its label, `env-bar-text`; and More, `env-bar-more`. The current item has `data-current`, and a bar on the page's background `data-background="page"`.

### Customize

`--env-bar-item-container`, `--env-bar-item-content`, `--env-bar-item-icon`, `--env-bar-item-selected` and `--env-bar-item-selected-content` set the colors of one Bar, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0**: Bar, the navigation bar, with Rail and Drawer; together they replace NavList.
