---
title: Breadcrumbs
summary: The path from the top level to the current page, with earlier levels as links or buttons.
status: stable
since: 1.0.0
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
    use: NavigationDrawer
  - text: Previous and next pages of a sequence.
    use: Pager
  - text: Browsing and expanding a whole hierarchy.
    use: Tree
components:
  - Breadcrumbs
examples:
  DocumentTrail:
    role: overview
    caption: From the workspace to the open document.
  WithoutUrls: example
  LevelWithoutPage: example
  WrappingTrail: example
  OneLine: example
  BreadcrumbsAnatomy: anatomy
  RecognisedTop:
    role: do
    caption: Start at the level people know as the top, such as the workspace.
  AddressAsTrail:
    role: dont
    caption: "The address as the trail: a domain and ids people don't know."
---

# Breadcrumbs

## Variants

### Applications without addresses

Levels can be buttons rather than links.

- Pressing one shortens the trail.
- The application moves focus, here to the folder's title.

```tsx figure=WithoutUrls motion

```

### A level without a page

A level that can't be opened is plain text.

```tsx figure=LevelWithoutPage

```

### Wrapping

| Wrapping | Use for                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------- |
| Wraps    | A trail above a page's content: it wraps onto more lines when it runs out of room. The default. |
| One line | A bar that stays one line tall: the current page is cut short first.                            |

```tsx figure=WrappingTrail widths="36 14" sweep

```

```tsx figure=OneLine

```

## Anatomy

```tsx figure=BreadcrumbsAnatomy

```

1. **Trail** (`env-breadcrumbs`)
2. **Level** (`env-breadcrumbs-link`, `href`)
3. **Separator** (`env-breadcrumbs-separator`)
4. **Current page** (`env-breadcrumbs-current`)

## Behaviour

### Long labels

A long label ends with an ellipsis, and a tooltip shows it in full on hover and on keyboard focus.

- On one line, the current page is cut short first, and earlier levels keep their width.

<!-- specimen: LongLabel -->

## Rules

The trail starts where people know the top to be, and names each level as they know it.

```tsx figure=RecognisedTop

```

```tsx figure=AddressAsTrail

```

### Names

Name each level as it is named elsewhere, and the current page as the page's heading.

### Beside the navigation

Pair the trail with the main navigation: it never replaces it.

- A trail of one level shows nothing.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the links and buttons; a plain level or the current page only when cut short. |
| <kbd>Enter</kbd>                                | Follows a link or presses a button.                                                         |
| <kbd>Space</kbd>                                | Presses a button.                                                                           |

### envUI provides

- A `nav` landmark named Breadcrumb around an ordered list.
- `aria-current="page"` on the last level, which is never a link.
- Separators hidden from assistive technology, and full labels for those cut short.

### You provide

- The routing behind `href`, through `LinkProvider`, or the navigation behind `onClick`.
- An `aria-label` that tells two trails on a page apart.
- Where focus goes after a level is pressed, such as the new page's heading.

## Compose

### Usage

```tsx
<Breadcrumbs
  items={[
    { label: 'Northwind', href: '/' },
    { label: 'Launch', href: '/launch' },
    { label: 'Launch brief' },
  ]}
/>
```

`items` run from the top down to the current page, the last item, which is never a link. Each has its `label`; with `href` it is a link, through the router link from `LinkProvider`; with `onClick` it is a button; with neither it is plain text.

#### Without addresses

Give levels `onClick` where the application has no URLs. Pressing one makes it the current page, which is not a control, so move focus yourself, such as to the new title, as the WithoutUrls example does.

#### One line

`wrap` is true by default. `wrap={false}` keeps the trail on one line, for a bar or a header. A label beyond 20 rem ends with an ellipsis, with a tooltip on hover and keyboard focus.

### Composition

The landmark is named Breadcrumb; `aria-label` tells two trails on a page apart. Pair it with the main navigation, such as a NavigationDrawer. Each level sits in an item, `env-breadcrumbs-item`. The chevrons mirror in right-to-left text.

## Changelog

- **1.0.0**: A label cut short with an ellipsis shows in full in a tooltip, on hover and keyboard focus; a plain level or the current page cut short takes keyboard focus for it, keeping `aria-current`. The landmark's default name comes from `messages.breadcrumbs`, and the `nav` takes `ref`, `style` and native props. Classes: `env-breadcrumb` and `env-breadcrumb-*` are `env-breadcrumbs-item` and `env-breadcrumbs-*`.
- **1.0.0-prerelease.5**: An item's type is `BreadcrumbsItem`, after the component, where it was `BreadcrumbItem`.
