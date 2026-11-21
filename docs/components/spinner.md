---
title: Spinner
summary: A spinning arc that shows a small area is loading.
status: stable
since: 1.0.0
category: Feedback
aliases:
  - loader
  - loading indicator
  - loading spinner
  - activity indicator
  - busy indicator
  - throbber
  - circular progress
  - loading
  - LoadingState
  - loading state
useWhen:
  - Work of unknown length in a small area, such as a list updating
  - An update beside content that stays in place meanwhile
  - Content of unknown shape while it loads, such as search results
avoidWhen:
  - text: Work that follows a press, such as saving, shown on its button.
    use: Button
  - text: A task whose completion can be measured, such as an upload.
    use: Progress
  - text: Loading a page or a route of an application, along the top bar.
    use: TopBar
components:
  - Spinner
examples:
  LoadingFiles:
    role: overview
    motion: true
  Sizes: variants
  SpinnerAnatomy:
    role: anatomy
    caption: Held still at one moment of its turn.
---

# Spinner

## Variants

```tsx figure=Sizes

```

1. **Small**
2. **Medium**
3. **Large**

## Anatomy

```tsx figure=SpinnerAnatomy specimen

```

1. **Spinner** (`env-spinner`)
2. **Arc** (`env-spinner-arc`)
