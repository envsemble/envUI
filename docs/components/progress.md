---
title: Progress
summary: How much of a task is done, such as an upload, as a labelled bar, or that it runs while the amount is unknown.
status: beta
since: 0.2.0
category: Feedback & overlays
aliases:
  - progress bar
  - progress indicator
  - LoadingBar
  - loading bar
  - upload progress
  - percent complete
  - indeterminate progress
useWhen:
  - A task whose completion can be measured, such as an upload, an import or an export.
  - A task that has started but can't be measured yet, such as preparing an export (`value={null}`).
avoidWhen:
  - text: A measurement within a range, such as seats assigned or storage used.
    use: Meter
  - text: Work of unknown length in a small area, such as a panel that is updating.
    use: Spinner
  - text: Content of a known shape while it loads, such as a card or a list, as a skeleton.
    use: Surface
  - text: Loading a page or a route of an application, along the top bar.
    use: TopBar
  - text: Saying that a task finished or failed.
    use: Toast
related:
  - meter
  - spinner
  - loading
  - scaffold
  - toast
components:
  - Progress
---

# Progress

## Overview

Progress shows how much of a task is done, such as an upload.

```tsx example=UploadingFile

```

### Amount unknown

With `value={null}`, the indicator sweeps while the amount of work is unknown.

```tsx example=PreparingExport

```

### From preparing to done

Start with `value={null}`, show the share once it is known, and replace the bar with the result.

```tsx example=ExportMembers

```

## Variants

### Steps

`segments` splits the track into equal steps that fill in turn.

```tsx example=SetupSteps

```

## When to use

```tsx do=OneBarForBatch caption="One bar for one task, however many items it covers."

```

```tsx dont=BarPerFile caption="A bar for every file of one upload."

```

- Don't move the bar backwards, or hold it just short of the end.
- Offer a way to cancel a long task beside the bar.

### Content

```tsx do=ImportContacts caption="Name the task, and count items where people count them."

```

```tsx dont=VagueLabel caption="A label that doesn't say what is running."

```

## Anatomy

```tsx anatomy=ProgressAnatomy

```

1. **Progress** (`env-progress`)
2. **Label** (`env-progress-label`, `label`)
3. **Value** (`env-progress-value`, `valueText`)
4. **Track** (`env-progress-track`)
5. **Indicator** (`env-progress-indicator`, `value`)

With `segments`, the track holds one `env-progress-segment` per step.

## Adapting to width

The bar fills its container. The label and the value wrap onto two lines where they don't fit.

```tsx example=LongTaskName widths="12 24"

```

## Accessibility

### envUI provides

- `role="progressbar"` named by `label`, with its value and range, and no value while unknown.
- `aria-valuetext` from the prop.
- No growing or sweeping under reduced motion.

### You provide

- `aria-valuetext` where the value isn't a percentage, such as 120 of 480 contacts.
- A status that says when the task ends or fails, since changes of the value aren't announced.

## Changelog

- **1.0.0**: The classes are `env-progress*`; `segments` splits the track into steps; an indeterminate bar is read as Loading, and sweeps toward the end of the line also in right-to-left text; without `aria-valuetext` the formatted value stays; `className`, `style`, `ref` and data attributes reach the root.
- **1.0.0**: `LoadingBar` is no longer exported: TopBar's `loading` and `loadingLabel` show page progress, and Progress shows a task's.
- **0.4.0**: The track uses the translucent neutral fill, so it stays visible on panes, rows and cards.
- **0.2.0**: Progress.
