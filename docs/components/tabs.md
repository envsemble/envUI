---
title: Tabs
summary: Switches between panels of related content in one place.
status: stable
since: 1.0.0
category: Navigation
aliases:
  - tab bar
  - tab list
  - tablist
  - tab strip
  - tab panel
  - TabPanel
  - TabsItem
  - view switcher
useWhen:
  - Related views of one subject, such as a project's summary and activity
  - Views that fill a region, such as a diagram's canvas and its outline
avoidWhen:
  - text: A filter or mode that changes the content below, such as a sort order.
    use: SegmentedControl
  - text: Open documents that people close, reorder and keep, as in an editor.
    use: DocumentTabs
  - text: An application's destinations, or a side list of a page's sections.
    use: NavigationDrawer
components:
  - Tabs
examples:
  ProjectViews: overview
  SmallRail: example
  FillARegion: example
  ListBesideAHeading: example
  TabsAnatomy: anatomy
  ScrollingRail: example
---

# Tabs

## Variants

### Sizes

```tsx figure=SmallRail

```

### Fill a region

```tsx figure=FillARegion

```

### Beside a heading

```tsx figure=ListBesideAHeading

```

## Anatomy

```tsx figure=TabsAnatomy

```

1. **Tabs** (`env-tabs`)
2. **Rail** (`env-tabs-list`)
3. **Tab** (`env-tabs-tab`, `label`, `icon` or `button`)
4. **Panel** (`env-tabs-panel`, `content`)

## Behaviour

### Choosing a tab

<!-- specimen: ChoosingATab -->

### Adapting to width

```tsx figure=ScrollingRail widths="40 20" motion

```
