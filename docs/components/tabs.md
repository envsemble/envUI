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
    use: Drawer
  - text: Sections people may want open at the same time.
    use: Disclosure
components:
  - Tabs
---

# Tabs

## Overview

Tabs switch between panels of related content in one place. Each item gives a `button`, which becomes the tab, and the panel's `content`; the selected tab keeps its button's look.

```tsx example=ProjectViews

```

### Manual activation

By default the arrow keys select the tab they reach. With `activation="manual"` they only move focus and <kbd>Enter</kbd> or <kbd>Space</kbd> selects, for a panel that loads when it shows.

```tsx example=ManualActivation

```

### Keep panels mounted

Only the selected panel shows. With `keepMounted` the others stay mounted and hidden, so a draft or a scroll position survives switching.

## Variants

| Option                   | Use for                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `size="lg"`              | Most tabs, as tall as buttons. The default.                         |
| `size="sm"` or `"md"`    | Toolbars and bars, as tall as a control of that size.               |
| `orientation="vertical"` | A column of sections, such as a settings page's.                    |
| `fill`                   | Views that fill a region: the selected panel takes the height left. |

```tsx example=SmallRail caption="size sm, with a count in a tab."

```

```tsx example=VerticalList caption="A vertical rail, with the Tabs laid out as a row."

```

```tsx example=FillARegion caption="fill: the panel takes the height left below the rail."

```

```tsx example=ListBesideAHeading caption="renderList places the rail beside a heading."

```

## When to use

```tsx do=RelatedViews caption="Tabs for views of one subject, in any order."

```

```tsx dont=StepsAsTabs caption="Steps that go in order: nothing leads to the next one."

```

- One button variant for every tab of a rail; tabs are buttons, never links.
- Content people compare stays in one panel.

## Anatomy

```tsx anatomy=TabsAnatomy

```

1. **Tabs** (`env-tabs`)
2. **Rail** (`env-tabs-list`)
3. **Tab** (`env-tabs-tab`, `button`)
4. **Panel** (`env-tabs-panel`, `content`)

## Adapting to width

Tabs keep their size: a rail with more tabs than fit scrolls sideways.

```tsx example=ScrollingRail widths="20 40"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into the rail, to the selected tab or the one focused last, then on to the panel.                      |
| <kbd>←</kbd>, <kbd>→</kbd>                      | In a horizontal rail, moves to the previous or next tab, wrapping, and with automatic activation selects it. |
| <kbd>↑</kbd>, <kbd>↓</kbd>                      | The same in a vertical rail.                                                                                 |
| <kbd>Home</kbd>, <kbd>End</kbd>                 | Moves to the first or last tab, and with automatic activation selects it.                                    |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Selects the focused tab, with manual activation.                                                             |

### envUI provides

- A `tablist` with `tab`s and `tabpanel`s, `aria-selected`, `aria-controls` and `aria-orientation`.
- One tab stop in the rail, and the arrow keys between tabs, in the text direction.
- `aria-disabled` on disabled tabs, which the arrow keys reach but don't select.
- A focusable panel after the rail.

### You provide

- An `aria-label` on every Tabs and every icon-only tab.
- A heading inside a panel where it starts a section.
- The selected tab in the URL, where people should link to it.

## Changelog

- **1.0.0**: The arrow keys follow the text direction, from EnvUIProvider's `dir` or the direction at the tabs; only the tab list takes it, so a panel keeps the direction around it. The tab and panel classes are `env-tabs-tab` and `env-tabs-panel` (were `env-tab` and `env-tab-panel`).
- **0.7.0**: `size="compact"`: the whole rail as tall as a compact control, for bars and toolbars.
- **0.5.0**: `fill`, for panels that fill a region. Labels in a selected tab keep 4.5:1 contrast on hover.
- **0.4.0**: Unselected tabs show translucent hover and press layers, and the rail's fill stays visible on panes.
- **0.3.0**: Content after the tabs moves once when the tab changes: the outgoing panel fades out of the layout.
- **0.1.0**: Tabs, with keyboard selection, animated panels and `renderList`.
