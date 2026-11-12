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
  - pulse
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
  - NavigationRail
  - NavigationDrawer
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
examples:
  CardsLoading:
    role: overview
    motion: true
  SkeletonList: example
  SearchResultsLoading: example
  PendingButton: example
  UploadProgress: example
  PageProgress: example
  SkeletonAnatomy: anatomy
  SkeletonInPlace:
    role: do
    caption: The content's own components as a skeleton, where it will appear.
  SpinnerInPlace:
    role: dont
    caption: 'A spinner for content of a known shape: the page jumps when it lands.'
  RefreshInPlace:
    role: do
    caption: Content that refreshes stays, with a Spinner beside it.
  SkeletonOnRefresh:
    role: dont
    caption: 'Content turned back into a skeleton to refresh: people lose their place.'
---

# Loading

## Variants

### Placeholder items

Where the shape is known, the page renders its own components as skeletons over placeholder items, so its code is the same loading and loaded.

- Placeholder items give the components stand-ins to render.
- Text that hasn't arrived shows as a bar the length of its text style.

```tsx figure=SkeletonList motion

```

### No known shape

A [Spinner](../components/spinner.md) says what is loading beside it.

```tsx figure=SearchResultsLoading

```

### An action

The [button](../components/button.md) that saves shows the work in progress.

```tsx figure=PendingButton motion

```

### Measurable work

[Progress](../components/progress.md) measures each file.

```tsx figure=UploadProgress motion

```

### A whole page

The [top bar](../components/top-bar.md)'s progress bar shows the next page is on its way.

```tsx figure=PageProgress stage="shaded" motion

```

## Anatomy

```tsx figure=SkeletonAnatomy of="Card"

```

1. **Busy root** (`env-card`)
2. **Title bar** (`env-card-title`)
3. **Meta bar** (`env-card-meta`)
4. **Description bars** (`env-card-description`)
5. **Action shape** (`env-card-footer`)

## Behaviour

### When it shows

Show the skeleton only once a load takes a noticeable moment, so quick loads never flash it.

<!-- specimen: WhenItShows -->

### Pulse

Every bar and shape breathes between a stronger and a fainter tone, in step across the page.

- The skeleton's own surfaces, such as a card or a row, take a faint tint that barely moves, so they keep their edges and the layout stands still.
- For people who ask for reduced motion it breathes slower and shallower: only the tone changes.
- In forced colors the bars stand still in the system's gray.

## Rules

A loading state holds the place of what is coming, and never says how long it takes.

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

```tsx figure=SkeletonInPlace motion

```

```tsx figure=SpinnerInPlace motion

```

```tsx figure=RefreshInPlace motion

```

```tsx figure=SkeletonOnRefresh motion

```

### Media

Give images and video their shape before they load, so they hold their place. Dev mode reports what moves as content lands.

### Content

Name what is loading, and never promise a time, such as "Almost there".

- Count in the units people think in, such as "12 of 40 MB".
- Say what it is, such as "Loading projects" or "Uploading annual-review.pdf".

## Accessibility

### Focus and keyboard

<kbd>Tab</kbd> passes over a skeleton's content until it loads. A skeleton popup, sheet or supporting pane keeps focus, so <kbd>Esc</kbd> still closes it.

### envUI provides

- One busy region per skeleton, `aria-busy` on its root, whose content is inert: <kbd>Tab</kbd> passes over it and assistive technology skips it until it loads.
- A visually hidden status beside a skeleton list, which holds no wrapper, that says what is loading.
- A skeleton popup, sheet or supporting pane that keeps focus, so <kbd>Esc</kbd> still closes it.
- A Spinner with `showLabel`, a busy status with its label; a pending Button that keeps its size and ignores presses; Progress with its value.

### You provide

- A label that names what is loading, on every indicator.
- A status message where the wait is long, since the skeleton's content isn't read.
- The delay before a skeleton or spinner appears.

## Compose

### Usage

Render the page's own components with `skeleton` while the data loads, over `placeholders<Item>(count)`.

- `items ?? placeholders<Item>(3)` gives them stand-ins to map over.
- A text prop given as `undefined` renders as a bar of its text style's length.
- Wait 200 ms before showing the skeleton, through a timer of the application's own, and keep its space meanwhile, as the SkeletonList example does.

```tsx source=CardsLoading

```

A skeleton List, as the SkeletonList example shows it:

```tsx
<List.Root aria-label="Design projects" skeleton={!items}>
  {(items ?? placeholders<Project>(3)).map((project) => (
    <List.Item key={project.id} label={project.name} description={project.owner} />
  ))}
</List.Root>
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

A TopBar with `loading` shows a whole page on its way; the page on screen stays current until the next arrives, as the PageProgress example does.

```tsx
<TopBar title="Northwind" loading={next !== null} loadingLabel="Loading Projects" />
```

#### Media

Give media an aspect ratio, with `width` and `height` or the CSS `aspect-ratio`, so it holds its place. Dev mode's `envui.layout.skeletonShift()` reports what moves as content replaces its skeleton.

### Composition

A skeleton's root takes `aria-busy` and its content is inert, in `env-skeleton-content`, which has no box of its own. Bars have small rounded corners, over missing text and text that is there alike, and shapes keep their component's corners, such as a chip's, an avatar's round one or a card's. A skeleton List holds no wrapper, and beside it a visually hidden status says what is loading.
