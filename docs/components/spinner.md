---
title: Spinner
summary: Work of unknown length in a small area, such as a panel that is updating, as one shape that turns and changes form.
status: stable
since: 0.4.0
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
  - Work of unknown length in a small area, such as a list updating after a filter changes
  - An update beside content that stays in place meanwhile
  - Content of unknown shape while it loads, such as search results, with its label beside it
avoidWhen:
  - text: The work that follows a press, such as saving, shown on the button that started it.
    use: Button
  - text: A task whose completion can be measured, such as an upload.
    use: Progress
  - text: Loading a page or a route of an application, along the top bar.
    use: TopBar
  - text: Content of a known shape loading in its place, such as a card or a list, as a skeleton.
    see: loading
components:
  - Spinner
---

# Spinner

## Overview

It is Material's expressive loading indicator: the shape morphs through Material's rounded forms, a soft burst, cookies, a pentagon, a pill and an oval, with a springy quarter turn at each change. With reduced motion, it breathes in place without turning.

```tsx example=LoadingPreview

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

### Contained

On a circle of the brand's tint, the spinner stands out where it floats over content, such as an image or a busy canvas.

```tsx example=Contained

```

## When to use

## Anatomy

```tsx anatomy=SpinnerAnatomy

```

1. **Spinner** (`env-spinner`)
2. **Shape** (`env-spinner-shape`)

Not shown: the circle behind a contained spinner, and the label beside the shape, where it shows.

## Accessibility

### envUI provides

- `role="progressbar"` named by `label`, or the spinner hidden without one.
- With `showLabel`, a busy `role="status"` whose label, Loading by default in the provider's language, is read as the status.
- Under reduced motion, a shape that breathes in place without turning or morphing, instead of stopping.

### You provide

- A `label`, unless a busy control or region already says what happens.
- `aria-busy` on the region that updates, and a status where people wait for a result.
- The result or the error in place of the spinner when the work ends.

## In code

### Usage

A Spinner's `label` names the work it stands for, such as Updating tasks, and names it as a progress bar for assistive technology; leave it out where a busy control or region already says what happens, and the spinner is hidden. `size` is `sm`, 1 rem, `md`, 1.5 rem and the default, or `lg`, 3 rem, as `data-size`. `contained` draws the shape on a circle of `--env-color-bg-brand-muted` laid on `--env-color-bg-default`, as `data-contained`.

```tsx source=LoadingPreview

```

#### With its label

`showLabel` shows the label beside the spinner, in a busy status line that centres the two in its row, for loading with no known shape. Without a `label` it says Loading, in the provider's language.

```tsx
import { Spinner } from '@envsemble/envui';

export default function SearchingDocuments() {
  // Results whose number and shape aren't known until they arrive.
  return <Spinner label="Searching documents" showLabel />;
}
```

### Composition

For the work that follows a press, such as saving, set `pending` on the Button that started it, and for content of a known shape, `skeleton`, rather than a spinner. Set `aria-busy` on the region that updates, and put the result or the error in the spinner's place when the work ends.

The parts are the spinner, `env-spinner`, its shape, `env-spinner-shape`, with `contained` the circle behind it, `env-spinner-container`, and with `showLabel` the label beside it, `env-spinner-label`. The shape follows Material's indeterminate timing: the drawing turns once every 4666 ms, and every 650 ms the shape morphs into the next while it takes a quarter turn, on Material's spring of damping 0.6 and stiffness 200. The morph animates the path's `d` from CSS; where a browser can't, the soft burst keeps turning. Recolor it with `--env-spinner-color`, as busy buttons do with their label's color.

## Changelog

- **1.0.0**: `showLabel` shows the label beside the spinner, in a busy status, for loading with no known shape, in place of the LoadingState component of 1.0.0-prerelease.0, which the `v1-structure` codemod rewrites. `size` is `sm`, `md` or `lg`, as `data-size`; the drawing is hidden from assistive technology also when the spinner has a label. The turning arc becomes Material's expressive loading indicator, a shape that morphs as it turns, and `env-spinner-arc` gives way to `env-spinner-shape`; `contained` draws it on a circle.
- **0.4.0**: Spinner, in small, standard and large sizes; pending buttons show a small one.
