---
title: Progress
summary: How much of a task is done, such as an upload, as a labelled bar, or that it runs while the amount is unknown.
status: beta
since: 0.2.0
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
  - text: Files that each upload on their own, with a bar in each file's row.
    see: file-upload
  - text: A measurement within a range, such as seats assigned or storage used.
    use: Meter
  - text: Work of unknown length in a small area, such as a panel that is updating.
    use: Spinner
  - text: Loading a page or a route of an application, along the top bar.
    use: TopBar
  - text: Content of a known shape loading in its place, such as a card or a list, as a skeleton.
    see: loading
components:
  - Progress
examples:
  UploadingFile: overview
  SetupSteps: example
  ProgressAnatomy: anatomy
  PreparingExport: example
  ExportMembers: example
  LongTaskName: example
  OneBarForBatch:
    role: do
    caption: One bar for one task, however many items it covers.
  BarPerFile:
    role: dont
    caption: A bar for every file of one task, as when they upload together.
---

# Progress

## Variants

### Steps

The track can split into equal steps that fill in turn.

```tsx figure=SetupSteps

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

### Amount known

The bar counts the work done, such as 40 of 100.

### Amount unknown

While the amount of work is unknown, the indicator sweeps along the track.

```tsx figure=PreparingExport

```

### From preparing to done

Start with an unknown amount, show the share once it is known, and replace the bar with the result.

```tsx figure=ExportMembers

```

### Adapting to width

The bar fills its container. The label and the value wrap onto two lines where they don't fit.

```tsx figure=LongTaskName widths="12 24"

```

## Rules

One bar stands for one task.

```tsx figure=OneBarForBatch

```

```tsx figure=BarPerFile

```

### Moving forward

Never move the bar backwards or hold it just short of the end, and offer a way to cancel a long task beside it.

## Accessibility

### envUI provides

- `role="progressbar"` named by `label`, with its value and range, and no value while unknown.
- `aria-valuetext` from the prop.
- No growing or sweeping under reduced motion.

### You provide

- `aria-valuetext` where the value isn't a percentage, such as 120 of 480 contacts.
- A status that says when the task ends or fails, since changes of the value aren't announced.

## Compose

### Usage

Progress takes `value`, how much of the task is done, between `min`, 0 by default, and `max`, 100 by default, such as 40 of 100. Its `label`, above the bar, names it. `valueText` shows the value at the end of the label's row, formatted by the application; without it, no value shows. `aria-valuetext` is the value as assistive technology reads it, such as 120 of 480 contacts; without it, the value is read as a percentage of the range.

```tsx source=UploadingFile

```

#### Amount unknown

`value={null}` shows an indeterminate bar, which sweeps toward the end of the line, also in right-to-left text, and is read as Loading. Start with `null`, set the value once it is known, and replace the bar with the result.

```tsx
<Progress
  label={preparing ? 'Preparing export' : 'Exporting members'}
  value={preparing ? null : percent}
  valueText={preparing ? undefined : `${percent}%`}
/>
```

#### Steps

`segments` splits the track into that many equal steps, such as 4 for a task of four stages, each filling in turn.

```tsx
<Progress label="Setting up the workspace" value={2} max={4} segments={4} valueText="Step 2 of 4" />
```

### Composition

The parts are the bar, `env-progress`, its label, `env-progress-label`, its value, `env-progress-value`, the track, `env-progress-track`, and the indicator, `env-progress-indicator`; with `segments`, the track holds one `env-progress-segment` per step. `className`, `style`, `ref` and data attributes reach the root. Changes of the value aren't announced, so say in a status when the task ends or fails. A TopBar's `loading` shows a page's progress.

## Changelog

- **1.0.0**: The classes are `env-progress*`; `segments` splits the track into steps; an indeterminate bar is read as Loading, and sweeps toward the end of the line also in right-to-left text; without `aria-valuetext` the formatted value stays; `className`, `style`, `ref` and data attributes reach the root.
- **1.0.0**: `LoadingBar` is no longer exported: TopBar's `loading` and `loadingLabel` show page progress, and Progress shows a task's.
- **0.4.0**: The track uses the translucent neutral fill, so it stays visible on panes, rows and cards.
- **0.2.0**: Progress.
