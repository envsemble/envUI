---
title: NavigationDrawer
summary: The navigation drawer for expanded and larger windows, a column of destinations with icons, labels, counts and group headings.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - Drawer
  - navigation drawer
  - nav drawer
  - side navigation
  - sidebar navigation
  - sidebar links
  - NavList
  - NavList.Item
  - NavigationItem
  - nav item
  - navigation list
  - nav links
useWhen:
  - An application's main destinations on an expanded or larger window, where Scaffold places the drawer at the window's start.
  - Many destinations, in groups under headings, with counts.
  - The sections of a guide or of the settings beside their content, with or without icons.
avoidWhen:
  - text: The same destinations on a compact window, such as a phone.
    use: Bar
  - text: The same destinations on a medium window, such as a tablet.
    use: Rail
  - text: Switching between views of the same content in one place.
    use: Tabs
  - text: A deep hierarchy that people expand and collapse, such as folders and files.
    use: Tree
  - text: The path from the top of a hierarchy down to the current page.
    use: Breadcrumbs
related:
  - bar
  - rail
  - tabs
  - tree
  - breadcrumbs
  - badge
components:
  - NavigationDrawer
---

# NavigationDrawer

## Overview

NavigationDrawer is Material's navigation drawer: a column at the window's start with every destination as a row of icon, label and count, under the headings of their groups. It is one of three navigation forms that take the same array of destinations, with [Bar](../components/bar.md) and [Rail](../components/rail.md); Scaffold shows the one that suits the window's width. Each destination is a link with `href`, through the `LinkProvider`'s link component, or a button that runs `onSelect`. It takes the name Drawer once today's Drawer, the panel that slides over the page, has become Sheet.

```tsx example=AppDestinations

```

## Anatomy

1. **Drawer** (`env-drawer`): a `nav` landmark, a column as wide as its longest destination, from 15 to 20 rem, and as tall as its container.
2. **Header** (`env-drawer-header`, optional, `header`): content above the destinations, such as the application's name or a search trigger.
3. **List** (`env-drawer-list`): the destinations and groups, which scroll where the drawer is shorter, while the header and footer stay.
4. **Group** (`env-drawer-section`): each run of destinations of one `group`, 0.75 rem apart from what is around it, a list named by its heading.
5. **Heading** (`env-drawer-heading`): the group's name in small muted text, in line with the labels' padding.
6. **Item** (`env-drawer-item`): a pill as wide as the drawer, at the control height, with its icon, label and count. A Material Symbol shows filled while current and outlined otherwise.
7. **Label** (`env-drawer-label`): the destination's name, which wraps.
8. **Count** (`env-drawer-count`, optional, `count`): a counter badge's pill at the item's end; 999+ above 999.
9. **Footer** (`env-drawer-footer`, optional, `footer`): content at the bottom, such as the account's menu.

## Variants and sizes

- **With icons**: every destination has an icon, so the same array suits the Rail and the Bar.
- **Without icons**: a `DrawerDestination` may leave its icon out, for the sections of a guide or of the settings; leave it out of every destination of a list, so the labels line up.
- Items take the control height, 2.5 rem by default and 2 rem in the compact scale, and grow to 2.75 rem on touch screens.

## States and behaviour

- **Current**: `current` on one destination gives it the navigation selection fill, fills its Material Symbol and reports `aria-current="page"`. The application sets it from its router.
- **Hover and press**: the item takes the navigation hover and pressed fills, and settles slightly while held, without a reduced-motion preference.
- **Links and buttons**: with `href` a destination is a native link through the `LinkProvider`'s link component, and `onSelect` runs as it is followed, such as to close a Sheet the drawer sits in; without `href` it is a button that runs `onSelect`.
- **Groups**: a heading starts wherever `group` differs from the destination before, so keep a group's destinations next to each other. Destinations without a group sit outside any heading.
- **Counts**: a count of 0 shows nothing. The count is part of the destination's name, such as "Inbox, 12 new", from `messages.navigation.itemCount`, so the pill is hidden from assistive technology.

## Content guidelines

- Name each destination after its page, with a short noun in sentence case, such as "Inbox" or "Billing and invoices".
- Name a group's heading with a short noun phrase, such as "Folders" or "Getting started".
- Use counts for new things people should look at, such as unread messages, not for totals.

## Do and don't

### Do

- Pass the same destinations to the Bar, the Rail and the Drawer, and let Scaffold pick the form.
- Put the most used destinations first, and less frequent ones in groups below.
- Mark the current destination from the router, and only one.

### Don't

- Don't put actions, such as New project, among the destinations; put a [Button](../components/button.md) in the header.
- Don't nest groups; use a [Tree](../components/tree.md) for a deep hierarchy.
- Don't use a drawer to switch views of the same content; use [Tabs](../components/tabs.md).

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop. |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination without `href`.       |
| <kbd>Space</kbd>                                | Selects a destination without `href`.                          |

### envUI provides

- A `nav` landmark, named "Main" from `messages.navigation.label` unless you give `aria-label` or `aria-labelledby`.
- A list of native links and buttons, each group's list named by its heading, and `aria-current="page"` on the current destination.
- A destination's count in its name, and decorative icons hidden from assistive technology.
- The shared focus ring, and a 2.75 rem touch target on coarse pointers.

### You provide

- `current` on the destination of the page shown, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Labels that name destinations, unique in the list, and `messages.navigation` in the application's language.

## Examples

### One list, three forms

The same array passed to the Drawer, the Rail and the Bar: the drawer heads the groups, the rail and the bar keep their order.

```tsx example=OneListThreeForms

```

### Sections of a guide

Without icons, a drawer lists the pages of a guide under their headings.

```tsx example=GuideSections

```

## Changelog

- **1.0.0**: NavigationDrawer, the navigation drawer, with Bar and Rail; together they replace NavList. NavList.Item's `selected` is a destination's `current`, its `end` count is `count`, and NavList.Group is a destination's `group`.
