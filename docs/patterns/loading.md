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
    use: EmptyState
composes:
  - AppShell
  - Sidebar
  - SidebarTrigger
  - NavList
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
related:
  - surface
  - card
  - spinner
  - progress
  - button
  - app-shell
---

# Loading

## Overview

Use this pattern to tell people that something is on its way. Where the shape of what is coming is known, the page renders its own components as skeletons, over placeholder items, so the code is the same loading and loaded and nothing moves when the content lands.

```tsx example=CardsLoading

```

## Anatomy

1. **The skeleton:** `skeleton` on the component that holds the content: Surface, Card, List.Root and List.Item, Table.Root, Stat, Alert, Message, EmptyState, Dialog, Popover, HoverCard or Menu.Root. Everything inside follows it.
2. **Placeholder items:** `placeholders(count)` stands in for the items, so the page writes `items ?? placeholders(3)` and renders its normal components. A placeholder has only an `id`; `isPlaceholder(item)` tells one apart.
3. **Missing text:** text given as undefined, such as `title={item.title}` over a placeholder, is a bar of its text style's usual length.
4. **No known shape:** a [LoadingState](../components/spinner.md), a spinner with a label.
5. **An update to what is shown:** a [Spinner](../components/spinner.md) beside it.
6. **The result of an action:** `pending` on the [Button](../components/button.md) that started it.
7. **Measurable work:** [Progress](../components/progress.md) with a `value`.
8. **A whole page:** the loading bar of [AppShell.Root](../components/app-shell.md), through `loading`.

## States and behaviour

- **The look.** Text becomes bars as long as the text, icons, avatars, media and controls become filled shapes of their size, and backgrounds, borders and corners stay. A component whose generic look isn't right gives its own; one of the application's own reads `useSkeleton()`.
- **No shift.** A skeleton changes paint, never size. Give media an aspect ratio, with `width` and `height` or `aspect-ratio`, so it holds its place before it loads. In development, [dev mode](../dev-mode.md)'s `envui.layout.skeletonShift()` reports what moves.
- **One shimmer.** Every skeleton on the page shimmers in step. With a reduced-motion preference it stays still.
- **Wait first.** A load that ends within 200 ms shows nothing; show the skeleton once a timer fires.
- **Keep what is shown.** Content that updates stays in place under a Spinner, rather than turning back into a skeleton.
- **The end.** Content replaces its skeleton in place. Content that fails or turns out empty shows an [EmptyState](../components/empty-state.md) there instead.

## Content guidelines

- Name what is loading, not that something is: "Loading projects", "Uploading annual-review.pdf".
- Don't promise a time ("Almost there"): the indicator can't know it.
- Keep a pending button's label; say the outcome once it is done, such as "Saved".

## Do and don't

### Do

- Render the components the content will fill, as skeletons, at the place it will appear.
- Pass placeholder items through the same code that renders the real ones.
- Leave controls that don't depend on the work usable while it runs.

### Don't

- Don't draw a separate loading version of a page by hand.
- Don't cover the page with a spinner for one region's update.
- Don't use a Progress bar for work whose end you can't measure.

## Accessibility

### Focus and keyboard

Loading never moves focus. A skeleton is inert, so Tab passes over it; once its content arrives, focus stays where it was. A skeleton popup keeps focus on itself, so Escape still closes it. A pending button stays in the tab order; don't disable the control that started the work.

### envUI provides

- `aria-busy` on a skeleton, whose content is inert and hidden from assistive technology until it loads.
- LoadingState: a busy status region with its label beside the spinner.
- A pending Button that keeps its size, reports that it is busy and ignores presses.
- Progress with its value and `valueText`.

### You provide

- A label for every indicator that names what is loading.
- A status message where the wait is long, since a skeleton itself is not read.
- The delay before a skeleton or spinner appears.

## Examples

### A list per team

Each team's projects load the first time it is chosen: the list is a skeleton over placeholder rows after 200 ms.

```tsx example=SkeletonList

```

### Page progress

Choosing a page in the sidebar starts loading it: after 200 ms the bar along the header's bottom edge shows the next page is on its way, named by `loadingLabel`. The frame sits in a box here, with `landmarks={false}` and `scroll="main"`.

```tsx example=PageProgress

```

### Refresh in place

The activity stays while it refreshes; a small Spinner beside its heading says it is updating.

```tsx example=RefreshInPlace

```

### Pending button

The button that saves shows the work in progress; the outcome is announced once it is done.

```tsx example=PendingButton

```

### Upload progress

Progress measures each file and says what has been sent, in megabytes.

```tsx example=UploadProgress

```

## Changelog

- **1.0.0**: Skeletons are the components themselves, with `skeleton` and `placeholders()`, in place of hand-built Skeleton placeholders.
