---
title: Tabs
summary: Switches between panels of related content in one place, from a rail of buttons.
status: stable
since: 0.1.0
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
  - Related views of one subject in one place, such as a project's summary, details and activity.
  - Content that splits into sections people look at one at a time, such as the parts of a settings page.
  - Views that fill a region, such as a diagram's canvas and its outline (fill).
avoidWhen:
  - text: A filter or mode that changes the content below, such as a list's sort order or a chart's range.
    use: SegmentedControl
  - text: Open documents that people close, reorder and keep, as in an editor.
    use: DocumentTabs
  - text: An application's destinations, such as the pages in a sidebar.
    use: NavList
  - text: Sections people may want open at the same time.
    use: Disclosure
related:
  - segmented-control
  - document-tabs
  - nav-list
  - button
  - card
  - disclosure
components:
  - Tabs
---

# Tabs

## Overview

Tabs switch between panels of related content in one place, such as a project's summary, details and activity. You supply one button per tab; Tabs turns each into a tab linked to its panel, puts them on a rail above the panels and shows the selected panel. The selected tab keeps its button's look, its fill, label and states, and the other tabs are quiet labels on the rail.

The tabs are `items`, each a `value`, a `button`, the panel's `content` and whether it is `disabled`. Tabs owns the selection, the keyboard and the panels' transitions; the application owns anything else, such as keeping the selected tab in the URL.

```tsx example=ProjectViews

```

## Anatomy

1. **Rail** (the tab list): a pill on the translucent fill with 0.25 rem padding, the tabs 0.25 rem apart. It is as wide as its tabs, up to its container's width, and scrolls sideways when they don't fit; `listClassName` styles it.
2. **Tab** (`button` of an item): the selected tab shows its button as it is, such as a primary Button's fill; the others are transparent with a muted label. Material Symbols in the selected tab show filled.
3. **Panel** (`content` of an item): the selected item's content, 1 rem below the rail; `panelClassName` styles every panel.
4. **Focus rings**: a tab's ring, 0.125 rem inside it, and the panel's, 0.125 rem outside it, shown for keyboard focus.

## Variants and sizes

| Option                   | Use for                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `size="lg"`              | Most tabs: as tall as buttons, 2.5 rem, on a 3 rem rail, as tall as a `lg` control. The default.         |
| `size="sm"` or `"md"`    | Toolbars and bars: the rail is as tall as a `sm` or `md` control, as a SegmentedControl of that size is. |
| `orientation="vertical"` | A column of sections, such as a settings page's: the tabs fill the rail's width.                         |
| `fill`                   | Views that fill a region, such as a canvas: the selected panel takes the height left below the rail.     |

<!-- specimen: TabControls -->

- **Tab controls**: a tab is a Button in any variant, an IconButton or a NavList.Item without `href`. Prefer one variant for every tab of a rail; primary is Button's default. An icon-only tab needs an `aria-label`, and a NavList.Item takes its selected look while its tab is selected.
- **Unselected tabs** are transparent with a muted label at rest, and show a translucent state layer on hover and press; the selected tab keeps its variant's hover and pressed colors. Labels keep 4.5:1 contrast at rest and on hover in both themes.
- Tabs keep their size: labels wrap only within a tab, and a rail with more tabs than fit scrolls. The rail follows the app's [scale](../foundations/scale.md). On touch screens the rail grows to 2.75 rem, as every control of its row does, and each tab, at least as wide, takes presses across the rail's whole height; a vertical rail's tabs grow to 2.75 rem themselves.
- A vertical rail has the 1.75 rem corners of a surface. Its panels stay below it, as in every Tabs; lay out Tabs as a row to put them beside it.

## States and behaviour

- **Selection**: Tabs starts on `defaultValue`, or on the first enabled item. Pressing a tab selects it and calls `onValueChange`; for controlled tabs, pass `value` and update it from `onValueChange`.
- **Activation**: with `activation="automatic"`, the default, the arrow keys select the tab they move to. With `manual` they only move focus, and <kbd>Enter</kbd> or <kbd>Space</kbd> selects, for panels that take a moment to show.
- **Disabled**: a disabled item, or an item whose button is disabled, is dimmed and reports `aria-disabled`. The arrow keys still reach it, but neither they nor a press select it.
- **Panels**: only the selected panel shows. Without `keepMounted` the others unmount once they have faded out, losing their state; with it they stay mounted and hidden, so a draft or a scroll position survives switching. A panel is a tab stop of its own, after the rail.
- **Transitions**: the incoming panel fades in and rises 0.25 rem over 0.16 s, and the outgoing panel fades out of the layout, so content after the tabs moves once when the tab changes. Tab colors change over 0.16 s too. With reduced motion, panels and tabs change at once.
- **Fill**: with `fill`, the selected panel takes the height left below the rail and lays out its content as a column, so a child with `flex: 1` fills it. The tabs need a height, for example as a flex child of a region with one.
- **Custom layout**: `renderList` receives the rail and returns what renders in its place, such as the rail beside a heading in a Card. Render the rail once; the panels follow below.
- **Buttons only**: tabs are buttons. An item whose button has `href` throws an error; for destinations, use NavList.

