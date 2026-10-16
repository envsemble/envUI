# Meter

## React usage

```tsx
import { Meter } from '@envsemble/envui';

<Meter label="Seats assigned" value={2} max={5} valueText="2 of 5" />;
```

### Props & contracts

| Name              | Contract                                                         |
| ----------------- | ---------------------------------------------------------------- |
| label             | Visible label and accessible name                                |
| value / min / max | Current amount within the range; 0–100 by default, clamped to it |
| valueText         | Optional visible value, such as "2 of 5"                         |
| aria-valuetext    | Optional spoken value instead of the number                      |

## Guidelines

- Use Meter for a known quantity within a range, such as used seats or storage. Use Progress for the completion of a task.
- The track uses the row fill and the indicator the control blue.

TypeScript declarations provide the complete public API.

## Related topics

- [Progress](../components/progress.md)
- [Colors & themes](../foundations/colors.md)
