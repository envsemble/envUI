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
    use: NavigationDrawer
  - text: Switching between views of the same content in one place.
    use: Tabs
  - text: Actions, such as New or Share.
    use: Toolbar
related:
  - rail
  - navigation-drawer
  - tabs
  - menu
  - badge
components:
  - Bar
---

# Bar

## Overview

Bar is Material's navigation bar: the application's main destinations side by side across the bottom of a compact window, each an icon above its label. It is one of three navigation forms that take the same array of destinations, with [Rail](../components/rail.md) and [NavigationDrawer](../components/navigation-drawer.md); Scaffold shows the one that suits the window's width. Each destination is a link with `href`, through the `LinkProvider`'s link component, or a button that runs `onSelect`.

```tsx example=PhoneDestinations

```

## Anatomy

1. **Bar** (`env-bar`): a `nav` landmark as wide as its container, with a hairline at its top, which keeps clear of a phone's home indicator.
2. **List** (`env-bar-list`): the destinations, which share the width equally.
3. **Item** (`env-bar-item`): a link or button, with its indicator above its label.
4. **Indicator** (`env-bar-icon`): a 4 by 2 rem pill around the 1 rem icon, filled while the destination is current. A Material Symbol shows filled while current and outlined otherwise.
5. **Count** (`env-bar-count`, optional, `count`): an accent pill on the icon's top end; 999+ above 999.
6. **Label** (`env-bar-text`): 0.75 rem text on one line, cut short with an ellipsis.
7. **More** (`env-bar-more`): past five destinations, the fifth place opens the rest in a [Menu](../components/menu.md).

## Variants and sizes

- **Three to five destinations**: one item each, sharing the width.
- **More than five**: the first four, and More, which opens the others in a menu. More takes the current fill when the current destination is in its menu, and shows the sum of their counts. Give a bar five at most where you can; a [NavigationDrawer](../components/navigation-drawer.md) suits more.
- Groups don't show: the destinations follow one another in the array's order.

## States and behaviour

- **Current**: `current` on one destination fills its indicator, fills its Material Symbol and reports `aria-current="page"`. The application sets it from its router; a press doesn't select by itself.
- **Hover and press**: the indicator takes the navigation hover and pressed fills, and settles slightly while held, without a reduced-motion preference.
- **Links and buttons**: with `href` a destination is a native link through the `LinkProvider`'s link component, and `onSelect` runs as it is followed; without `href` it is a button that runs `onSelect`.
- **Counts**: a count of 0 shows nothing. The count is part of the destination's name, such as "Inbox, 4 new", from `messages.navigation.itemCount`, so the pill is hidden from assistive technology.
- **More**: its menu lists the remaining destinations with their icons and counts, each named with its count as the others are; the current one reports `aria-current="page"`. More is named with the sum of their counts, and says when it holds the current page, such as "More, 5 new, current page inside", from `messages.navigation.moreCurrent`. <kbd>Esc</kbd> closes it and returns focus to More.

## Content guidelines

- Name each destination with one short word, such as "Inbox" or "Projects": the label shares a fifth of a phone's width.
- Give every destination an icon that says something about its page.
- Keep the order the same as in the Rail and the Drawer: pass the same array.

## Do and don't

### Do

- Pass the same destinations to the Bar, the Rail and the Drawer, and let Scaffold pick the form.
- Mark the current destination from the router, and only one.
- Keep a bar to three to five destinations.

### Don't

- Don't put actions, such as New, in a bar; use a [Button](../components/button.md) in the page.
- Don't use a bar to switch views of the same content; use [Tabs](../components/tabs.md).
- Don't hide a destination's only route to its page in More when people use it often; reorder the array.

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

- A `nav` landmark, named "Main" from `messages.navigation.label` unless you give `aria-label` or `aria-labelledby`.
- A list of native links and buttons, and `aria-current="page"` on the current destination.
- A destination's count in its name, and decorative icons hidden from assistive technology.
- More as a menu button, with its menu named "More".
- The shared focus ring, and items at least 2.75 rem tall.

### You provide

- `current` on the destination of the page shown, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Labels that name destinations, unique in the list, and `messages.navigation` in the application's language.

## Examples

### More than five destinations

Seven destinations: the bar shows four and More, whose menu holds the current one, so More takes the current fill.

```tsx example=MoreDestinations

```

## Changelog

- **1.0.0**: Bar, the navigation bar, with Rail and NavigationDrawer; together they replace NavList.