## Content guidelines

- Name each tab after its panel with one or two words in sentence case, such as "Summary" or "Activity", and keep the names parallel.
- Name the tab list after what the tabs switch between, such as "Project views", with `aria-label`.
- Use a count in a tab, as a CounterBadge, only where it helps choose, such as open requests.
- Give an icon-only tab an `aria-label` that names its view, such as "Search view".

## Do and don't

### Do

- Use tabs for a few views of one subject; keep their order fixed.
- Use one button variant for all tabs of a rail.
- Use `keepMounted` where a panel holds work in progress, such as a form.
- Use manual activation where a panel loads data when it shows.

### Don't

- Don't use tabs to filter or sort one view; use a [SegmentedControl](../components/segmented-control.md).
- Don't use tabs for navigation between pages; use [NavList](../components/nav-list.md).
- Don't nest a control inside a tab's button, or a link as a tab.
- Don't hide content people need to compare in different tabs.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus into the rail, to the selected tab or the tab focused last, then on to the selected panel; the rail is one tab stop. |
| <kbd>←</kbd>, <kbd>→</kbd>                      | In a horizontal rail, moves focus to the previous or next tab, wrapping at the ends, and with automatic activation selects it.   |
| <kbd>↑</kbd>, <kbd>↓</kbd>                      | The same in a vertical rail.                                                                                                     |
| <kbd>Home</kbd>, <kbd>End</kbd>                 | Moves focus to the first or last tab, and with automatic activation selects it.                                                  |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Selects the focused tab, with manual activation.                                                                                 |

### envUI provides

- The tabs pattern: a `tablist` named by `aria-label`, with `aria-orientation` when vertical; `tab` buttons with `aria-selected` and `aria-controls`; and `tabpanel`s named by their tab.
- A roving tab stop: one tab of the rail is in the tab order, the selected one or the one focused last, and the arrow keys move between tabs.
- `aria-disabled` on disabled tabs, and the panels of other tabs hidden from everyone.
- A focusable panel, so keyboard and screen reader users reach its content right after the rail.
- The selected tab's filled Material Symbols, and the focus rings of tabs and panels.

### You provide

- An `aria-label` for every Tabs, and for every icon-only tab.
- Buttons as tabs, without controls inside them.
- A heading or a name inside a panel where it starts a section, since the tab's name is not a heading.
- The URL of the selected tab, where people should link to it or come back to it.

## Examples

### Manual activation

With `activation="manual"` the arrow keys move focus and <kbd>Enter</kbd> or <kbd>Space</kbd> selects, so a report loads only when chosen.

```tsx example=ManualActivation

```

### Small rail

`size="sm"` makes the rail as tall as a small control, for a toolbar or a bar; a CounterBadge fits inside a tab.

```tsx example=SmallRail

```

### Fill a region

With `fill` the selected panel takes the height left below the rail, here a region 16 rem tall.

```tsx example=FillARegion

```

### Vertical list

A vertical rail of NavList.Item tabs, with ↑ and ↓; the Tabs is laid out as a row to put the panels beside it.

```tsx example=VerticalList

```

### List beside a heading

`renderList` places the rail beside a heading inside a Card, and the panels follow below.

```tsx example=ListBesideAHeading

```

## Changelog

- **1.0.0**: The arrow keys follow the text direction, from EnvUIProvider's `dir` or the direction at the tabs; only the tab list takes it, so a panel keeps the direction around it. The tab and panel classes are `env-tabs-tab` and `env-tabs-panel` (were `env-tab` and `env-tab-panel`).
- **0.7.0**: `size="compact"`: the whole rail as tall as a compact control, for bars and toolbars.
- **0.5.0**: `fill`, for panels that fill a region. Labels in a selected tab keep 4.5:1 contrast on hover.
- **0.4.0**: Unselected tabs show translucent hover and press layers, and the rail's fill stays visible on panes.
- **0.3.0**: Content after the tabs moves once when the tab changes: the outgoing panel fades out of the layout.
- **0.1.0**: Tabs, with keyboard selection, animated panels and `renderList`.
