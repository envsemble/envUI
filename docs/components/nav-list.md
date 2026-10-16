---
title: NavList
summary: A list of navigation destinations, such as the pages in a sidebar, with icons, counts, groups and an icon-only form.
status: beta
since: 0.1.0
category: Navigation
aliases:
  - NavigationItem
  - NavItem
  - nav item
  - NavList.Item
  - Sidebar.Item
  - sidebar item
  - sidebar navigation
  - side navigation
  - navigation
  - navigation list
  - nav links
useWhen:
  - An application's main destinations, such as the pages in a sidebar.
  - The pages of an area listed beside its content, such as the sections of a guide or of the account settings.
  - A collapsed sidebar or a rail that shows only icons, with the labels in tooltips (iconOnly).
avoidWhen:
  - text: Switching between views of the same content in one place.
    use: Tabs
  - text: A short list of actions or destinations behind one control.
    use: Menu
  - text: The path from the top of a hierarchy down to the current page.
    use: Breadcrumbs
  - text: The previous and next pages of an ordered sequence, such as a guide.
    use: Pager
  - text: A deep hierarchy that people expand and collapse, such as folders and files.
    use: Tree
  - text: Choosing one of a few filters or modes that stays selected.
    use: SegmentedControl
related:
  - app-shell
  - tabs
  - menu
  - breadcrumbs
  - pager
  - tree
  - badge
  - tooltip
  - icons
components:
  - NavList
---

# NavList

## Overview

A navigation list holds an application's destinations, such as the pages in a sidebar. Each item is a native link that routes through `LinkProvider`, or a button that changes the view, and the current destination is selected. The list adds no landmark of its own: it goes in a `nav` element, or in a region that already is one, such as AppShell's sidebar.

The `NavList` namespace has three parts:

- **NavList.Root** is a plain list of items and groups.
- **NavList.Item** is one destination, with an optional icon and trailing content such as a count. With `iconOnly` it shows only its icon, and its label in a tooltip.
- **NavList.Group** puts related items under a small heading, inside NavList.Root.

Items also stand on their own, such as in AppShell's `navigation`, where they follow the collapsed sidebar, or as the buttons of Tabs.

```tsx example=SidebarNavigation

```

## Anatomy

1. **List** (NavList.Root): a list without bullets or indent, its items 0.25 rem apart. Each item is as wide as its content, up to the list's width.
2. **Group heading** (`label` of NavList.Group): 0.875 rem muted text above the group's items, inset 0.75 rem to line up with their content. A group sits 1 rem below the item or group before it.
3. **Item** (NavList.Item): a pill at least 2.5 rem tall, with 0.25 rem by 0.75 rem padding.
4. **Icon** (optional, `icon`): decorative, at the control icon size of 1 rem, 0.5 rem before the label. A Material Symbol shows filled while the item is selected and outlined otherwise; `selectedIcon` swaps a custom icon.
5. **Label** (children): 0.9375 rem text that wraps when space runs out. In AppShell's sidebar it stays on one line.
6. **Trailing content** (optional, `trailing`): at the end of the item, 0.75 rem after the label, such as a CounterBadge. An icon-only item shows a 0.4375 rem accent **dot** at its icon's top end instead.
7. **Tooltip** (icon-only): the item's label, at its inline end.
8. **Focus ring**: the shared ring, 0.125 rem inside the pill, shown for keyboard focus.

## Variants and sizes

| Form              | Use for                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `size="standard"` | Most navigation, with 0.9375 rem labels.                                                   |
| `size="compact"`  | A dense sidebar or a long list, such as recent documents, with 0.875 rem labels.           |
| `iconOnly`        | A collapsed sidebar or a rail: a 2.5 rem circle with the icon, and the label in a tooltip. |

<!-- specimen: VariantMatrix -->

- Both sizes keep the 2.5 rem height and the 1 rem icon, so standard and compact items line up with buttons; on touch screens items grow to 2.75 rem, and icon-only circles with them.
- An item takes the navigation text color, with its icon in the muted navigation icon color. The selected item takes the navigation selection fill, with its label and icon in the selected label color: a deeper blue in the light theme and a lighter one in the dark theme, at 4.5:1 on hover too.
- Hover and pressed take the navigation hover and pressed tokens of the item's fill, selected or not, over 0.12 s; pressed, an item also settles to 97 percent of its size. With reduced motion, the colors change at once and the item doesn't move.

## States and behaviour

