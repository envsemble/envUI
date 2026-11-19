---
title: NavigationDrawer
summary: An application's main destinations, in a drawer, a rail or a bar by the window's width.
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
  - navigation rail
  - side rail
  - icon rail
  - collapsed sidebar
  - icon sidebar
  - NavigationRail
  - sidebar rail
  - navigation bar
  - bottom navigation
  - bottom bar
  - tab bar
  - bottom tabs
  - mobile navigation
  - NavigationBar
  - BottomNavigation
  - nested navigation
  - collapsible navigation
  - collapsible sidebar
  - docs navigation
  - sidebar sections
  - navigation tree
useWhen:
  - An application's main destinations, or the sections of a guide or settings
  - The same destinations on a tablet, as icons over labels (NavigationRail)
  - Three to five destinations along the bottom of a phone (NavigationBar)
avoidWhen:
  - text: Views of one subject that fill a region, such as a summary and activity.
    use: SegmentedControl
  - text: A deep hierarchy that people expand and collapse, such as folders and files.
    use: Tree
  - text: The path from the top of a hierarchy down to the current page.
    use: Breadcrumbs
components:
  - NavigationDrawer
  - NavigationRail
  - NavigationBar
examples:
  AppDestinations:
    role: overview
    stage: shaded
    device: window
  TabletDestinations:
    role: overview
    stage: shaded
    caption: 'NavigationRail: each destination an icon above a short label, for a tablet.'
  PhoneDestinations:
    role: overview
    stage: shaded
    caption: 'NavigationBar: three to five destinations along the bottom of a phone.'
  GuideSections: example
  ActivityBar: example
  GroupActions: example
  DrawerAnatomy: anatomy
  RailAnatomy: anatomy
  BarAnatomy: anatomy
  SectionAnatomy: anatomy
  OneListThreeForms: example
  NestedSections: example
  MoreDestinations: example
  ResizableDrawer: example
  SharedWidth: example
---

# NavigationDrawer

## Variants

### Without icons

```tsx figure=GuideSections stage=shaded

```

### Icons with tooltips

```tsx figure=ActivityBar stage=shaded

```

### Actions beside a group

```tsx figure=GroupActions stage=shaded

```

## Anatomy

```tsx figure=DrawerAnatomy stage=shaded width="20"

```

1. **NavigationDrawer** (`env-navigation-drawer`)
2. **Header** (`env-navigation-drawer-header`, `header`)
3. **Item** (`env-navigation-drawer-item`)
4. **Label** (`env-navigation-drawer-label`)
5. **Count** (`env-navigation-drawer-count`, `count`)
6. **Group** (`env-navigation-drawer-section`, `group`)
7. **Heading** (`env-navigation-drawer-group-label`)
8. **Footer** (`env-navigation-drawer-footer`, `footer`)

```tsx figure=RailAnatomy stage=shaded

```

1. **NavigationRail** (`env-navigation-rail`)
2. **Header** (`env-navigation-rail-header`, `header`)
3. **Item** (`env-navigation-rail-item`)
4. **Indicator** (`env-navigation-rail-indicator`)
5. **Count** (`env-navigation-rail-count`, `count`)
6. **Label** (`env-navigation-rail-label`)
7. **Footer** (`env-navigation-rail-footer`, `footer`)

```tsx figure=BarAnatomy stage=shaded enlarge

```

1. **NavigationBar** (`env-navigation-bar`)
2. **Item** (`env-navigation-bar li:nth-child(2) > env-navigation-bar-item`)
3. **Indicator** (`env-navigation-bar-indicator`)
4. **Count** (`env-navigation-bar-count`, `count`)
5. **Label** (`env-navigation-bar-label`)

```tsx figure=SectionAnatomy stage=shaded

```

1. **Section** (`env-navigation-drawer-branch`)
2. **Item** (`env-navigation-drawer-row > env-navigation-drawer-item`)
3. **Section button** (`env-navigation-drawer-toggle`)
4. **Chevron** (`env-navigation-drawer-toggle > env-navigation-drawer-chevron`)
5. **Nested destinations** (`env-navigation-drawer-children`)

## Behaviour

### One list, three forms

```tsx figure=OneListThreeForms stage=shaded widths="54 44 24" sweep classes fit

```

### Nested sections

```tsx figure=NestedSections stage=shaded motion

```

### More than five

```tsx figure=MoreDestinations stage=shaded motion

```

### Resizable

```tsx figure=ResizableDrawer stage=shaded motion

```

### Adapting to width

```tsx figure=SharedWidth stage=shaded widths="36 20" sweep

```

## Accessibility

### Keyboard

| Key                                             | Action                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd> on the resize handle | Narrows or widens a resizable drawer a step; with <kbd>Shift</kbd>, more. |
| <kbd>Home</kbd>, <kbd>End</kbd> on the handle   | Resizes it to its smallest or largest width.                              |
