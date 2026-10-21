---
title: Scaffold
summary: The invisible structure of an application's screen, with a top bar region, the navigation and the body, which shows the navigation form that fits its own width and keeps the bars in view as the page scrolls.
status: beta
since: 1.0.0
category: Layout & surfaces
aliases:
  - AppShell
  - app shell
  - app frame
  - application frame
  - app layout
  - shell
  - frame
  - layout
  - skip links
  - WindowFrame
useWhen:
  - An application's screen, with a top bar, its navigation and the page people are on.
  - A window without navigation, such as a start page, with its title bar above the body.
avoidWhen:
  - text: A readable column for a page's content, with its gutters.
    use: Page
  - text: Two panes side by side inside the body, such as a list and its detail.
    use: Panes
  - text: Rows, columns and grids inside a page.
    use: Grid
related:
  - top-bar
  - page
  - panes
  - app-frame
  - window-frame
  - responsive
components:
  - Scaffold
  - resolveNavigationForms
---

# Scaffold

## Overview

Scaffold is the invisible structure of an application's screen: a top bar, the navigation and the body. It never paints; the components in its regions do. It shows the navigation form that fits its own width, the [Bar](bar.md), the [Rail](rail.md) or the [Drawer](drawer.md), so give it all three with the same destinations.

```tsx example=NavigationForms stage=shaded

```

Render one Scaffold at the application's root, around the router's outlet, with the current page, usually a [Page](page.md) or [Panes](panes.md), as its children. The [app frame](../patterns/app-frame.md) pattern puts it together.

## Variants

### Navigation by window class

| Window class | Width of the Scaffold | Form     |
| ------------ | --------------------- | -------- |
| compact      | below 37.5 rem        | `bar`    |
| medium       | 37.5 to 52.5 rem      | `rail`   |
| expanded     | 52.5 to 75 rem        | `drawer` |
| large        | from 75 rem           | `drawer` |

`forms` changes the form of a window class, or shows `none`. Where a window class asks for a form the application didn't give, the nearest given one shows.

```tsx example=ChooseForms stage=shaded caption="A drawer only, and none on a compact width: forms={{ compact: 'none' }}."

```

### A title bar across

`topBarSpan="full"` runs the top bar across the whole width, above the rail or the drawer, as a window's title bar needs.

```tsx example=TitleBarAcross stage=shaded

```

### Backgrounds

The navigation and the top bar each fill a plain rectangle with the navigation's background, flush with the window's edges and the body, with no line between them. `background="none"` on one of them turns its own off, such as a top bar on the page beside a drawer with its background.

```tsx example=TopBarOnThePage stage=shaded

```

### Scrolling

By default the document scrolls, as on any website: the top bar, the bar and the rail or the drawer stay in view, and phones keep their address bar, pull to refresh and scroll restoration. With `scroll="body"` the body alone scrolls under the top bar, for a preview, an embedded frame or panes that scroll on their own; give the Scaffold a block size then, as these examples do.

## When to use

```tsx do=ActionsInPageHeader stage=shaded caption="The page's title and actions in its PageHeader."

```

```tsx dont=ActionsInTopBar stage=shaded caption="The page's title and action in the top bar: the page has no heading."

```

- One Scaffold at the root, kept mounted as the pages change; a part of a page with panes is [Panes](panes.md).
- Pass the forms and let the Scaffold choose; don't pick a form in script from the window's width.

## Anatomy

```tsx anatomy=ScaffoldAnatomy stage=shaded

```

1. **Root** (`env-scaffold`)
2. **Top bar** (`env-scaffold-top-bar`, `topBar`)
3. **Navigation** (`env-scaffold-rail`, `navigation`)
4. **Body** (`env-scaffold-body`, `children`)

Not shown: the skip links, `env-scaffold-skip-links`, and the bar's and drawer's slots, `env-scaffold-bar` and `env-scaffold-drawer`.

## Adapting to width

The Scaffold queries its own width, in CSS: the bar on a compact width, the rail on a medium one and the drawer from expanded. Focus in a form that hides moves to the form that shows.

```tsx example=FormsByWidth stage=shaded widths="24 44 60"

```

## Accessibility

### Keyboard

| Key                                                         | Action                                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <kbd>Tab</kbd> on a fresh page                              | Shows Skip to content, then Skip to navigation.                                   |
| <kbd>Enter</kbd> on a skip link                             | Moves focus to the body, or to the navigation form that shows.                    |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd>  | Scroll the page; with `scroll="body"`, the body, also with focus on the document. |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | The same, unless a field or a widget that uses the key has focus.                 |

### envUI provides

- The top bar as the banner and the body as the main landmark; `landmarks={false}` renders divs and no skip links, for a preview inside another page.
- Skip links, named in the provider's language.
- Only the form that shows in the accessibility tree and the tab order.

### You provide

- The navigation forms, each a named `nav`, with the current destination marked.
- The page's one `h1`, usually its PageHeader's title, and focus and `document.title` after a navigation.

## Changelog

- **1.0.0**: Scaffold, which replaces AppShell and WindowFrame: a top bar region, the navigation forms by window class, and the body, with the document or the body scrolling.
