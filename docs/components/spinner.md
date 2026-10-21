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

A spinner shows work of unknown length in a small area: a list that updates, a panel that refreshes, or a preview on its way. It is an arc in the control blue that turns. With a `label` assistive technology reads it as a progress bar named by the label; without one it is hidden, for a control or region that already says it is busy.

For the work that follows a press, the button that started it shows a spinner itself with `pending`; see [Button](../components/button.md).

```tsx example=UpdatingPanel

```

## Variants and sizes

| Size          | Use for                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| `sm`, 1 rem   | Inside controls, and beside a line of text, a heading or the control that changed a list. |
| `md`, 1.5 rem | A panel or a card that is updating, beside its content.                                   |
| `lg`, 3 rem   | The middle of a region whose content is on its way, such as a preview.                    |

- The spinner is a round-capped arc in the control blue, in a square of its size, that turns once every 1.4 s while it lengthens and shortens.
- Inside a pending button it is small and takes the button's text color.

## States and behaviour

- **Motion**: the arc turns and lengthens continuously. With a reduced-motion preference it keeps turning at half the speed with a fixed arc, since it is the only sign of the work.
- **Labelled or hidden**: with `label` the spinner has `role="progressbar"`, named by the label and without a value. Without a label it is hidden from assistive technology, for a pending button, a busy region or a status that already says what happens.
- **Not announced**: a spinner that appears isn't read out by itself. Mark the region that updates with `aria-busy`, and say in a status what people wait for, where it matters.
- **Read-only**: a spinner takes no focus and no input.
- **LoadingState**: a spinner with a label beside it that says what is loading, in a status region marked busy, for loading whose shape isn't known. Where it is known, show the component itself as a skeleton.

## Content guidelines

- Name the work in the label, with what it acts on, as an ongoing action: "Updating tasks", "Loading the preview of quarterly-report.pdf".
- Keep the content that is already shown in place while it updates, and put the spinner beside it, not over it.

## Do and don't

### Do

- Show a spinner in the area that updates, close to what will change.
- Use the pending state of the button that started the work instead of a separate spinner.
- Keep the content already shown while it updates, and mark its region with `aria-busy`.

### Don't

- Don't use a spinner for content of a known shape; show the component as a skeleton instead, as [Loading](../patterns/loading.md) shows.
- Don't use a spinner for a task whose progress can be measured; use [Progress](../components/progress.md).
- Don't show several spinners for one piece of work, or a spinner for work that ends in a moment.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Pass over the spinner, which takes no focus; screen readers reach it as they read the page. |

### envUI provides

- `role="progressbar"` named by `label`, or the spinner hidden from assistive technology without one.
- The control blue, at more than 3:1 on the canvas in both themes.
- A slower, steady turn with a reduced-motion preference, instead of stopping.

### You provide

- A `label` that names the work, unless a busy control or region already says so.
- `aria-busy` on the region that updates, and a status message where people wait for the result.
- Removing the spinner when the work ends, and showing the result or the error.

## Examples

### Sizes

Small, medium and large spinners (`sm`, `md` and `lg`), each with its own label.

```tsx example=Sizes

```

### A list that updates

Choosing another view keeps the tasks shown while the new ones load. A small spinner beside the choice says they are updating, and the list reports `aria-busy`.

```tsx example=UpdatingList

```

### Loading with no known shape

LoadingState says what is loading beside the spinner, for results whose number and shape aren't known yet.

```tsx example=SearchingDocuments

```

### Content on its way

A large spinner in the middle of a preview's frame, which keeps its size while the file renders.

```tsx example=LoadingPreview

```

## Changelog

- **1.0.0**: LoadingState is a spinner with a label, for loading with no known shape; it holds no placeholders. `size` is `sm`, `md` or `lg`, as `data-size`; the drawing is hidden from assistive technology also when the spinner has a label.
- **0.4.0**: Spinner, in small, standard and large sizes; pending buttons show a small one.
