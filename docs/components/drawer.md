---
title: Drawer
summary: The navigation drawer for expanded and larger windows, a column of destinations with icons, labels, counts and group headings.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - navigation drawer
  - Sidebar
  - sidebar
  - hamburger menu
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
  - navigation links
  - navigation
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
components:
  - Drawer
---

# Drawer

## Overview

[Scaffold](scaffold.md) shows the Drawer, the [Rail](rail.md) or the [Bar](bar.md), whichever fits the width.

```tsx example=AppDestinations

```

It fills a plain rectangle with the navigation's background, the same as the [TopBar](top-bar.md)'s; `background="page"` puts it on the page's background instead. On a surface, such as a [Sheet](sheet.md), it takes that surface's color either way.

### Without icons

A `DrawerDestination` may leave its icon out; the Bar and the Rail need icons.

```tsx example=GuideSections

```

### One array, three forms

The application passes the same destinations to each form, and a group is a heading in the drawer only.

```tsx example=OneListThreeForms

```

### Resizable

With `resizable`, people resize the drawer by its end edge, by pointer or the arrow keys, with the same handle as between [Panes](panes.md), a grip of three dots on that edge, between `minWidth` and `maxWidth`, and never past half its container. Its labels and group headings keep to one line, so its items keep their height as it narrows: one that doesn't fit ends in an ellipsis. A label cut short shows in full in a tooltip; a heading cut short, which takes no focus, gives its full text as its `title`, shown on hover. `width` and `onWidthChange` let the application keep the width for the next visit, here in the browser's storage, which it reads once the drawer is in the browser, so a page rendered on a server starts at the default, and guards, since storage can be blocked or hold something that isn't a number. A `width` that isn't a finite number is ignored. Keep a resizable drawer on its own background rather than `background="page"`, so its handle is the edge of a surface and doesn't float beside the page's content.

```tsx example=ResizableDrawer

```

## When to use

```tsx do=GroupsTogether caption="A group's destinations next to each other."

```

```tsx dont=GroupsApart caption="A group split up: its heading shows twice."

```

- Set `current` on one destination from the router; a press doesn't select by itself.
- Short labels, which fit on one line; a long one wraps.

## Anatomy

```tsx anatomy=DrawerAnatomy

```

1. **Drawer** (`env-drawer`)
2. **Header** (`env-drawer-header`, `header`)
3. **Item** (`env-drawer-item`)
4. **Label** (`env-drawer-label`)
5. **Count** (`env-drawer-count`, `count`)
6. **Group** (`env-drawer-section`, `group`)
7. **Heading** (`env-drawer-heading`)
8. **Footer** (`env-drawer-footer`, `footer`)

Not shown: the handle on a resizable drawer's end edge, `env-drawer-resize-handle`.

### Colors

`--env-drawer-item-container`, `--env-drawer-item-content`, `--env-drawer-item-icon`, `--env-drawer-item-selected` and `--env-drawer-item-selected-content` set the colors of one Drawer, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop. |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination without `href`.       |
| <kbd>Space</kbd>                                | Selects a destination without `href`.                          |
| <kbd>←</kbd>, <kbd>→</kbd> on the resize handle | Resizes a `resizable` drawer 1 rem; with <kbd>Shift</kbd>, 5.  |
| <kbd>Home</kbd>, <kbd>End</kbd> on the handle   | Resizes it to its smallest or largest width.                   |

### envUI provides

- A `nav` landmark named Main, of native links and buttons, with `aria-current="page"` on the current one.
- Group headings at `headingLevel`, each naming its group's list.
- A count in its destination's name, such as Inbox, 12 new, and a 2.75 rem touch target on coarse pointers.
- With `resizable`, a focusable separator on its end edge, named Resize navigation, with its width as its value.

### You provide

- `current` from the router, and the routing behind `href` through `LinkProvider`.
- An `aria-label` on each navigation landmark when a page has more than one.
- Unique labels, and `messages.navigation` in the application's language.

## Changelog

- **1.0.0-prerelease.3**: A resizable Drawer keeps each label and group heading on one line as it narrows: one that doesn't fit ends in an ellipsis, a label cut short shows in full in a tooltip, and a heading cut short gives its full text as its title.
- **1.0.0-prerelease.2**: With `resizable`, people resize it by its end edge, between `minWidth` and `maxWidth` and never past half its container, from `defaultWidth`; `width` and `onWidthChange` keep it. The handle is `env-drawer-resize-handle`, the same grip as Panes.Divider's.
- **1.0.0**: Drawer, the navigation drawer, with Bar and Rail; together they replace NavList. NavList.Item's `selected` is a destination's `current`, its `end` count is `count`, and NavList.Group is a destination's `group`.
