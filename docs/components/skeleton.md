---
title: Skeleton
summary: Placeholders in the shape of content that is loading, in a LoadingState that names the region once.
status: beta
since: 0.1.0
category: Feedback & overlays
aliases:
  - placeholder
  - loading placeholder
  - content placeholder
  - skeleton screen
  - shimmer
  - ghost
  - LoadingState
  - loading state
  - loading
useWhen:
  - Content of a known shape while it loads, such as a card, a list or a summary.
  - The first load of a region, so the page keeps its layout when the content arrives.
avoidWhen:
  - text: An update to content already shown, or content whose shape isn't known.
    use: Spinner
  - text: A task whose completion can be measured, such as an upload.
    use: Progress
  - text: Content that is empty or failed to load.
    use: EmptyState
  - text: The application frame before the first page loads.
    use: AppShellSkeleton
related:
  - spinner
  - progress
  - empty-state
  - card
  - app-shell
components:
  - Skeleton
  - LoadingState
---

# Skeleton

## Overview

Skeletons are placeholders in the shape of content that is loading: a block for a heading, a line of text or a row. They hold the content's place, so the page keeps its layout when it arrives, and they pulse to show the content is on its way.

Put a region's skeletons in a **LoadingState**. It names the region once, such as Loading project, and marks it busy, while each skeleton is hidden from assistive technology.

```tsx example=ProjectSummary

```

## Anatomy

1. **LoadingState** (`label`): a region that stacks its children 0.5 rem apart, named by `label` (Loading by default) for assistive technology.
2. **Skeleton** (`width`, `height`, `tone`): a block with 0.5 rem corners on the neutral fill. It is 0.8 rem tall and as wide as its container unless `width` and `height` say otherwise.

## Variants and sizes

| Tone             | Use for                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `base` (default) | Most placeholders, such as lines of text and rows.                     |
| `highlight`      | A placeholder that stands out among the others, such as a row's title. |

- `width` and `height` take any CSS length. Match the content that replaces the placeholder: a heading's line height, about 0.8 rem for a line of body text, a row's height.
- The base tone is the neutral fill, a translucent layer of the text color, so placeholders stay visible on the canvas, panes, rows and cards. The highlight tone is one step stronger.
- For a round placeholder, such as an avatar's, give a square skeleton a 50% `borderRadius` in `style`.

## States and behaviour

- **Motion**: skeletons pulse between full and 55% opacity, 1.6 s each way. With a reduced-motion preference they stay still.
- **Hidden placeholders**: every skeleton has `aria-hidden`, so assistive technology skips it.
- **The region**: LoadingState has `role="status"`, its `label` as `aria-label`, and `aria-busy="true"`. An `aria-label` given to it replaces the label.
- **Replacing**: the application replaces the LoadingState with the content, or with an EmptyState when there is none or it failed to load. Skeletons don't time out.

## Content guidelines

- Name what loads in the label, as an ongoing action: "Loading project", "Loading members".
- Shape the placeholders like the content: as many lines as the text usually takes, a heading shorter than the body, rows as tall as the rows that follow.

## Do and don't

### Do

- Put a region's skeletons in one LoadingState with a label.
- Match the placeholders to the content's size, so nothing moves when it arrives.
- Vary the widths of lines of text, so they read as text.

### Don't

- Don't use skeletons for content whose shape isn't known, or for an update to content already shown; use [Spinner](../components/spinner.md).
- Don't put a LoadingState around each skeleton; one names the whole region.
- Don't keep skeletons after loading fails; show an [EmptyState](../components/empty-state.md) with a way to try again.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Pass over the placeholders, which take no focus; screen readers reach the region as they read the page. |

### envUI provides

- Skeletons hidden from assistive technology with `aria-hidden`.
- LoadingState as a status region (`role="status"`) named by its `label` and marked busy with `aria-busy`, so assistive technology meets one name for the region instead of each placeholder.
- Placeholders that stay still with a reduced-motion preference.

### You provide

- A `label` for each LoadingState that says what loads.
- The content, or an EmptyState, in place of the LoadingState when loading ends.
- Focus kept where it was while content loads, such as on the control that changed it.

## Examples

### Rows of a list

An avatar and two lines per row. The round avatar is a square skeleton with a 50% radius, and each row's name takes the highlight tone.

```tsx example=MemberRows

```

### Rows of settings

Placeholders as tall as the rows that replace them.

```tsx example=SettingsRows

```

### From placeholders to content

Choosing another project shows placeholders in the card's place until it loads; focus stays on the choice.

```tsx example=LoadThenShow

```

## Changelog

- **0.4.0**: The base tone uses the translucent neutral fill, so placeholders stay visible on panes, rows and cards.
- **0.3.0**: Skeletons pulse.
- **0.1.0**: Skeleton and LoadingState.
