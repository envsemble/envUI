# Disclosure

## React usage

```tsx
import { Disclosure, Text } from '@envsemble/envui';

<Disclosure title="How visibility works">
  <Text>Team projects are available to every workspace member.</Text>
</Disclosure>;
```

### Props & contracts

| Name                        | Contract                                                     |
| --------------------------- | ------------------------------------------------------------ |
| Disclosure title / children | One-line summary and optional detail                         |
| open / onToggle             | Native details state and event for controlled specimen state |
| Native details props        | ref, className and accessible attributes                     |

## Guidelines

- Keep a disclosure title on one line. Put secondary guidance behind the disclosure and essential instructions beside the task.
- Use the native disclosure interaction. Labels and details wrap within the available width.

TypeScript declarations provide the complete public API.

## Related topics

- [InfoChip](../components/chips.md)
- [Typography](../foundations/typography.md)
- [TextField](../components/text-field.md)
