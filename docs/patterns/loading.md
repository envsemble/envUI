---
title: Loading
summary: Show that something is loading, in the place and shape of what is coming, without implying how long it takes.
status: beta
since: 1.0.0
intent: Keep people informed
aliases:
  - loading state
  - loading indicator
  - busy state
  - progress
  - pending
  - placeholder
  - placeholders
  - skeleton
  - skeleton screen
  - shimmer
useWhen:
  - A page, a region or a result that takes a noticeable while
  - Work with a measurable end, such as an upload
avoidWhen:
  - text: Files uploading, each with its own progress.
    see: file-upload
  - text: Content that turned out empty, or that failed to load.
    see: empty-states
composes:
  - Scaffold
  - TopBar
  - Rail
  - Drawer
  - Page
  - PageHeader
  - Card
  - Grid
  - List
  - placeholders
  - Spinner
  - Button
  - Progress
  - SegmentedControl
  - TextField
  - Column
  - Row
  - Text
  - Avatar
---

# Loading

## Overview

Where the shape is known, the page renders its own components as skeletons over placeholder items, so its code is the same loading and loaded.

```tsx example=CardsLoading

```

### Placeholder items

Placeholder items give the components stand-ins to render, and text that hasn't arrived shows as a bar the length of its text style. Show the skeleton only once a load takes a noticeable moment, so quick loads never flash it.

```tsx example=SkeletonList

```

## Variants

### No known shape

A [Spinner](../components/spinner.md) says what is loading beside it.

```tsx example=SearchResultsLoading

```

### An action

The [button](../components/button.md) that saves shows the work in progress.

```tsx example=PendingButton

```

### Measurable work

[Progress](../components/progress.md) measures each file.

```tsx example=UploadProgress

```

### A whole page

The [top bar](../components/top-bar.md)'s progress bar shows the next page is on its way.

```tsx example=PageProgress stage=shaded

```

## When to use

### Which to use

Show what is coming in its place and shape where you can, and say only that something is on its way where you can't.

| Indicator                | Use for                                                 |
| ------------------------ | ------------------------------------------------------- |
| A skeleton               | Content of a known shape, in its own components.        |
| A spinner with its label | Content of no known shape, such as search results.      |
| A spinner beside it      | An update to what is already shown.                     |
| A pending button         | The result of an action, on the button that started it. |
| A progress bar           | Work whose end can be measured, such as an upload.      |
| The top bar's progress   | A whole page on its way.                                |

```tsx do=SkeletonInPlace caption="The content's own components as a skeleton, where it will appear."

```

```tsx dont=SpinnerInPlace caption="A spinner for content of a known shape: the page jumps when it lands."

```

```tsx do=RefreshInPlace caption="Content that refreshes stays, with a Spinner beside it."

```

```tsx dont=SkeletonOnRefresh caption="Content turned back into a skeleton to refresh: people lose their place."

```

### Media

Give images and video their shape before they load, so they hold their place; dev mode reports what moves as content lands.

### Content

Name what is loading, count in the units people think in, such as "12 of 40 MB", and never promise a time, such as "Almost there".

- "Loading projects"
- "Uploading annual-review.pdf"

## Anatomy

```tsx anatomy=SkeletonAnatomy of="Card"

```

1. **Busy root** (`env-card`)
2. **Title bar** (`env-card-heading`)
3. **Meta bar** (`env-card-meta`)
4. **Description bars** (`env-card-description`)
5. **Action shape** (`env-card-footer`)

Not shown: the inert content inside the root, which has no box of its own.

### Highlight

A soft highlight sweeps across every bar and shape, and more faintly across the skeleton's own surfaces, such as a card or a row, in step across the page. It keeps still for people who ask for reduced motion.

## Accessibility

### envUI provides

- One busy region per skeleton, `aria-busy` on its root, whose content is inert: <kbd>Tab</kbd> passes over it and assistive technology skips it until it loads.
- A visually hidden status beside a skeleton list, which holds no wrapper, that says what is loading.
- A skeleton popup, sheet or supporting pane that keeps focus, so <kbd>Esc</kbd> still closes it.
- A Spinner with `showLabel`, a busy status with its label; a pending Button that keeps its size and ignores presses; Progress with its value.

### You provide

- A label that names what is loading, on every indicator.
- A status message where the wait is long, since the skeleton's content isn't read.
- The delay before a skeleton or spinner appears.

## In code

### Usage

Render the page's own components with `skeleton` while the data loads, over `placeholders<Item>(count)`: `items ?? placeholders<Item>(3)` gives them stand-ins to map over, and a text prop given as `undefined` renders as a bar of its text style's length. Wait 200 ms before showing the skeleton, through a timer of the application's own, and keep its space meanwhile.

```tsx source=CardsLoading

```

```tsx source=SkeletonList

```

#### Indicators

| What is loading                | Code                                                                   |
| ------------------------------ | ---------------------------------------------------------------------- |
| Content of a known shape       | Its components with `skeleton`, over `placeholders()`                  |
| Content of no known shape      | `<Spinner label="Searching documents" showLabel />`                    |
| An update to what is shown     | `<Spinner size="sm" label="…" />` beside it, `aria-busy` on the region |
| The result of an action        | `pending` on the Button that started it                                |
| Work whose end can be measured | `<Progress label={file.name} value={percent} />`                       |
| A whole page                   | `loading` on the TopBar, named by `loadingLabel`                       |

```tsx source=PageProgress

```

#### Media

Give media an aspect ratio, with `width` and `height` or the CSS `aspect-ratio`, so it holds its place. Dev mode's `envui.layout.skeletonShift()` reports what moves as content replaces its skeleton.

### Composition

A skeleton's root takes `aria-busy` and its content is inert, in `env-skeleton-content`, which has no box of its own. Bars have small rounded corners, over missing text and text that is there alike, and shapes keep their component's corners, such as a chip's, an avatar's round one or a card's. A skeleton List holds no wrapper, and beside it a visually hidden status says what is loading.

## Changelog

- **1.0.0**: Skeletons are the components themselves, with `skeleton` and `placeholders()`, in place of hand-built Skeleton placeholders. The page is on the figure template.
