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
  - Work of unknown length in a small area, such as a list updating after a filter changes
  - An update beside content that stays in place meanwhile
  - Content of unknown shape while it loads, such as search results, with its label beside it
avoidWhen:
  - text: The work that follows a press, such as saving, shown on the button that started it.
    use: Button
  - text: Content of a known shape while it loads, such as a card or a list, which shows itself as a skeleton.
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

The spinner can show its label beside it, for loading with no known shape, such as search results.

```tsx example=SearchingDocuments

```

## Variants

```tsx variants=Sizes

```

1. **Small**
2. **Medium**
3. **Large**

| Size   | Use for                                                  |
| ------ | -------------------------------------------------------- |
| Small  | Inside controls, and beside a line of text or a heading. |
| Medium | A panel or a card that is updating. The default.         |
| Large  | The middle of a region whose content is on its way.      |

## When to use

```tsx do=UpdatingList caption="Keep the content in place, and the spinner beside what changes."

```

```tsx dont=CoverContent caption="Content hidden behind a spinner while it updates."

```

### Labels

Name the work the spinner stands for, such as Updating tasks.

## Anatomy

```tsx anatomy=SpinnerAnatomy

```

1. **Spinner** (`env-spinner`)
2. **Arc** (`env-spinner-arc`)

Not shown: the label beside the arc, where it shows.

## Accessibility

### envUI provides

- `role="progressbar"` named by `label`, or the spinner hidden without one.
- With `showLabel`, a busy `role="status"` whose label, Loading by default in the provider's language, is read as the status.
- A slower turn with a fixed arc under reduced motion, instead of stopping.

### You provide

- A `label`, unless a busy control or region already says what happens.
- `aria-busy` on the region that updates, and a status where people wait for a result.
- The result or the error in place of the spinner when the work ends.

## In code

### Usage

A Spinner's `label` names the work it stands for, such as Updating tasks, and names it as a progress bar for assistive technology; leave it out where a busy control or region already says what happens, and the spinner is hidden. `size` is `sm`, 1 rem, `md`, 1.5 rem and the default, or `lg`, 3 rem, as `data-size`.

```tsx source=LoadingPreview

```

#### With its label

`showLabel` shows the label beside the spinner, in a busy status line that centres the two in its row, for loading with no known shape. Without a `label` it says Loading, in the provider's language.

```tsx source=SearchingDocuments

```

### Composition

For the work that follows a press, such as saving, set `pending` on the Button that started it, and for content of a known shape, `skeleton`, rather than a spinner. Set `aria-busy` on the region that updates, and put the result or the error in the spinner's place when the work ends.

The parts are the spinner, `env-spinner`, its arc, `env-spinner-arc`, and with `showLabel` the label beside it, `env-spinner-label`.

## Changelog

- **1.0.0**: `showLabel` shows the label beside the spinner, in a busy status, for loading with no known shape, in place of the LoadingState component of 1.0.0-prerelease.0, which the `v1-structure` codemod rewrites. `size` is `sm`, `md` or `lg`, as `data-size`; the drawing is hidden from assistive technology also when the spinner has a label.
- **0.4.0**: Spinner, in small, standard and large sizes; pending buttons show a small one.
