---
title: Link
summary: A link in text, underlined by default, that goes through your app's router.
status: beta
since: 1.0.0
category: Actions
aliases:
  - anchor
  - hyperlink
  - text link
  - inline link
useWhen:
  - A destination inside a sentence or a paragraph, such as a related page
avoidWhen:
  - text: An action, even when it looks like text, or the next step of a flow.
    use: Button
  - text: Destinations in an application's navigation, such as a sidebar.
    use: NavigationDrawer
  - text: Previous and next pages of a sequence.
    use: Pager
components:
  - Link
examples:
  InRunningText: overview
  WithoutUnderline: example
  LinkAnatomy: anatomy
---

# Link

## Variants

```tsx figure=WithoutUnderline

```

## Anatomy

```tsx figure=LinkAnatomy

```

1. **Link** (`env-link`, `href`)
2. **Label** (`env-link::text`, `children`)
