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
    use: NavigationDrawer
  - text: A deep hierarchy that people expand and collapse, such as folders and files.
    use: Tree
related:
  - bar
  - navigation-drawer
  - tree
  - badge
components:
  - Rail
---

# Rail

## Overview

Rail is Material's navigation rail: a narrow column at the window's start with the application's destinations one under another, each an icon above a short label. It is one of three navigation forms that take the same array of destinations, with [Bar](../components/bar.md) and [NavigationDrawer](../components/navigation-drawer.md); Scaffold shows the one that suits the window's width. Each destination is a link with `href`, through the `LinkProvider`'s link component, or a button that runs `onSelect`.

```tsx example=TabletDestinations

```

## Anatomy

1. **Rail** (`env-rail`): a `nav` landmark, a column 5 rem wide and as tall as its container.
2. **Header** (`env-rail-header`, optional, `header`): content above the destinations, such as a button that opens the drawer or the page's main action.
3. **List** (`env-rail-list`): the destinations, one under another, which scroll where the rail is shorter.
4. **Item** (`env-rail-item`): a link or button, with its indicator above its label.
5. **Indicator** (`env-rail-indicator`): a 3.5 by 2 rem pill around the 1 rem icon, filled while the destination is current. A Material Symbol shows filled while current and outlined otherwise.
6. **Count** (`env-rail-count`, optional, `count`): an accent pill on the icon's top end; 999+ above 999.
7. **Label** (`env-rail-label`): 0.75 rem text under the indicator, which wraps.
8. **Footer** (`env-rail-footer`, optional, `footer`): content at the bottom, such as the account's button.

## States and behaviour

- **Current**: `current` on one destination fills its indicator, fills its Material Symbol and reports `aria-current="page"`. The application sets it from its router.
- **Hover and press**: the indicator takes the navigation hover and pressed fills, and settles slightly while held, without a reduced-motion preference.
- **Links and buttons**: with `href` a destination is a native link through the `LinkProvider`'s link component, and `onSelect` runs as it is followed; without `href` it is a button that runs `onSelect`.
- **Groups**: a destination's `group` shows no heading in the rail; grouped destinations follow one another in the array's order.
- **Counts**: a count of 0 shows nothing. The count is part of the destination's name, such as "Inbox, 4 new", so the pill is hidden from assistive technology.

## Content guidelines

- Name each destination with one or two short words; the label wraps under a 5 rem column.
- Give every destination an icon that says something about its page.

## Do and don't

### Do

- Pass the same destinations to the Bar, the Rail and the Drawer, and let Scaffold pick the form.
- Put the page's main action in the header, as Material's rail does.

### Don't

- Don't rely on group headings in a rail; it shows none.
- Don't use a rail for a long list of destinations; a [NavigationDrawer](../components/navigation-drawer.md) suits it.

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop. |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination without `href`.       |
| <kbd>Space</kbd>                                | Selects a destination without `href`.                          |

### envUI provides

- A `nav` landmark, named "Main" from `messages.navigation.label` unless you give `aria-label` or `aria-labelledby`.
- A list of native links and buttons, and `aria-current="page"` on the current destination.
- A destination's count in its name, and decorative icons hidden from assistive technology.
- The shared focus ring.

### You provide

- `current` on the destination of the page shown, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one, and names for the controls in the header and footer.

## Examples

### Groups in order

The same array as a drawer's: the rail shows the grouped destinations in order, without their headings.

```tsx example=GroupsInOrder

```

## Changelog

- **1.0.0**: Rail, the navigation rail, with Bar and NavigationDrawer; together they replace NavList and the sidebar's rail.
