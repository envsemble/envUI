---
title: TopBar
summary: The bar at the top of an application or a screen, with start content, a title that truncates first and actions, which can stick, show page progress or be the window's title bar.
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
  - text: A whole frame to copy, or an installed application's window that draws its own title bar.
    see: app-frame
components:
  - TopBar
examples:
  AppTopBar:
    role: overview
    stage: shaded
  TitleBar: example
  TopBarAnatomy: anatomy
  TitleFirstToGo: example
  FewActions:
    role: do
    caption: Two or three actions, the account last.
  ManyActions:
    role: dont
    caption: 'Many actions: the title is cut down to nothing.'
---

# TopBar

## Variants

### Its background

The bar is a plain rectangle in the navigation's background, with no line below. On the page's background instead: see [Scaffold](scaffold.md#backgrounds).

### Title bar

The bar can be the window's own title bar in an installed web app: empty space drags the window, the title is centred and the controls are small.

- It then spans the whole Scaffold.

```tsx figure=TitleBar stage=shaded widths="40"

```

## Anatomy

```tsx figure=TopBarAnatomy stage=shaded

```

1. **Bar** (`env-top-bar`)
2. **Start** (`env-top-bar-start`, `start`)
3. **Title** (`env-top-bar-title`, `title`)
4. **Actions** (`env-top-bar-actions`, `actions`)

Not shown: the page progress.

## Behaviour

### Adapting to width

The bar never wraps: the title is cut short first, and the start content and actions keep their size.

```tsx figure=TitleFirstToGo stage=shaded widths="40 20" sweep

```

## Rules

The bar goes in a [Scaffold](scaffold.md)'s top bar region, the screen's banner, and keeps room for its title.

```tsx figure=FewActions stage=shaded

```

```tsx figure=ManyActions stage=shaded

```

### What goes where

The title names the application or the section.

- The navigation goes in the Scaffold's navigation region, not in the top bar.

## Accessibility

### envUI provides

- A plain element, which the Scaffold's banner region names; `render` gives it another element.
- The page progress as a named progress bar while it shows.
- In a title bar, controls that stay clickable where the window drags.

### You provide

- Names for icon-only buttons, such as Search or Back to projects.
- A `loadingLabel` that names what loads, in the application's language.

## Compose

### Usage

A TopBar holds, in reading order:

- `start` content before the title, such as a navigation or back IconButton or the application's mark;
- its `title`, the application's or the section's name, which is no heading and is cut short first;
- `actions` at the end, such as a search trigger and the account menu.

Put it in a Scaffold's top bar region, which is the banner landmark.

```tsx source=AppTopBar

```

#### Background

`background` is `default`, the navigation's background, as a plain rectangle with no line below, or `page`, which puts it on the page's background, opaque when it sticks, while the navigation keeps its own. On a surface, such as a Sheet, both take the surface's color.

#### Page progress

`loading` shows a thin bar along the bottom edge while the next page loads, after a short delay so quick loads never flash it. `loadingLabel` names it.

```tsx
// True while the next page loads from the server.
<TopBar title="Northwind" loading={loading} loadingLabel="Loading Projects" />
```

#### Title bar

`titleBar` makes the bar the window's own title bar in an installed web app that draws its own, through the Window Controls Overlay: empty space drags the window, it leaves room for the controls the system draws, the title is centred and the controls are small.

- Put it in a Scaffold with `topBarSpan="full"`.

```tsx
<TopBar
  titleBar
  title="Roadmap.md"
  start={<Menubar.Root aria-label="Application menu">…</Menubar.Root>}
  actions={<IconButton icon={<Share />} aria-label="Share" />}
/>
```

#### Outside a Scaffold

`sticky` keeps a bar outside a Scaffold at the top of the scrolling area as the document scrolls; in a Scaffold's top bar region it is unneeded, since the body scrolls under it.

- `render={<header />}` makes such a bar the page's banner; it is a `div` by default.

### Composition

The parts are the bar, `env-top-bar`, its start, `env-top-bar-start`, its title, `env-top-bar-title`, its actions, `env-top-bar-actions`, and the page progress, `env-top-bar-loading-bar`.

- Keep the navigation in the Scaffold's navigation region, and two or three actions in the bar, the account last.

## Changelog

- **1.0.0**: TopBar, which replaces AppShell.Header and WindowFrame.TitleBar, with `sticky`, `titleBar` and `loading`.
