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
useWhen:
  - A page, a region or the result of an action takes long enough that people would notice.
  - Work with a measurable end, such as an upload, runs while people wait.
avoidWhen:
  - text: Content that turned out empty, or that failed to load.
    use: EmptyState
  - text: The application frame itself before the first page loads, which shows its own parts as skeletons.
    use: AppShell
composes:
  - AppShell
  - Sidebar
  - SidebarTrigger
  - NavigationDrawer
  - Page
  - PageHeader
  - LoadingState
  - Skeleton
  - Spinner
  - Button
  - Progress
  - List
  - SegmentedControl
  - TextField
  - Column
  - Row
  - Text
related:
  - skeleton
  - spinner
  - progress
  - button
  - app-shell
---

# Loading

## Overview

Use this pattern to tell people that something is on its way: a page, a region of one, or the result of something they did. Choose the indicator by what is loading, show it where the content will appear, and keep what people already see in place.

Here each team's projects load the first time it is chosen: skeletons in the shape of the rows stand in for them, once the load has taken 200 ms.

```tsx example=SkeletonList

```

## Anatomy

Choose one indicator by what is loading:

1. **A whole page or route:** the loading bar along the bottom edge of the frame's header, through `loading` on [AppShell.Root](../components/app-shell.md). It appears after 200 ms, creeps toward the end without implying a completion time, and completes and fades out when the work ends. `loadingLabel` names it, "Loading page" by default.
2. **Content whose shape is known:** [Skeleton](../components/skeleton.md) placeholders in a `LoadingState`, which names the region once with its `label`.
3. **A small area, or an update to content already shown:** a [Spinner](../components/spinner.md) with a `label`, beside what it updates.
4. **The result of an action:** `pending` on the [Button](../components/button.md) that started it.
5. **A task whose completion can be measured, such as an upload:** [Progress](../components/progress.md) with a `value` and a `valueText` in the units people think in.

## States and behaviour

- **Wait before showing anything.** A load that ends within 200 ms shows nothing: an indicator that flashes for a moment reads as a glitch. The loading bar waits on its own; for skeletons and spinners, start a timer and show them once it fires.
- **Keep what is already shown.** When content updates, leave it in place under a Spinner rather than swapping it for skeletons, and mark the region `aria-busy` while it changes.
- **Match the shape.** Skeletons stand in for the rows, lines and headings that will arrive, at about their size, so the page doesn't jump when the content lands.
- **Pending actions.** A pending Button keeps its size and ignores presses, so the work doesn't start again while it runs. The rest of the form stays usable unless the work depends on it.
- **Measurable work.** Progress moves as the work does and says what is done, such as "3 of 6 MB". Work whose end isn't known uses a Spinner instead of a bar that pretends to know.
- **The end.** When content arrives it replaces its placeholders in place. When it fails or turns out empty, show an [EmptyState](../components/empty-state.md) there instead, with a way to try again.
- **Reduced motion.** The loading bar fades instead of moving, skeletons stop pulsing and spinners turn slowly.

## Content guidelines

- Name what is loading, not that something is: "Loading projects", "Refreshing activity", "Uploading annual-review.pdf".
- Don't promise a time ("Almost there", "Just a second"): the indicator can't know it.
- Keep the label of a pending button as it was; the spinner says the work is running. Say the outcome once it is done, such as "Saved".

## Do and don't

### Do

- Show the indicator where the content will appear, at its size.
- Announce loading once per region: one `LoadingState` label, not one per placeholder.
- Leave controls that don't depend on the work usable while it runs.

### Don't

- Don't cover the page with a spinner for one region's update.
- Don't use a Progress bar for work whose end you can't measure.
- Don't show more than one indicator for the same work.

## Accessibility

### Focus and keyboard

Loading never moves focus. A pending button stays where it is in the tab order, so people go on from it as they would. Don't disable the control that started the work: a disabled button loses focus. Use `pending`, or keep it enabled and ignore presses while the work runs. When content replaces its placeholders, focus stays where it was; move it only when people asked for the content, such as a page they opened, and then to its heading or to the frame's `AppShell.Main`.

### envUI provides

- The loading bar's progressbar role and its `loadingLabel` name.
- A `LoadingState` that is a busy status region named by its `label`; Skeletons inside it are hidden from assistive technologies.
- A Spinner with a `label` as a named progress indicator; without one, it is hidden as decoration.
- A pending Button that keeps its size, reports that it is busy and ignores presses until the work ends.
- Progress with its value and `valueText` exposed to assistive technologies.

### You provide

- A label for every indicator that names what is loading.
- `aria-busy` on a region whose content updates under a Spinner.
- The delay before skeletons and spinners appear.
- A status message when an action completes, such as "Saved".

## Examples

### Page progress

Choosing a page in the sidebar starts loading it: the page on screen stays, and stays selected in the sidebar, and after 200 ms the bar along the header's bottom edge shows the next one is on its way, named by `loadingLabel`. When the page arrives, the bar completes and fades, the sidebar selects it, and focus moves to `AppShell.Main`, which takes focus without being a tab stop, unless people have moved focus elsewhere in the meantime. The frame sits in a box here, with `landmarks={false}` and `scroll="main"`; an application renders it at its root.

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
