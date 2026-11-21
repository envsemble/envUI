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
  - Where you are in a hierarchy, such as the folders above a document
  - An item's place, on one line of a header or a bar
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
  WithAvatar: example
  WrappingTrail: example
  OneLine: example
  BreadcrumbsAnatomy: anatomy
---

# Breadcrumbs

## Variants

### Applications without addresses

```tsx figure=WithoutUrls motion

```

### A level without a page

```tsx figure=LevelWithoutPage

```

### Content beside the name

```tsx figure=WithAvatar

```

### Wrapping

```tsx figure=WrappingTrail widths="36 14" sweep

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

```tsx figure=OneLine motion

```
