---
title: Navigation
summary: Let people move between the places of an application, see where they are, and find their way back.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - navigation
  - primary navigation
  - navigation forms
  - wayfinding
  - current page
  - route change
  - breadcrumb trail
  - quick open
  - tabs or navigation
useWhen:
  - An application has several places, and people move between them.
  - People need to see where they are, how they got there and how to go back up.
avoidWhen:
  - text: Narrowing a long list or a table to the items people want.
    see: filtering
  - text: Showing more of the page's content without leaving the page.
    see: progressive-disclosure
  - text: Moving between pages of one long list.
    use: Pagination
composes:
  - Scaffold
  - TopBar
  - Bar
  - Rail
  - Drawer
  - Breadcrumbs
  - Page
  - PageHeader
  - Tabs
  - Pager
  - Kbd
  - useModifierKey
  - IconButton
  - Tooltip
  - CommandPalette
  - Panes
  - LinkProvider
  - Link
  - List
  - DescriptionList
  - Badge
  - Button
  - Column
  - Row
  - Text
related:
  - filtering
  - loading
  - scaffold
  - panes
  - drawer
  - app-frame
  - breadcrumbs
  - search-trigger
---

# Navigation

## Overview

Navigation gives an application one way around and a clear sense of place: one primary navigation that marks the current page, a trail back up from deep pages, tabs only for views of one thing, and a quick way to open anything by name.

```tsx example=PrimaryNavigation stage=shaded

```

### Changing the page

After the router shows the new page, move focus to the Scaffold's body or the page's `h1`, and set `document.title`, such as "Projects – Northwind". Give every place an `href`, rendered by the router's link through [LinkProvider](../setup.md#connect-your-router); the examples keep the page in state instead.

## Variants

| Need                                | Use                                                                                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| The places of the application       | One array of destinations given to [Bar](../components/bar.md), [Rail](../components/rail.md) and [Drawer](../components/drawer.md) |
| A page two or more levels down      | [Breadcrumbs](../components/breadcrumbs.md) with `wrap={false}` in the [PageHeader](../components/page-header.md)                   |
| Views of the object a page is about | [Tabs](../components/tabs.md) under the PageHeader                                                                                  |
| Pages read in order                 | A [Pager](../components/pager.md) at the end of the content                                                                         |
| Opening anything by name            | A [search trigger](search-trigger.md) that opens a [CommandPalette](../components/command-palette.md)                               |
| A list whose items open beside it   | List-detail [Panes](../components/panes.md)                                                                                         |

### Hierarchy

The trail shows the levels above the page, each a link; the page itself is the last level and no link.

```tsx example=Hierarchy

```

### Views of one thing

Tabs switch the views of one project in place. Its settings are another page, so they are a link in the header's actions.

```tsx example=ViewsOfOneThing

```

### Quick open

Choosing a result opens it as a link would. An application opens the palette on <kbd>Ctrl</kbd>+<kbd>K</kbd> too, as the [search trigger](search-trigger.md) pattern shows; here the catalogue's own search keeps the keys.

```tsx example=QuickOpen

```

### List and detail

As narrow as a phone, the detail shows in place of the list, with a back button that names where it goes.

```tsx example=ListAndDetail

```

## When to use

```tsx do=TabsForViews caption="Tabs for the views of the one thing the page is about."

```

```tsx dont=TabsForPlaces caption="Tabs for places of the application: they have no address of their own."

```

- One primary navigation, in the same order on every page, never hidden behind a menu on a wide window.
- On a page below a place, such as one project, keep the place current and let the trail say the rest.

### Content

- Name each place with a short noun, the word of its page's title.
- Name the navigation after its role, "Main", rather than its look.
- Name a link after its destination: "Project settings", not "More".

## Anatomy

```tsx anatomy=NavigationAnatomy stage=shaded

```

1. **Primary navigation** (`env-rail`)
2. **Quick open** (`env-top-bar-actions > env-icon-button`)
3. **Trail** (`env-breadcrumbs`)
4. **Views** (`env-tabs-list`)

Not shown: the [Pager](../components/pager.md) at the end of a page read in order.

## Accessibility

The skip links come first. After a page opens, from a destination, a trail level or a quick-open result, focus moves to its body or heading, so a screen reader reads it from the start. Tabs are one tab stop whose arrow keys move between them.

### envUI provides

- Skip links, the banner and main landmarks, and a body that takes focus without being a tab stop.
- `aria-current="page"` on the current destination and the last trail level.
- Tabs with their roles and roving tab stop; a palette that announces the number of results.
- Panes' focus moves between the list and the detail while one shows at a time.

### You provide

- `current` on the place shown, focus after each change of page, and `document.title`.
- `LinkProvider` with the router's link, and an `href` on every place.

## Changelog

- **1.0.0**: The page is on the figure template.
