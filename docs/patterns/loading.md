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
  - A page, a region or the result of an action takes long enough that people would notice.
  - Work with a measurable end, such as an upload, runs while people wait.
avoidWhen:
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
related:
  - surface
  - card
  - spinner
  - progress
  - button
  - scaffold
---

# Loading

## Overview

Loading shows that something is on its way, in the place and the shape of what is coming. Where the shape is known, the page renders its own components as skeletons over placeholder items, so its code is the same loading and loaded.

```tsx example=CardsLoading

```

### Placeholder items

`items ?? placeholders<Item>(3)` gives the components stand-ins to render; text given as undefined is a bar of its text style's length. Show the skeleton once a load has taken 200 ms.

```tsx example=SkeletonList

```

## Variants

| What is loading                | Show                                                  |
| ------------------------------ | ----------------------------------------------------- |
| Content of a known shape       | Its components with `skeleton`, over `placeholders()` |
| Content of no known shape      | A Spinner with `showLabel`, beside its label          |
| An update to what is shown     | A Spinner beside it                                   |
| The result of an action        | `pending` on the Button that started it               |
| Work whose end can be measured | Progress with a `value`                               |
| A whole page                   | `loading` on the TopBar                               |

### No known shape

A Spinner with `showLabel` says what is loading beside it, for results whose number and shape aren't known yet.

```tsx example=SearchResultsLoading

```

### An action

The button that saves shows the work in progress; the outcome is announced once it is done.

```tsx example=PendingButton

```

### Measurable work

Progress measures each file and says what has been sent.

```tsx example=UploadProgress

```

### A whole page

After 200 ms the bar along the top bar's bottom edge shows the next page is on its way, named by `loadingLabel`.

```tsx example=PageProgress stage=shaded

```

## When to use

```tsx do=SkeletonInPlace caption="The content's own components as a skeleton, where it will appear."

```

```tsx dont=SpinnerInPlace caption="A spinner for content of a known shape: the page jumps when it lands."

```

```tsx do=RefreshInPlace caption="Content that refreshes stays, with a Spinner beside it."

```

```tsx dont=SkeletonOnRefresh caption="Content turned back into a skeleton to refresh: people lose their place."

```

- Give media an aspect ratio, with `width` and `height` or `aspect-ratio`, so it holds its place; dev mode's `envui.layout.skeletonShift()` reports what moves.
- When content fails or turns out empty, show an [empty state](empty-states.md) in its place.

### Content

- Name what is loading: "Loading projects", "Uploading annual-review.pdf".
- Don't promise a time, such as "Almost there".

## Anatomy

```tsx anatomy=SkeletonAnatomy of="Card"

```

1. **Busy root** (`env-card`)
2. **Title bar** (`env-card-heading`)
3. **Meta bar** (`env-card-meta`)
4. **Description bars** (`env-card-description`)
5. **Action shape** (`env-card-footer`)

Not shown: the inert content inside the root, `env-skeleton-content`, which has no box of its own. A soft highlight sweeps across every bar and shape, and fainter across the skeleton's own surfaces, such as a card or a row, in step across the page, and keeps still with a reduced-motion preference. Bars have small rounded corners, over missing text and text that is there alike, and shapes keep their component's, such as a chip's, an avatar's round one or a card's.

## Accessibility

### envUI provides

- One busy region per skeleton, `aria-busy` on its root, whose content is inert: Tab passes over it and assistive technology skips it until it loads.
- A visually hidden status beside a skeleton list, which holds no wrapper, that says what is loading.
- A skeleton popup, sheet or supporting pane that keeps focus, so Escape still closes it.
- A Spinner with `showLabel`, a busy status with its label; a pending Button that keeps its size and ignores presses; Progress with its value.

### You provide

- A label that names what is loading, on every indicator.
- A status message where the wait is long, since the skeleton's content isn't read.
- The delay before a skeleton or spinner appears.

## Changelog

- **1.0.0**: Skeletons are the components themselves, with `skeleton` and `placeholders()`, in place of hand-built Skeleton placeholders. The page is on the figure template.