- **Selected**: `selected` marks the current destination: the selection fill, the filled icon and `aria-current="page"`, unless `aria-current` names another kind, such as `step`. The application sets it from its router; the item doesn't select itself when pressed.
- **Links and buttons**: with `href` an item is a native link, rendered through the `LinkProvider`'s link component so routing stays with the application. Without `href` it is a button with `type="button"`, for an item that changes the view in place.
- **Disabled**: a disabled item is dimmed with the shared disabled opacity and leaves the tab order. A disabled button cannot be pressed; a disabled link has no destination, cannot be followed and reports `aria-disabled`.
- **Icon-only**: with `iconOnly` the item shows its icon in a circle, named by `aria-label`, and its label in a tooltip at its inline end, after 400 ms of hover or at once on keyboard focus; <kbd>Esc</kbd> hides it. A disabled icon-only item shows it on hover. An application Tooltip around the item replaces the label tooltip, so only one shows. Keep the label as children: the item shows it again once `iconOnly` turns off.
- **In AppShell**: inside the compact sidebar, items with an icon show only it, without `iconOnly`; the label text names the item where it has no `aria-label`. A narrow window's sidebar closes after a link in it is followed.
- **Trailing content**: it follows the label and is part of the item's accessible name, so a CounterBadge needs an `aria-label` where its number alone doesn't say what it counts. An icon-only item shows a dot instead, which assistive technology doesn't hear.
- **Lists and groups**: inside NavList.Root and NavList.Group, each item renders its own list item, also through the application's components. An element the application writes in the list, such as its own `<li>`, and an item inside an item, such as in trailing content, render no list item of their own.

<!-- specimen: InteractionStates -->

## Content guidelines

- Name each destination after its page, with a short noun in sentence case, such as "Inbox" or "Billing and invoices", and use the page's own title.
- Give each item an icon that says something about its page, or give none of a list's items one; a group of items with and without icons doesn't line up.
- Name a group's heading with a short noun phrase, such as "Settings" or "Getting started".
- Use trailing content for a short fact that helps choose, such as an unread count or New, not for actions.
- Name an icon-only item after its destination, and add what its trailing content says, such as "Inbox, 12 unread".

## Do and don't

### Do

- Put the list in a `nav` element named after what it navigates, such as "Workspace", where nothing around it is a navigation landmark yet.
- Select the item of the current page, from the application's router, and only one.
- Group long lists under headings, and put the most used destinations first.
- Use `iconOnly` with a toggle that expands the sidebar again, so the labels are a press away.

### Don't

- Don't use a navigation list to switch views of the same content; use [Tabs](../components/tabs.md).
- Don't put actions, such as New project, among the destinations; use a [Button](../components/button.md) beside the list.
- Don't nest groups, or put a group inside an item; use a [Tree](../components/tree.md) for a deep hierarchy.
- Don't hide a destination's state in the dot alone; name it in the icon-only item's `aria-label`.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the next or previous item; every item is a tab stop, and a disabled item is skipped. |
| <kbd>Enter</kbd>                                | Follows a link, or activates an item without `href`.                                                |
| <kbd>Space</kbd>                                | Activates an item without `href`.                                                                   |
| <kbd>Esc</kbd> on an icon-only item             | Hides its label tooltip.                                                                            |

### envUI provides

- Native `<a>` and `<button>` elements, with `type="button"` on buttons, and the list and list item roles of a native `ul`.
- `aria-current="page"` on the selected item.
- A group's list named by its heading.
- Decorative icons hidden from assistive technology, and the selected icon's fill.
- The accessible name of an icon-only item from its `aria-label`, or from its label inside a compact AppShell sidebar, and the label in a tooltip on hover and keyboard focus.
- `aria-disabled` on disabled links, which leave the tab order, and native `disabled` on buttons.
- The shared focus ring, and a 2.75 rem touch target on coarse pointers.

### You provide

- A `nav` landmark around the list, named with `aria-label` where the page has more than one, unless the list sits in one already, such as AppShell's sidebar.
- `selected` on the current destination, and the routing behind `href`, through `LinkProvider`.
- An `aria-label` on every icon-only item that says its destination and what its trailing content says.
- An `aria-label` on trailing content whose number alone doesn't say what it counts, such as "4 unread" on a CounterBadge.
- Labels that name destinations, unique within the list.

## Examples

### Grouped destinations

NavList.Group puts related pages under a small heading, which also names the group's list. Without icons, the headings line up with the labels.

```tsx example=GroupedDestinations

```

### Compact labels

`size="compact"` sets 0.875 rem labels at the same height, for a long list such as recent documents.

```tsx example=CompactSize

```

### Collapsed sidebar

With `iconOnly` the items show only their icons and their labels in tooltips; the count turns into a dot, so the item's `aria-label` carries it. The label stays as children for the expanded sidebar.

```tsx example=CollapsedSidebar

```

## Changelog

- **1.0.0**: `NavigationItem` is `NavList.Item`, with the `env-nav-list-item-*` classes, and the page is `nav-list`. New: NavList.Root, a plain list of items, and NavList.Group, related items under a small heading. An item renders its `<li>` only as an item of NavList.Root or NavList.Group, not inside the application's own `<li>` or inside another item.
- **0.5.0**: `trailing` content, a dot while icon-only. An icon-only item shows its label in a tooltip at its inline end instead of a native title. Selected labels keep 4.5:1 contrast on hover.
- **0.3.0**: Items follow a compact AppShell sidebar, showing their icon with the label as accessible name.
- **0.2.0**: Destinations render through the `LinkProvider`'s link component.
- **0.1.0**: NavigationItem, with selected and unselected icons, compact labels and `iconOnly`.
