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
  - People move through a hierarchy and need to see where they are and go up, such as folders above a document.
  - A header or a bar names the current item's place in one line beside its status and actions (`wrap={false}`).
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

Breadcrumbs show the path from the top level to the current page, such as a workspace, its folders and the document open in them. Earlier levels are links, or buttons with `onClick`; the current page is last, and never a link.

```tsx example=DocumentTrail

```

### Applications without URLs

Levels with `onClick` are buttons. Pressing one shortens the trail, and the application moves focus, here to the folder's title.

```tsx example=WithoutUrls

```

### A level without a page

An entry without `href` or `onClick` is plain text, for a level that can't be opened.

```tsx example=LevelWithoutPage

```

## Variants

| Wrapping         | Use for                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `wrap` (default) | A trail above a page's content, which wraps onto more lines.         |
| `wrap={false}`   | A bar that stays one line tall: the current page is cut short first. |

```tsx example=OneLine caption="wrap={false} in a header bar, beside a status and an action."

```

A label longer than 20 rem ends with an ellipsis, and a tooltip shows it in full on hover and on keyboard focus.

## When to use

```tsx do=RecognisedTop caption="Start at the level people know as the top, such as the workspace."

```

```tsx dont=AddressAsTrail caption="The address as the trail: a domain and ids people don't know."

```

- Name each level as it is named elsewhere, and the current page as the page's heading.
- Pair the trail with the main navigation; it never replaces it, and a trail of one level shows nothing.

## Anatomy

```tsx anatomy=BreadcrumbsAnatomy

```

1. **Trail** (`env-breadcrumbs`)
2. **Level** (`env-breadcrumbs-link`, `href`)
3. **Separator** (`env-breadcrumbs-separator`)
4. **Current page** (`env-breadcrumbs-current`)

## Adapting to width

By default the trail wraps onto more lines when it runs out of room; the chevrons mirror in right-to-left text.

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

## Changelog

- **1.0.0**: A label cut short with an ellipsis shows in full in a tooltip, on hover and keyboard focus; a plain level or the current page cut short takes keyboard focus for it, keeping `aria-current`. The landmark's default name comes from `messages.breadcrumbs`, and the `nav` takes `ref`, `style` and native props. Classes: `env-breadcrumb` and `env-breadcrumb-*` are `env-breadcrumbs-item` and `env-breadcrumbs-*`.
- **0.5.0**: Breadcrumbs, with `wrap={false}` for a trail that stays on one line in a bar or header.
