---
title: TopBar
summary: The bar at the top of an app or a screen, with a title and actions.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - top app bar
  - app bar
  - header
  - toolbar at the top
  - title bar
  - AppShell.Header
  - WindowFrame.TitleBar
  - page progress
useWhen:
  - The top of an application's screen, with its name, search and the account menu
  - The bar inside a window frame, as the window's own title bar
avoidWhen:
  - text: A page's own title, description and actions.
    use: PageHeader
  - text: A row of actions inside a page.
    use: Toolbar
  - text: Desktop menus such as File and Edit across the top.
    use: Menubar
components:
  - TopBar
examples:
  AppTopBar:
    role: overview
    stage: shaded
  TitleBar: example
  TopBarAnatomy: anatomy
  TitleFirstToGo: example
---

# TopBar

## Variants

### Title bar

```tsx figure=TitleBar stage=shaded widths="40"

```

## Anatomy

```tsx figure=TopBarAnatomy stage=shaded

```

1. **Bar** (`env-top-bar`)
2. **Start** (`env-top-bar-start`, `start`)
3. **Title** (`env-top-bar-title`, `title`)
4. **End** (`env-top-bar-end`, `end`)

## Behaviour

### Adapting to width

```tsx figure=TitleFirstToGo stage=shaded widths="40 20" sweep

```
