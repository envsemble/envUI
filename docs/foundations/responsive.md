---
title: Adapting to width
summary: Components follow the space they sit in, and four window classes name where a layout changes.
components:
  - useContainerSize
  - windowClassOf
statuses: # Never released before 1.0, so beta until a release has used them.
  useContainerSize: beta
  windowClassOf: beta
aliases:
  - window class
  - window classes
  - size class
  - breakpoint
  - breakpoints
  - compact
  - medium
  - expanded
  - large
  - media query
  - responsive
  - mobile layout
  - container query
  - container size
  - element size
  - resize observer
  - z-index
  - stacking order
  - layers
avoidWhen:
  - text: How space groups things, and the compact scale.
    see: spacing
  - text: Two panes that sit side by side once there is room.
    use: Panes
  - text: A readable column whose gutters follow the window class.
    use: Page
  - text: A task over the page, sized to the window.
    use: Dialog
  - text: A list of actions that opens over the page.
    use: Menu
  - text: A short label over the page.
    use: Tooltip
  - text: A notification over the page.
    use: ToastProvider
examples:
  Widths: example
  TextSize: example
---

# Adapting to width

## Options

Four window classes name where a layout changes: compact, such as a phone; medium, such as a tablet held upright; expanded, such as a tablet held sideways or a laptop; and large, a desktop window. They follow the reader's text size.

## Behaviour

Components lay themselves out for the space they sit in, not for the screen: in a narrow pane a component looks as it does on a phone. Popups size themselves to the window they open in.

```tsx figure=Widths

```

1. **In a narrow pane**: The actions move under the name, and each label sits above its value.
2. **With room to spare**: The same components spread out: the actions beside the name, labels beside values.

```tsx figure=TextSize

```

## Rules

Lay a screen out for the compact class first, and spread it out from a class up.

## Compose

### Usage

envUI has no width media queries: query a container. The outermost theme boundary is the container `env-window`, so a query on it measures the window class; `container="env-window"` on a primitive makes a region a window of its own. CSS can't read a token inside a query, so write the width.

```css
@container env-window (width >= 52.5rem) {
  .projects {
    grid-template-columns: 1fr 1fr;
  }
}
```

`useContainerSize` and `windowClassOf` are for what CSS can't do, such as rendering something else in a narrow panel.

### Customize

Values at the default 16 px root.

#### Window classes

| Token                         | Comfortable | Compact   | Use                                                                                                                            |
| ----------------------------- | ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--env-window-class-medium`   | `37.5rem`   | `37.5rem` | 37.5 rem: where medium starts, such as a tablet held upright or a narrow desktop window; narrower is compact, such as a phone. |
| `--env-window-class-expanded` | `52.5rem`   | `52.5rem` | 52.5 rem: where expanded starts, such as a tablet held sideways.                                                               |
| `--env-window-class-large`    | `75rem`     | `75rem`   | 75 rem: where large starts, such as a desktop window.                                                                          |

#### Layout

| Token                           | Comfortable                 | Compact                     | Use                                                                                                                                                                                                                                                                  |
| ------------------------------- | --------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env-dialog-width-lg`         | `44rem`                     | `44rem`                     | The width of a Dialog at width lg: 44 rem, never more than the window less its gutters.                                                                                                                                                                              |
| `--env-dialog-width-md`         | `28rem`                     | `28rem`                     | The width of a Dialog at width md, its default: 28 rem, never more than the window less its gutters.                                                                                                                                                                 |
| `--env-navigation-drawer-width` | `17.5rem`                   | `17.5rem`                   | The width a resizable NavigationDrawer starts at, 17.5 rem; on a resizable drawer, the width it has now.                                                                                                                                                             |
| `--env-navigation-rail-width`   | `5rem`                      | `5rem`                      | The width of a NavigationRail: 5 rem.                                                                                                                                                                                                                                |
| `--env-page-gutter`             | `1rem`                      | `0.75rem`                   | The space a Page keeps at its inline edges in a compact region: spacing step 4. A Page whose container is 37.5 rem or wider keeps spacing step 5, and a Page without a gutter none; inside a Page this property is the gutter it keeps, so content lines up with it. |
| `--env-page-width-lg`           | `76rem`                     | `76rem`                     | The width of a Page's column at width lg, its default: 76 rem.                                                                                                                                                                                                       |
| `--env-page-width-md`           | `60rem`                     | `60rem`                     | The width of a Page's column at width md, for reading: 60 rem.                                                                                                                                                                                                       |
| `--env-page-width-sm`           | `40rem`                     | `40rem`                     | The width of a Page's column at width sm, for a form or settings: 40 rem.                                                                                                                                                                                            |
| `--env-panes-other-min`         | `16rem`                     | `16rem`                     | The least width the other pane of Panes keeps beside the sized one: 16 rem.                                                                                                                                                                                          |
| `--env-panes-size`              | `22.5rem`                   | `22.5rem`                   | The width of the sized pane of Panes, until people resize it: 22.5 rem; on Panes, the width it has now.                                                                                                                                                              |
| `--env-sheet-width-lg`          | `44rem`                     | `44rem`                     | The width of a side Sheet at width lg, for content-heavy tasks: 44 rem.                                                                                                                                                                                              |
| `--env-sheet-width-md`          | `24rem`                     | `24rem`                     | The width of a side Sheet at width md, its default, for details and filters: 24 rem.                                                                                                                                                                                 |
| `--env-title-bar-height`        | `2.5rem`                    | `2rem`                      | A window title bar drawn by the application, which holds controls of size sm.                                                                                                                                                                                        |
| `--env-top-bar-height`          | `3.25rem`                   | `2.625rem`                  | TopBar's height: a single row that holds controls of the control height with space around them.                                                                                                                                                                      |
| `--env-viewport-gutter`         | `clamp(0.75rem, 2vw, 1rem)` | `clamp(0.75rem, 2vw, 1rem)` | The least space between the window's edge and a dialog, the command palette or rich text suggestions: 0.75 to 1 rem, with the window.                                                                                                                                |

#### Stacking order

| Token              | Comfortable | Compact | Use                                                                                                                                                                                                                                                     |
| ------------------ | ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env-z-base`     | `0`         | `0`     | The flow of a page or a component; a part drawn behind its siblings takes calc(var(--env-z-base) - 1).                                                                                                                                                  |
| `--env-z-raised`   | `1`         | `1`     | A part raised over its siblings inside a component or a region: a sticky table header, a resize handle, the hovered avatar of a group.                                                                                                                  |
| `--env-z-sticky`   | `20`        | `20`    | Sticky parts that content scrolls under: a sticky TopBar or PageHeader.                                                                                                                                                                                 |
| `--env-z-backdrop` | `90`        | `90`    | A backdrop in the page that covers the page and the frame, under the modal layers.                                                                                                                                                                      |
| `--env-z-modal`    | `100`       | `100`   | Modal layers and their backdrops: dialogs, sheets and the command palette. Each draws its backdrop and then its surface at this level, in the order they open, so one opened over another, such as a Dialog from a Sheet, covers it, backdrop included. |
| `--env-z-popup`    | `110`       | `110`   | Popups anchored to a control, also inside a modal layer: menus, popovers, hover cards, the lists of Select and Combobox, and suggestions.                                                                                                               |
| `--env-z-toast`    | `120`       | `120`   | Notifications, above the popups and modal layers they report on.                                                                                                                                                                                        |
| `--env-z-tooltip`  | `130`       | `130`   | Tooltips, above everything they can describe.                                                                                                                                                                                                           |
