---
title: Scaffold
summary: The invisible structure of an application's screen, with a top bar region, the navigation and a body that scrolls, which shows the navigation form that fits its own width.
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
  - A window without navigation, such as a start page, with its title bar above a body that scrolls.
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

Scaffold is the invisible structure of an application's screen, after Material's scaffold: a top bar region, a navigation region and the body. It never paints; the components in its regions do. It owns the scrolling, so the body scrolls under the top bar while the navigation stays in place, and it changes arrangement by its own width, in CSS, so the server's markup is right before any script runs and nothing is measured.

The application gives it the navigation forms it wants, each the same destinations in another component: `navigation={{ bar, rail, drawer }}`. The Scaffold shows one at a time, by the window class of its own width: the bar at the bottom of a compact width, the rail at the start of a medium one and the drawer at the start from expanded.

```tsx example=NavigationForms

```

Render one Scaffold at the application's root, around the router's outlet, with the current page, usually a [Page](page.md) or [Panes](panes.md), as its children. The [app frame](../templates/app-frame.md) template is the reference for an application's frame, and the [window frame](../patterns/window-frame.md) pattern for a window that draws its own title bar.

## Anatomy

1. **Root** (`env-scaffold`): a grid that fills its container's height, `100dvh` by default, and the `env-scaffold` size container; `data-compact`, `data-medium`, `data-expanded` and `data-large` name the form each window class shows. `name` renders as `data-env-name`.
2. **Skip links** (`env-scaffold-skip-links`): Skip to content, then Skip to navigation where a form shows; hidden until focused, the first tab stops.
3. **Top bar** (`env-scaffold-top-bar`, `topBar`): the banner landmark, above the body and beside the navigation, or across the whole width with `topBarSpan="full"`. Usually a [TopBar](top-bar.md).
4. **Navigation** (`env-scaffold-navigation`, `navigation`): a slot for each form, `env-scaffold-bar` across the bottom and `env-scaffold-rail` and `env-scaffold-drawer` at the start, each as tall as the screen and scrolling on its own.
5. **Body** (`env-scaffold-body`, `children`): the main landmark, `bodyId` (`main` by default), which scrolls with a stable gutter.

## Variants and sizes

| Window class | Width of the Scaffold | Form by default | Where         |
| ------------ | --------------------- | --------------- | ------------- |
| compact      | below 37.5 rem        | `bar`           | At the bottom |
| medium       | 37.5 to 52.5 rem      | `rail`          | At the start  |
| expanded     | 52.5 to 75 rem        | `drawer`        | At the start  |
| large        | from 75 rem           | `drawer`        | At the start  |

- `forms` changes the form of any window class, or shows `none`, such as `{ compact: 'none' }` for an application that opens its navigation from the top bar on a phone.
- Where a window class asks for a form the application didn't give, the nearest given form shows: a rail for a drawer and the other way round, then the bar. Given only a drawer, the drawer shows at every width. `resolveNavigationForms(navigation, forms)` returns the form of each window class, as the Scaffold works it out.
- `topBarSpan="body"`, the default, puts the top bar beside the rail or drawer, which run the full height; `"full"` runs it across the whole width, above them, as a window's title bar needs.

## States and behaviour

- **Scrolling**: the body scrolls, not the document. The top bar and the navigation stay in place, sticky content in the body, such as a sticky PageHeader, sticks at the body's top, and each region keeps its own scroll position. The Scaffold fills its container, so a preview or an embedded application gives it a block size of its own, such as `style={{ blockSize: '24rem' }}`.
- **Keyboard scrolling**: with focus on the document, Page Up, Page Down, Space, Home, End and the arrows scroll the body as they would the document; fields, widgets that use the keys, and what scrolls by itself keep them.
- **Arrangement**: only CSS decides which form shows, by container queries on the Scaffold's own width at 37.5, 52.5 and 75 rem; a Scaffold in a narrow frame shows the bar however wide the window is.
- **Safe areas**: the top bar keeps clear of the top safe area, the bar or else the body of the bottom one, and the Scaffold of the left and right ones, under `viewport-fit=cover`.
- **PanelDock**: a PanelDock placed directly in the body lies over the body's visible area and stays there as it scrolls.
- **Toasts** keep their own viewport; a floating button or a bottom action bar goes in the body.

## Do and don't

### Do

- Render one Scaffold at the application's root, and keep it mounted as the pages change.
- Give the same destinations to every form you pass, so people find them at every width.
- Put the page's own heading and actions in its PageHeader, not in the top bar.

### Don't

- Don't nest a Scaffold in another's body; a part of a page with panes is [Panes](panes.md).
- Don't paint the regions with your own backgrounds where a component paints them, such as TopBar.
- Don't decide the navigation's form in script from the window's width; pass the forms and let the Scaffold choose.

## Accessibility

### Keyboard

| Key                                                         | Action                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| <kbd>Tab</kbd> on a fresh page                              | Shows Skip to content, then Skip to navigation.                          |
| <kbd>Enter</kbd> on a skip link                             | Moves focus to the body, or to the navigation form that shows.           |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd>  | Scroll the body, with focus on the document as with focus in the body.   |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | Scroll the body, unless a field or a widget that uses the key has focus. |

### envUI provides

- The landmarks: the top bar region is the banner and the body the main; `landmarks={false}` renders divs, for a preview inside another page's main.
- The skip links, named in the provider's language, which move focus without scrolling the body under the top bar.
- Only the form that shows is in the accessibility tree and the tab order; the others are `display: none`.

### You provide

- The navigation forms, each a named `nav` landmark, such as the navigation Bar, Rail and Drawer, with the current destination marked.
- The page's one `h1`, usually its PageHeader's title, and moving focus to the body or the heading after a navigation, with `document.title` updated.

## Examples

### Choosing the forms

An application with a drawer only, which a compact width replaces with none: `forms={{ compact: 'none' }}`.

```tsx example=ChooseForms

```

## Changelog

- **1.0.0**: Scaffold, which replaces AppShell and WindowFrame: a top bar region, the navigation forms by window class, and a body that scrolls.
