---
title: Progress
summary: Shows how much of a task is done, or that it is still running.
status: beta
since: 1.0.0
category: Feedback
aliases:
  - progress bar
  - progress indicator
  - LoadingBar
  - loading bar
  - upload progress
  - percent complete
  - indeterminate progress
useWhen:
  - A task whose completion can be measured, such as an upload or an import
  - A task that has started but can't be measured yet, such as preparing an export
avoidWhen:
  - text: A measurement within a range, such as seats assigned or storage used.
    use: Meter
  - text: Work of unknown length in a small area, such as a panel that is updating.
    use: Spinner
  - text: Loading a page or a route of an application, along the top bar.
    use: TopBar
components:
  - Progress
examples:
  UploadingFile:
    role: overview
    motion: true
  SetupSteps: example
  ProgressAnatomy: anatomy
  PreparingExport: example
  ExportMembers: example
  LongTaskName: example
  OneBarForBatch:
    role: do
    caption: One bar for one task, however many items it covers.
---

# Progress

## Variants

### Steps

```tsx figure=SetupSteps motion

```

## Anatomy

```tsx figure=ProgressAnatomy

```

1. **Progress** (`env-progress`)
2. **Label** (`env-progress-label`, `label`)
3. **Value** (`env-progress-value`, `valueText`)
4. **Track** (`env-progress-track`)
5. **Indicator** (`env-progress-indicator`, `value`)

## Behaviour

### Amount unknown

```tsx figure=PreparingExport

```

### From preparing to done

```tsx figure=ExportMembers motion

```

### Adapting to width

```tsx figure=LongTaskName widths="12 24" sweep

```

## Rules

```tsx figure=OneBarForBatch motion

```
