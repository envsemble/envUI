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
  - Sections people look at one at a time, such as a settings page's
  - Views that fill a region, such as a diagram's canvas and its outline
avoidWhen:
  - text: A filter or mode that changes the content below, such as a list's sort order or a chart's range.
    use: SegmentedControl
  - text: Open documents that people close, reorder and keep, as in an editor.
    use: DocumentTabs
  - text: An application's destinations, such as the pages in a sidebar.
    use: NavigationDrawer
  - text: Sections people may want open at the same time, one under another.
    use: Accordion
components:
  - Tabs
examples:
  ProjectViews: overview
  SmallRail:
    role: example
    caption: Small tabs, with a count in a tab.
  VerticalList: example
  FillARegion: example
  ListBesideAHeading: example
  TabsAnatomy: anatomy
  ScrollingRail: example
  StepsAsTabs:
    role: dont
    caption: 'Steps that go in order: nothing leads to the next one.'
---

# Tabs

## Variants

### Sizes

| Size             | Use for                                               |
| ---------------- | ----------------------------------------------------- |
| Large            | Most tabs, as tall as buttons. The default.           |
| Small and medium | Toolbars and bars, as tall as a control of that size. |

```tsx figure=SmallRail

```

### Vertical

A column of tabs beside their panels, for the sections of a settings page.

```tsx figure=VerticalList

```

### Fill a region

The selected panel takes the height left below the tabs, for a view such as a canvas.

```tsx figure=FillARegion

```

### Beside a heading

The tabs can share a row with a heading, with their panels below.

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

A tab shows its panel as soon as the arrow keys reach it.

- Where a panel takes a while to load, a tab can wait to be pressed instead.
- A disabled tab is dimmed: the arrow keys reach it but don't choose it.

<!-- specimen: ChoosingATab -->

### Adapting to width

Tabs keep their size. A rail with more tabs than fit scrolls sideways.

```tsx figure=ScrollingRail widths="40 20" motion

```

## Rules

Tabs show views of one subject, one panel at a time.

```tsx figure=StepsAsTabs

```

### One panel at a time

Keep content people compare in one panel.

- Every tab is a button that shows its panel, never a link to another page.

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

## Compose

### Usage

```tsx
<Tabs
  aria-label="Project"
  defaultValue="summary"
  items={[
    { value: 'summary', label: 'Summary', content: <Summary /> },
    { value: 'activity', label: 'Activity', content: <Activity /> },
  ]}
/>
```

Each `TabsItem` has its `value`, the panel's `content`, and its `label` with an optional `icon`, or a `button` of your own, which becomes the tab.

- `disabled` dims a tab and reports `aria-disabled`.
- A `button` is a Button, an IconButton or a component that forwards native button props and its ref, never a link. Every tab is a text tab, whatever its button's variant.
- `aria-label` names the tab list.
- Leave the tabs uncontrolled, starting on `defaultValue`, the first enabled tab by default, or control them with `value` and `onValueChange`.

#### Activation and mounting

```tsx
<Tabs aria-label="Reports" activation="manual" keepMounted items={reports} />
```

`activation` is `automatic`, the default, which selects a tab as the arrow keys reach it, or `manual`, where <kbd>Enter</kbd> or <kbd>Space</kbd> selects, for panels that load when chosen, such as a report from a server. Only the selected panel is mounted; `keepMounted` keeps the others mounted and hidden, so their state survives switching.

#### Size, orientation and fill

`size` is `sm`, `md` or `lg`, the default, whose tabs are as tall as medium buttons.

- `orientation` is `horizontal`, the default, or `vertical`, a column moved through with <kbd>↑</kbd> and <kbd>↓</kbd>, whose tabs are as tall as medium controls unless `size` is `sm`. The panels stay below the list either way: to put a vertical list beside them, lay the Tabs out as a row through `style`, as the VerticalList example does.
- With `fill`, the selected panel takes the height left below the list. Give the Tabs a height, for example as a flex child.
- A horizontal list lines its first label up with the content's edge, so the first tab's padding, where its focus ring shows, reaches into the space before it. Leave that room where the Tabs sit flush against an edge that clips.

#### A layout of your own

`renderList` places the tab list in a layout of your own, such as beside a heading: it receives the list and returns what to render in its place, with the list in it once; the panels stay below. `listClassName` and `panelClassName` add classes to the list and to every panel.

```tsx
<Tabs
  aria-label="Orders"
  items={items}
  renderList={(list) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text render={<h3 />} variant="title">
        Orders
      </Text>
      {list}
    </div>
  )}
/>
```

### Composition

The tabs, `env-tabs`, carry `data-fill` when they fill a region; the rail, `env-tabs-list`, `data-orientation="vertical"` in a column; each tab, `env-tabs-tab`, `data-active` while selected. The panels sit in `env-tabs-panels`, each an `env-tabs-panel`.

### Customize

The rail has no fill unless its container color sets one.

## Changelog

- **1.0.0**: The arrow keys follow the text direction, from EnvUIProvider's `dir` or the direction at the tabs; only the tab list takes it, so a panel keeps the direction around it. The tab and panel classes are `env-tabs-tab` and `env-tabs-panel` (were `env-tab` and `env-tab-panel`).
- **1.0.0-prerelease.6**: A vertical rail's tabs are as tall as a medium control, like other navigation rows; a small rail keeps its smaller tabs.
- **1.0.0-prerelease.6**: The labels of the tabs not selected are a step stronger than the muted text, so a disabled tab stands apart from them.
- **1.0.0-prerelease.6**: Under the pointer and pressed, a tab shows no fill: its label takes the text color and a faint underline stands where the indicator would, so the indicator alone marks the selected tab.
- **1.0.0-prerelease.5**: An item takes a `label` and an `icon`, as SegmentedControl's do; `button` is for a control of your own.
- **1.0.0-prerelease.2**: Tabs look like Material's: text tabs on no fill, whatever their buttons' variants, the selected one in the accent's text color with an indicator under it, so they read differently from SegmentedControl. `--env-tabs-selected-content` and `--env-tabs-indicator` set those colors, and the rail has no fill unless `--env-tabs-container` sets one. The API stays.
