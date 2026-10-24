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
  - An application's main destinations on a tablet
  - Short labels that fit under their icons
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

Rail takes the same destinations as [Bar](bar.md) and [Drawer](drawer.md), and [Scaffold](scaffold.md) shows the form that fits the width, the rail at the start of a medium window. A button can narrow the drawer to the rail in a wider window too, as [a button that narrows the navigation](scaffold.md#a-button-that-narrows-the-navigation) shows.

```tsx example=TabletDestinations

```

### Groups

The rail shows no group headings: grouped destinations follow one another in their order.

```tsx example=GroupsInOrder

```

## Variants

### Backgrounds

The rail is a plain rectangle down the window.

| Background | Use for                                                          |
| ---------- | ---------------------------------------------------------------- |
| Navigation | The navigation's own fill, the same as a TopBar's. The default.  |
| Page       | A rail on the page's color, such as beside a TopBar with a fill. |

## When to use

### Header and footer

The header holds the page's main action or a button that opens the navigation, and the footer the account, such as an AvatarButton.

### The current page

The application marks the current destination as people move: a press doesn't select one by itself.

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

One rail can take colors of its own: the pill around an icon at rest and when current, the labels and the icons. Its hover, focus and press then follow them; with none set, it keeps its own colors.

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop. |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination that is a button.     |
| <kbd>Space</kbd>                                | Selects a destination that is a button.                        |

### envUI provides

- A `nav` landmark named Main, of native links and buttons, with `aria-current="page"` on the current one.
- A count in its destination's name, such as Inbox, 4 new.

### You provide

- `current` from the router, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Names for the controls in the header and the footer.

## In code

### Usage

Rail takes `destinations`, the same array of `Destination`s that Bar and Drawer take. Each has a `label` short enough to fit under its `icon`, an optional `count`, and either an `href`, a native link through the link component of `LinkProvider`, or `onSelect` alone, a button. Set `current` on one from the router; a press doesn't select by itself. `header` holds content above the destinations, such as the main action, and `footer` content at the bottom, such as the account's AvatarButton. [Scaffold](scaffold.md) places the rail at the start of a medium window, at the window's height.

```tsx source=TabletDestinations

```

#### Groups

A destination's `group` shows no heading in the rail: grouped destinations follow one another in the array's order, so keep a group's destinations together.

```tsx source=GroupsInOrder

```

#### A button that narrows the navigation

Such a button asks the Scaffold for the rail in place of the drawer through its `forms`, such as `forms={{ expanded: 'rail', large: 'rail' }}`.

#### Background and name

`background` is `default`, the navigation's fill as a plain rectangle and the default, or `page`, the page's background; on a surface, such as a Sheet, both take the surface's color. `aria-label` names the landmark, Main by default from `messages.navigation`; give each landmark of a page its own.

### Composition

The parts are the rail, `env-rail`; its header, `env-rail-header`; its list of destinations, `env-rail-list`, which scrolls where the rail is shorter; each destination, `env-rail-item`, with its indicator, `env-rail-indicator`, its count, `env-rail-count`, and its label, `env-rail-label`; and its footer, `env-rail-footer`. The current item has `data-current`, and a rail on the page's background `data-background="page"`.

### Customize

`--env-rail-item-container`, `--env-rail-item-content`, `--env-rail-item-icon`, `--env-rail-item-selected` and `--env-rail-item-selected-content` set the colors of one Rail, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0**: Rail, the navigation rail, with Bar and Drawer; together they replace NavList and the sidebar's rail.
