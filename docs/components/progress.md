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
  - text: Content of a known shape while it loads, such as a card or a list.
    use: Skeleton
  - text: Loading a page or a route of an application, along the topbar.
    use: AppShell
  - text: Saying that a task finished or failed.
    use: Toast
related:
  - meter
  - spinner
  - skeleton
  - app-shell
  - toast
components:
  - Progress
---

# Progress

## Overview

Progress shows how much of a task is done as a labelled bar, such as an upload or an import. With `value={null}` it shows that the task runs while its amount is still unknown. Assistive technology reads it as a progress bar named by its label, with its value and range.

Progress shares its look with Meter, which shows a measurement within a range. For loading a page or a route, AppShell's `loading` shows a bar along its topbar.

```tsx example=UploadingFile

```

## Anatomy

1. **Label** (`label`): muted 0.875 rem text at the start of the top row, which names the task.
2. **Value** (optional, `valueText`): the value as text at the end of the row, in the strong text color at medium weight, such as 40%. The label and the value keep 0.75 rem apart and wrap onto two lines when they don't fit.
3. **Track**: 0.625 rem tall and fully rounded, on the neutral fill, 0.5 rem below the row.
4. **Indicator**: the control blue with rounded ends, from the start of the track to the share done; while the amount is unknown, a 40% wide indicator that sweeps across the track.

The bar fills the width of its container; give the container a width where a full-width bar would be too long.

## States and behaviour

- **Known amount**: `value` between `min` and `max`, 0 and 100 by default. As the value changes, the indicator grows to it over 0.16 s; with a reduced-motion preference it changes at once. A value outside the range shows as the nearest end.
- **Unknown amount**: with `value={null}` the indicator sweeps from the start of the track to its end every 1.2 s, and the bar reports no value. With a reduced-motion preference it rests at the start of the track.
- **Done**: at `max` the bar is full and stays. It neither hides nor announces that the task ended; the application replaces it, or says so, such as with text or a Toast.
- **Announcements**: changes of the value aren't announced; people hear the value as they reach the bar. Announce what matters, such as the end of the task, in a status.
- **Read-only**: the bar takes no focus and no input.

## Content guidelines

- Name the task in the label, with what it acts on: "Uploading quarterly-report.pdf", "Importing contacts".
- Write the value as a percentage, or as items done of the total where people count them: "40%", "120 of 480".
- Write `aria-valuetext` with the unit in words where the value isn't a percentage: "120 of 480 contacts".
- Change the label when the task moves to a new step, such as from "Preparing export" to "Exporting members".

## Do and don't

### Do

- Start with `value={null}` until the amount of work is known, then show the amount.
- Keep the bar in place from the start of the task to its end, and replace it with the result.
- Offer a way to cancel a long task beside the bar, where the application can stop it.

### Don't

- Don't use Progress for a measurement within a range, such as storage used; use [Meter](../components/meter.md).
- Don't show a bar for work that ends in a moment; show the pending state of the button that started it.
- Don't move the bar backwards, or hold it just short of the end; show `value={null}` while the amount is unknown.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Pass over the bar, which takes no focus; screen readers reach it as they read the page. |

### envUI provides

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and no `aria-valuenow` while the amount is unknown.
- The label as the bar's name, through `aria-labelledby`.
- `aria-valuetext` from the prop.
- A label and a value in text colors that reach 4.5:1 on the canvas, panes and rows.
- No motion with a reduced-motion preference: the indicator neither grows nor sweeps.

### You provide

- A label that names the task.
- `aria-valuetext` where the value isn't a percentage, such as "120 of 480 contacts". Without it, a screen reader reads only the number.
- The value as the task proceeds, and what happens when it ends or fails, such as a status message, a Toast or an Alert.

## Examples

### Items done of a total

`max` is the number of items, and the value counts them; `aria-valuetext` reads it with its unit.

```tsx example=ImportContacts

```

### Amount unknown

`value={null}` shows a sweeping indicator while the task runs and its amount is still unknown.

```tsx example=PreparingExport

```

### From preparing to done

The export starts with an unknown amount, shows the share done once it is known, and ends with a status message in place of the bar. The button stays pending meanwhile.

```tsx example=ExportMembers

```

## Changelog

- **1.0.0**: `LoadingBar` is no longer exported: AppShell's `loading` and `loadingLabel` show page progress, and Progress shows a task's.
- **0.4.0**: The track uses the translucent neutral fill, so it stays visible on panes, rows and cards.
- **0.2.0**: Progress.
