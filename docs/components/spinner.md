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
  - Content whose shape isn't known while it loads, such as a file's preview (`size="lg"`), or search results, with its label beside it (`showLabel`).
avoidWhen:
  - text: The work that follows a press, such as saving; show it on the button that started it with `pending`.
    use: Button
  - text: Content of a known shape while it loads, such as a card or a list, which shows itself as a skeleton with `skeleton`.
    use: Surface
  - text: A task whose completion can be measured, such as an upload.
    use: Progress
  - text: Loading a page or a route of an application, along the top bar.
    use: TopBar
  - text: Content loading in its place, in the shape of what is coming.
    see: loading
components:
  - Spinner
---

# Spinner

## Overview

With reduced motion, the arc keeps turning, more slowly.

```tsx example=LoadingPreview

```

### With its label

`showLabel` puts the label beside the spinner.

```tsx example=SearchingDocuments

```

## Variants

```tsx variants=Sizes

```

1. **sm**
2. **md**
3. **lg**

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

- Name the work in `label`, such as Updating tasks.

## Anatomy

```tsx anatomy=SpinnerAnatomy

```

1. **Spinner** (`env-spinner`)
2. **Arc** (`env-spinner-arc`)

Not shown: with `showLabel`, the label beside the arc, `env-spinner-label`.

## Accessibility

### envUI provides

- `role="progressbar"` named by `label`, or the spinner hidden without one.
- With `showLabel`, a busy `role="status"` whose label, Loading by default in the provider's language, is read as the status.
- A slower turn with a fixed arc under reduced motion, instead of stopping.

### You provide

- A `label`, unless a busy control or region already says what happens.
- `aria-busy` on the region that updates, and a status where people wait for a result.
- The result or the error in place of the spinner when the work ends.

## Changelog

- **1.0.0**: `showLabel` shows the label beside the spinner, in a busy status, for loading with no known shape, in place of the LoadingState component of 1.0.0-prerelease.0, which the `v1-structure` codemod rewrites. `size` is `sm`, `md` or `lg`, as `data-size`; the drawing is hidden from assistive technology also when the spinner has a label.
- **0.4.0**: Spinner, in small, standard and large sizes; pending buttons show a small one.
