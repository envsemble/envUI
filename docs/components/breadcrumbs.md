---
title: Breadcrumbs
summary: The path from the top level to the current page, with earlier levels as links or buttons.
status: stable
since: 0.5.0
category: Navigation
aliases:
  - breadcrumb
  - breadcrumb trail
  - trail
  - path
  - location
  - hierarchy
  - folder path
useWhen:
  - Seeing where you are in a hierarchy and going up, such as the folders above a document
  - An item's place, on one line of a header or a bar beside its status and actions
avoidWhen:
  - text: The application's main navigation, such as the pages in a sidebar.
    use: Drawer
  - text: Previous and next pages of a sequence.
    use: Pager
  - text: Browsing and expanding a whole hierarchy.
    use: Tree
components:
  - Breadcrumbs
---

# Breadcrumbs

## Overview

A trail runs from a workspace through its folders to the open document; the current page is always last, and never a link.

```tsx example=DocumentTrail

```

### Applications without addresses

Levels can be buttons rather than links. Pressing one shortens the trail, and the application moves focus, here to the folder's title.

```tsx example=WithoutUrls

```

### A level without a page

A level that can't be opened is plain text.

```tsx example=LevelWithoutPage

```

## Variants

### Wrapping

A trail above a page wraps; one in a bar stays on one line.

| Wrapping | Use for                                                              |
| -------- | -------------------------------------------------------------------- |
| Wraps    | A trail above a page's content. The default.                         |
| One line | A bar that stays one line tall: the current page is cut short first. |

```tsx example=OneLine

```

### Long labels

A long label ends with an ellipsis, and a tooltip shows it in full on hover and on keyboard focus.

## When to use

```tsx do=RecognisedTop caption="Start at the level people know as the top, such as the workspace."

```

```tsx dont=AddressAsTrail caption="The address as the trail: a domain and ids people don't know."

```

### Names

Name each level as it is named elsewhere, and the current page as the page's heading.

### Beside the navigation

Pair the trail with the main navigation: it never replaces it, and a trail of one level shows nothing.

## Anatomy

```tsx anatomy=BreadcrumbsAnatomy

```

1. **Trail** (`env-breadcrumbs`)
2. **Level** (`env-breadcrumbs-link`, `href`)
3. **Separator** (`env-breadcrumbs-separator`)
4. **Current page** (`env-breadcrumbs-current`)

## Adapting to width

The trail wraps onto more lines when it runs out of room, and its chevrons mirror in right-to-left text.

```tsx example=WrappingTrail widths="14 36"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the links and buttons; a plain level or the current page only when cut short. |
| <kbd>Enter</kbd>                                | Follows a link or presses a button.                                                         |
| <kbd>Space</kbd>                                | Presses a button.                                                                           |

### envUI provides

- A `nav` landmark named Breadcrumb, from `messages.breadcrumbs`, around an ordered list.
- `aria-current="page"` on the last level, which is never a link.
- Separators hidden from assistive technology, and full labels for those cut short.

### You provide

- The routing behind `href`, through `LinkProvider`, or the navigation behind `onClick`.
- An `aria-label` that tells two trails on a page apart.
- Where focus goes after a level is pressed, such as the new page's heading.

## In code

### Usage

Breadcrumbs takes its levels as `items`, from the top down to the current page, the last item, which is never a link. Each has its `label`; with `href` it is a link, through the application's router link from `LinkProvider`; with `onClick` it is a button; with neither it is plain text, for a level that can't be opened.

```tsx source=DocumentTrail

```

#### Without addresses

Give levels `onClick` where the application has no URLs. Pressing one makes it the current page, which is not a control, so move focus yourself, such as to the new title.

```tsx source=WithoutUrls

```

#### One line

`wrap` is true by default, and the trail wraps onto more lines when it runs out of room. `wrap={false}` keeps it on one line, for a bar or a header: the current page is cut short first, and earlier levels keep their width. A label beyond 20 rem ends with an ellipsis, with a tooltip on hover and keyboard focus.

```tsx source=OneLine

```

### Composition

The landmark is named Breadcrumb, from EnvUIProvider's `messages.breadcrumbs`; set `aria-label` to tell two trails on a page apart. Pair it with the main navigation, such as a Drawer, never in its place.

The parts are the trail, `env-breadcrumbs`, its items, `env-breadcrumbs-item`, each level's link or button, `env-breadcrumbs-link`, the separators, `env-breadcrumbs-separator`, and the current page, `env-breadcrumbs-current`.

## Changelog

- **1.0.0**: A label cut short with an ellipsis shows in full in a tooltip, on hover and keyboard focus; a plain level or the current page cut short takes keyboard focus for it, keeping `aria-current`. The landmark's default name comes from `messages.breadcrumbs`, and the `nav` takes `ref`, `style` and native props. Classes: `env-breadcrumb` and `env-breadcrumb-*` are `env-breadcrumbs-item` and `env-breadcrumbs-*`.
- **0.5.0**: Breadcrumbs, with `wrap={false}` for a trail that stays on one line in a bar or header.
