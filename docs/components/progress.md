---
title: Progress
summary: How much of a task is complete, or that it runs while the amount is unknown.
status: beta
since: 0.2.0
category: Feedback & overlays
aliases:
  - progress bar
  - LoadingBar
  - loading bar
  - upload progress
related:
  - meter
  - spinner
  - colors
components:
  - Progress
---

# Progress

## React usage

```tsx
import { Progress } from '@envsemble/envui';

<Progress label="Uploading" value={40} valueText="40%" />
<Progress label="Preparing export" value={null} />
```

### Props & contracts

| Name              | Contract                                                            |
| ----------------- | ------------------------------------------------------------------- |
| label             | Visible label and accessible name                                   |
| value / min / max | Completed amount within the range; 0–100 by default                 |
| value             | null shows an indeterminate bar while the amount of work is unknown |
| valueText         | Optional visible value, such as "40%"                               |
| aria-valuetext    | Optional spoken value instead of the number                         |

## Guidelines

- Use Progress for the completion of a task, such as an upload or an export. Use Meter for a known quantity within a range, such as used seats or storage.
- The track uses the row fill and the indicator the control blue. Reduced motion stops the indeterminate animation.
- For work of unknown length in a small area, use a Spinner; for a whole page or route, see the [loading pattern](../patterns/loading.md).

TypeScript declarations provide the complete public API.

## Related topics

- [Meter](../components/meter.md)
- [Spinner](../components/spinner.md)
- [Colors & themes](../foundations/colors.md)
