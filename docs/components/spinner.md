---
title: Spinner
summary: Work of unknown length in a small area, such as a panel that is updating, as a turning arc.
status: stable
since: 0.4.0
category: Feedback & overlays
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
  - Work of unknown length in a small area, such as a list that updates after a filter changes.
  - An update to content already shown, beside the content, which stays in place meanwhile.
  - Content whose shape isn't known while it loads, such as a file's preview (`size="lg"`), or search results, with a label beside it (`LoadingState`).
avoidWhen:
  - text: The work that follows a press, such as saving; show it on the button that started it with `pending`.
    use: Button
  - text: Content of a known shape while it loads, such as a card or a list, which shows itself as a skeleton with `skeleton`.
    use: Surface
  - text: A task whose completion can be measured, such as an upload.
    use: Progress
  - text: Loading a page or a route of an application, along the top bar.
    use: TopBar
related:
  - loading
  - surface
  - progress
  - button
  - scaffold
  - accessibility
components:
  - Spinner
  - LoadingState
---

# Spinner

## Overview

A spinner shows work of unknown length in a small area, such as a preview on its way.

```tsx example=LoadingPreview

```

### LoadingState

LoadingState puts a label beside the spinner that says what is loading, for loading whose shape isn't known; where it is known, show the component itself as a skeleton.

```tsx example=SearchingDocuments

```

## Variants

```tsx example=Sizes

```

| Size | Use for                                                  |
| ---- | -------------------------------------------------------- |
| `sm` | Inside controls, and beside a line of text or a heading. |
| `md` | A panel or a card that is updating. The default.         |
| `lg` | The middle of a region whose content is on its way.      |

## When to use

```tsx do=UpdatingList caption="Keep the content in place, and the spinner beside what changes."

```

```tsx dont=CoverContent caption="Content hidden behind a spinner while it updates."

```

```tsx do=OneSpinner caption="One spinner for one piece of work."

```

```tsx dont=SpinnerPerRow caption="A spinner on every row of one update."

```

- Name the work in `label`, such as Updating tasks.

## Anatomy

```tsx anatomy=SpinnerAnatomy

```

1. **Spinner** (`env-spinner`)
2. **Arc** (`env-spinner-arc`)

## Accessibility

### envUI provides

- `role="progressbar"` named by `label`, or the spinner hidden without one.
- A slower turn with a fixed arc under reduced motion, instead of stopping.

### You provide

- A `label`, unless a busy control or region already says what happens.
- `aria-busy` on the region that updates, and a status where people wait for a result.
- The result or the error in place of the spinner when the work ends.

## Changelog

- **1.0.0**: LoadingState is a spinner with a label, for loading with no known shape; it holds no placeholders. `size` is `sm`, `md` or `lg`, as `data-size`; the drawing is hidden from assistive technology also when the spinner has a label.
- **0.4.0**: Spinner, in small, standard and large sizes; pending buttons show a small one.
