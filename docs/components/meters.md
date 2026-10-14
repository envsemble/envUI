# Meters & progress

## React usage

```tsx
import { Meter, Progress } from '@envsemble/envui';

<Meter label="Seats assigned" value={2} max={5} valueText="2 of 5" />
<Progress label="Uploading" value={40} valueText="40%" />
<Progress label="Preparing export" value={null} />
```

### Props & contracts

| Name              | Contract                                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| label             | Visible label and accessible name                                            |
| value / min / max | Current amount within the range; 0–100 by default. Meter clamps to the range |
| valueText         | Optional visible value, such as "2 of 5"                                     |
| aria-valuetext    | Optional spoken value instead of the number                                  |
| Progress value    | null shows an indeterminate bar while the amount of work is unknown          |

## Guidelines

- Use Meter for a known quantity within a range, such as used seats or storage. Use Progress for the completion of a task.
- The track uses the row fill and the indicator the control blue. Reduced motion stops the indeterminate animation.

TypeScript declarations provide the complete public API.

## Related topics

- [Loading](../components/loading.md)
- [Colors & themes](../foundations/colors.md)
