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
  - An application's main destinations, on an expanded or larger window
  - Many destinations, in groups under headings, with counts
  - The sections of a guide or of the settings, beside their content
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

[Scaffold](scaffold.md) shows the Drawer, the [Rail](rail.md) or the [Bar](bar.md), whichever fits the width, at the window's start.

```tsx example=AppDestinations

```

### Its background

The drawer is a plain rectangle in the navigation's background, the same as the [TopBar](top-bar.md)'s, or it sits on the page's background instead. On a surface, such as a [Sheet](sheet.md), it takes that surface's color either way.

### Without icons

A drawer's destinations can go without icons, such as the sections of a guide; the Bar and the Rail need them.

```tsx example=GuideSections

```

### One array, three forms

The application passes the same destinations to each form, and a group is a heading in the drawer only.

```tsx example=OneListThreeForms

```

### Resizable

People can resize the drawer by its end edge, by pointer or with the arrow keys, with the same grip of three dots as between [Panes](panes.md), within a smallest and a largest width and never past half its container. As it narrows, labels and headings stay on one line and end in an ellipsis, and a label cut short shows in full in a tooltip. The application can keep the width for the next visit.

```tsx example=ResizableDrawer

```

## When to use

```tsx do=GroupsTogether caption="A group's destinations next to each other."

```

```tsx dont=GroupsApart caption="A group split up: its heading shows twice."

```

### The current destination

Mark the one destination people are on, from the address they are at; pressing a destination doesn't mark it by itself.

### Labels

Keep labels short, so they fit on one line; a long one wraps.

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

Not shown: the handle on a resizable drawer's end edge.

### Colors

One drawer can take colors of its own for its items: their fill, their label, their icon, and the current item's fill and its label and icon. Their hover, focus and press then follow them; with none set, it keeps its own colors.

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous destination; each is a tab stop. |
| <kbd>Enter</kbd>                                | Follows a link, or selects a destination that isn't one.       |
| <kbd>Space</kbd>                                | Selects a destination that isn't a link.                       |
| <kbd>←</kbd>, <kbd>→</kbd> on the resize handle | Resizes a resizable drawer 1 rem; with <kbd>Shift</kbd>, 5.    |
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

## In code

### Usage

A Drawer takes `destinations`, the same array Bar and Rail take: each with its `label`, an `icon`, a `count` and a `group`. With `href`, a destination is a native link, through the application's router link from `LinkProvider`, and `onSelect` runs as it is followed; with `onSelect` alone it is a button, for a view without an address. Set `current` on one destination, from the router: a press doesn't select by itself. `header` and `footer` hold content above and below the destinations, such as the application's name and the account's menu.

```tsx source=AppDestinations

```

#### Groups and icons

A heading starts each run of destinations of one `group`, at `headingLevel`, 2 by default, so keep a group's destinations next to each other. A `DrawerDestination` may leave its `icon` out: leave it out of every destination of a list, or of none. Bar and Rail need icons.

```tsx source=OneListThreeForms

```

#### Background

`background` is `default`, the navigation's background, the same as TopBar's, as a plain rectangle, or `page`, which puts it on the page's background. On a surface, such as a Sheet, both take the surface's color.

#### Resizable

With `resizable`, people resize the drawer by its end edge, between `minWidth` and `maxWidth`, 15 and 30 rem by default, and never past half its container or the window. It starts at `defaultWidth`, 17.5 rem, which a double click on the handle returns to. `width` and `onWidthChange` let the application keep the width, in rem: `onWidthChange` reports each width while dragging, and with `committed` true as a drag ends, a key moves the handle or a double click resets it. A `width` that isn't a finite number is ignored. `resizeLabel` names the handle.

The example keeps the width in the browser's storage. It reads it once the drawer is in the browser, so a page rendered on a server starts at the default, and guards, since storage can be blocked or hold something that isn't a number.

```tsx source=ResizableDrawer

```

A heading cut short takes no focus, so it gives its full text as its `title`, shown on hover. Keep a resizable drawer on its own background rather than `background="page"`, so its handle is the edge of a surface and doesn't float beside the page's content, and leave `resizable` off a drawer in a sheet of a narrow window.

### Composition

Scaffold places the drawer at the window's start and shows the Drawer, the Rail or the Bar, whichever fits the width. The landmark is named Main, from EnvUIProvider's `messages.navigation`; give each navigation landmark of a page its own `aria-label`.

The parts are the drawer, `env-drawer`, its header, `env-drawer-header`, each group, `env-drawer-section`, with its heading, `env-drawer-heading`, each item, `env-drawer-item`, with its label, `env-drawer-label`, and count, `env-drawer-count`, the footer, `env-drawer-footer`, and the handle on a resizable drawer's end edge, `env-drawer-resize-handle`, the same grip as Panes.Divider's.

### Customize

`--env-drawer-item-container`, `--env-drawer-item-content`, `--env-drawer-item-icon`, `--env-drawer-item-selected` and `--env-drawer-item-selected-content` set the colors of one Drawer, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0-prerelease.3**: A resizable Drawer keeps each label and group heading on one line as it narrows: one that doesn't fit ends in an ellipsis, a label cut short shows in full in a tooltip, and a heading cut short gives its full text as its title.
- **1.0.0-prerelease.2**: With `resizable`, people resize it by its end edge, between `minWidth` and `maxWidth` and never past half its container, from `defaultWidth`; `width` and `onWidthChange` keep it. The handle is `env-drawer-resize-handle`, the same grip as Panes.Divider's.
- **1.0.0**: Drawer, the navigation drawer, with Bar and Rail; together they replace NavList. NavList.Item's `selected` is a destination's `current`, its `end` count is `count`, and NavList.Group is a destination's `group`.
