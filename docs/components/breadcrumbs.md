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
    use: NavList
  - text: Moving between the items of one level, such as views of the same content.
    use: Tabs
  - text: Previous and next pages of a sequence.
    use: Pager
  - text: Browsing and expanding a whole hierarchy.
    use: Tree
related:
  - nav-list
  - tree
  - pager
  - link
  - setup
components:
  - Breadcrumbs
---

# Breadcrumbs

## Overview

Breadcrumbs show the path from the top level to the current page, such as a workspace, its folders and the document open in them. Earlier levels are links with `href`, through the `LinkProvider`'s link component, or buttons with `onClick` for applications without URLs; the current page is last, in the primary text color, and never a link. The trail is a navigation landmark around an ordered list, and it supplements the main navigation rather than replacing it.

```tsx example=DocumentTrail

```

## Anatomy

1. **Navigation**: a `nav` landmark named by `aria-label` (Breadcrumb).
2. **Level** (each entry of `items`): a link with `href`, a button with `onClick`, or plain text without either, in muted text.
3. **Separator**: a decorative chevron after every level but the last, which points the other way in right-to-left text.
4. **Current page** (the last entry): plain text in the primary text color and medium weight, marked as the current page.

## Variants and sizes

| Wrapping         | Use for                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `wrap` (default) | A trail above a page's content: it wraps onto more lines when it runs out of room.                                                       |
| `wrap={false}`   | A bar or header that must stay one line tall: the current page is cut short first with an ellipsis, and earlier levels keep their width. |

- Levels are 0.875 rem text with 0.125 rem block and 0.25 rem inline padding and 0.5 rem corners, 0.25 rem from their separators; the chevrons are 1 rem.
- A label longer than 20 rem ends with an ellipsis, and a tooltip shows it in full on hover and on keyboard focus: a plain level or the current page cut short takes keyboard focus for it.
- The trail is as wide as its container allows; in a one-line bar, give it the room the other controls leave, such as a `minmax(0, 1fr)` grid column.

## States and behaviour

- **Hover and focus**: a link or button turns from muted to the primary text color and takes an underline on hover; keyboard focus shows a focus outline around the level. Plain levels and the current page don't respond to the pointer; cut short, they take keyboard focus with the same outline.
- **Links and buttons**: an entry with `href` renders the `LinkProvider`'s link component, so the router handles it, and also calls its `onClick`; an entry with only `onClick` renders a native button styled as a link.
- **Current page**: the last entry is always plain text with `aria-current="page"`, whatever its `href` or `onClick`. Once people go up a level, the application passes the shorter trail.
- **Right-to-left**: the levels run from the right and the chevrons mirror.

## Content guidelines

- Name each level as it is named elsewhere, such as the folder's or the page's title.
- Start at the level people recognise as the top, such as the workspace, not the domain or "Home" when the application has no home page.
- Keep the current page's label the same as the page's heading.
- Name the trail with `aria-label` after what it shows, such as "Document location", where a page has more than one trail.

## Do and don't

### Do

- Show breadcrumbs where people move through a hierarchy of more than two levels.
- Put the trail above the page's heading or in the page's header bar.
- Use `wrap={false}` in a bar beside a status and actions, and let the trail shrink.

### Don't

- Don't use breadcrumbs as the only navigation; pair them with a [NavList](../components/nav-list.md) or a [Tree](../components/tree.md).
- Don't make the current page a link.
- Don't show a trail of a single level.
- Don't use breadcrumbs for steps of a flow or for history; they show where a page sits, not how people got there.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus through the links and buttons of earlier levels; plain levels and the current page are skipped unless cut short, when focus shows their full label. |
| <kbd>Enter</kbd>                                | Follows a link or presses a button.                                                                                                                             |
| <kbd>Space</kbd>                                | Presses a button.                                                                                                                                               |

### envUI provides

- A `nav` landmark named "Breadcrumb" by default, or by EnvUIProvider's `messages.breadcrumbs.label`, around an ordered list of the levels.
- A cut-short label's full text in a tooltip, and in its link's name.
- `aria-current="page"` on the last level, which is never a link.
- Native links through `LinkProvider` and native buttons with `type="button"`, with a visible focus outline.
- Separators hidden from assistive technology, so only the levels are read.
- Labels that keep their whole text for assistive technology when they are cut short.

### You provide

- The routing behind `href`, through `LinkProvider`, or the navigation behind `onClick`.
- An `aria-label` in the application's language, or one that tells two trails on a page apart.
- Where focus goes after a level is pressed, such as the new page's heading: the pressed level becomes the current page, which takes focus only while cut short.

## Examples

### Applications without URLs

Levels with `onClick` are buttons. Pressing one shortens the trail, and focus moves to the folder's title, since the pressed level becomes the current page.

```tsx example=WithoutUrls

```

### One line in a header bar

With `wrap={false}` the trail stays on one line beside a status and an action; the current page is cut short first.

```tsx example=OneLine

```

### A level without a page

An entry without `href` or `onClick` is plain text, for a level that can't be opened.

```tsx example=LevelWithoutPage

```

## Changelog

- **1.0.0**: A label cut short with an ellipsis shows in full in a tooltip, on hover and keyboard focus; a plain level or the current page cut short takes keyboard focus for it, keeping `aria-current`. The landmark's default name comes from `messages.breadcrumbs`, and the `nav` takes `ref`, `style` and native props. Classes: `env-breadcrumb` and `env-breadcrumb-*` are `env-breadcrumbs-item` and `env-breadcrumbs-*`.
- **0.5.0**: Breadcrumbs, with `wrap={false}` for a trail that stays on one line in a bar or header.
