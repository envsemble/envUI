---
title: Rail
summary: The navigation rail for medium windows, such as tablets, a narrow column of destinations, each an icon above a short label.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - navigation rail
  - side rail
  - icon rail
  - collapsed sidebar
  - icon sidebar
  - NavigationRail
  - sidebar rail
useWhen:
  - An application's main destinations on a medium window, such as a tablet, where Scaffold places the rail at the window's start.
  - Destinations with short labels that fit under their icons.
avoidWhen:
  - text: The same destinations on a compact window, such as a phone.
    use: Bar
  - text: The same destinations on an expanded or larger window, or with group headings and long labels.
    use: Drawer
components:
  - Rail
---

# Rail

## Overview

Rail takes the same destinations as [Bar](bar.md) and [Drawer](drawer.md), and [Scaffold](scaffold.md) shows the form that fits the width. A button that narrows the drawer to the rail asks the Scaffold for it through `forms` ([a button that narrows the navigation](scaffold.md#a-button-that-narrows-the-navigation)).

```tsx example=TabletDestinations

```

The rail fills a plain rectangle with the navigation's background, the same as the [TopBar](top-bar.md)'s; `background="page"` puts it on the page's background instead.

### Groups

A destination's `group` shows no heading in the rail: grouped destinations follow one another in the array's order.

```tsx example=GroupsInOrder

```

## When to use

```tsx do=ActionAtTheTop caption="The main action in the header, above the destinations."

```

```tsx dont=ActionAtTheBottom caption="The main action below the destinations, where people don't look for it."

```

- Set `current` on one destination from the router; a press doesn't select by itself.
- `footer` for the account, such as an AvatarButton.

## Anatomy

```tsx anatomy=RailAnatomy

```

1. **Rail** (`env-rail`)
2. **Header** (`env-rail-header`, `header`)
3. **Item** (`env-rail-item`)
4. **Indicator** (`env-rail-indicator`)
5. **Count** (`env-rail-count`, `count`)
6. **Label** (`env-rail-label`)
7. **Footer** (`env-rail-footer`, `footer`)

### Colors

`--env-rail-item-container`, `--env-rail-item-content`, `--env-rail-item-icon`, `--env-rail-item-selected` and `--env-rail-item-selected-content` set the colors of one Rail, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop. |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination without `href`.       |
| <kbd>Space</kbd>                                | Selects a destination without `href`.                          |

### envUI provides

- A `nav` landmark named Main, of native links and buttons, with `aria-current="page"` on the current one.
- A count in its destination's name, such as Inbox, 4 new.

### You provide

- `current` from the router, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Names for the controls in the header and the footer.

## Changelog

- **1.0.0**: Rail, the navigation rail, with Bar and Drawer; together they replace NavList and the sidebar's rail.
