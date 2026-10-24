---
title: Tabs
summary: Switches between panels of related content in one place, from a row of text tabs.
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
  - Related views of one subject, such as a project's summary and activity
  - Sections people look at one at a time, such as a settings page's
  - Views that fill a region, such as a diagram's canvas and its outline
avoidWhen:
  - text: A filter or mode that changes the content below, such as a list's sort order or a chart's range.
    use: SegmentedControl
  - text: Open documents that people close, reorder and keep, as in an editor.
    use: DocumentTabs
  - text: An application's destinations, such as the pages in a sidebar.
    use: Drawer
  - text: Sections people may want open at the same time, one under another.
    use: Accordion
components:
  - Tabs
---

# Tabs

## Overview

```tsx example=ProjectViews

```

### Manual activation

The arrow keys select the tab they reach. Tabs can instead only move focus there, and <kbd>Enter</kbd> or <kbd>Space</kbd> selects, for a panel that loads when it shows.

```tsx example=ManualActivation

```

### Keep panels mounted

Only the selected panel shows. The others can stay ready while hidden, so a draft or a scroll position survives switching.

## Variants

### Sizes

| Size             | Use for                                               |
| ---------------- | ----------------------------------------------------- |
| Large            | Most tabs, as tall as buttons. The default.           |
| Small and medium | Toolbars and bars, as tall as a control of that size. |

```tsx example=SmallRail caption="Small tabs, with a count in a tab."

```

### Vertical

A column of tabs beside their panels, for the sections of a settings page.

```tsx example=VerticalList

```

### Fill a region

The selected panel takes the height left below the tabs, for a view such as a canvas.

```tsx example=FillARegion

```

### Beside a heading

The tabs can share a row with a heading, with their panels below.

```tsx example=ListBesideAHeading

```

## When to use

```tsx do=RelatedViews caption="Tabs for views of one subject, in any order."

```

```tsx dont=StepsAsTabs caption="Steps that go in order: nothing leads to the next one."

```

### One panel at a time

Keep content people compare in one panel. Every tab is a button that shows its panel, never a link to another page.

## Anatomy

```tsx anatomy=TabsAnatomy

```

1. **Tabs** (`env-tabs`)
2. **Rail** (`env-tabs-list`)
3. **Tab** (`env-tabs-tab`, `button`)
4. **Panel** (`env-tabs-panel`, `content`)

### Colors

One set of tabs can take colors of its own: the rail behind them, the labels, the selected label and its indicator. Its hover, focus and press then follow them; with none set, it keeps its own colors.

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

## In code

### Usage

Tabs takes `items`, each a `TabsItem` with its `value`, its `button`, which becomes the tab, and the panel's `content`; `disabled` dims a tab and reports `aria-disabled`, and the arrow keys still reach it. The button is a Button, an IconButton or a component that forwards native button props and its ref, never a link, and every tab is a text tab, whatever its button's variant. `aria-label` names the tab list. Leave the tabs uncontrolled, starting on `defaultValue`, the first enabled tab by default, or control them with `value` and `onValueChange`.

```tsx source=ProjectViews

```

#### Activation and mounting

`activation` is `automatic`, the default, which selects a tab as the arrow keys reach it, or `manual`, where <kbd>Enter</kbd> or <kbd>Space</kbd> selects. Only the selected panel is mounted; `keepMounted` keeps the others mounted and hidden, so their state survives switching.

```tsx source=ManualActivation

```

#### Size, orientation and fill

`size` is `sm`, `md` or `lg`, the default, whose tabs are as tall as medium buttons. `orientation` is `horizontal`, the default, or `vertical`, a column moved through with <kbd>↑</kbd> and <kbd>↓</kbd>; the panels stay below the list either way, so lay the Tabs out as a row through `style` to put a vertical list beside them. With `fill`, the selected panel takes the height left below the list; give the Tabs a height, for example as a flex child.

```tsx source=VerticalList

```

#### A layout of your own

`renderList` places the tab list in a layout of your own, such as beside a heading: it receives the list and returns what to render in its place, with the list in it once; the panels stay below. `listClassName` and `panelClassName` add classes to the list and to every panel.

```tsx source=ListBesideAHeading

```

### Composition

The parts are the tabs, `env-tabs`, with `data-fill` when they fill a region; the rail, `env-tabs-list`, with `data-orientation="vertical"` in a column; each tab, `env-tabs-tab`, with `data-active` while selected; and the panels, `env-tabs-panels`, each an `env-tabs-panel`. Keep the selected tab in the URL where people should link to it.

### Customize

`--env-tabs-container`, `--env-tabs-content`, `--env-tabs-selected-content` and `--env-tabs-indicator` set the colors of one Tabs, through `style` or CSS. The rail has no fill unless `--env-tabs-container` sets one. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0-prerelease.2**: Tabs look like Material's: text tabs on no fill, whatever their buttons' variants, the selected one in the accent's text color with an indicator under it, so they read differently from SegmentedControl. `--env-tabs-selected-content` and `--env-tabs-indicator` set those colors, and the rail has no fill unless `--env-tabs-container` sets one. The API stays.
- **1.0.0**: The arrow keys follow the text direction, from EnvUIProvider's `dir` or the direction at the tabs; only the tab list takes it, so a panel keeps the direction around it. The tab and panel classes are `env-tabs-tab` and `env-tabs-panel` (were `env-tab` and `env-tab-panel`).
- **0.7.0**: `size="compact"`: the whole rail as tall as a compact control, for bars and toolbars.
- **0.5.0**: `fill`, for panels that fill a region. Labels in a selected tab keep 4.5:1 contrast on hover.
- **0.4.0**: Unselected tabs show translucent hover and press layers, and the rail's fill stays visible on panes.
- **0.3.0**: Content after the tabs moves once when the tab changes: the outgoing panel fades out of the layout.
- **0.1.0**: Tabs, with keyboard selection, animated panels and `renderList`.
