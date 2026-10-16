# Disclosure notes

## React usage

```tsx
import { DisclosureNote, Text } from '@envsemble/envui';

<DisclosureNote title="How visibility works">
  <Text>Team projects are available to every workspace member.</Text>
</DisclosureNote>;
```

### Props & contracts

| Name                            | Contract                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| DisclosureNote title / children | One-line summary and optional detail                         |
| open / onToggle                 | Native details state and event for controlled specimen state |
| Native details props            | ref, className and accessible attributes                     |

## Guidelines

- Keep a disclosure title on one line. Put secondary guidance behind the disclosure and essential instructions beside the task.
- Use the native disclosure interaction. Labels and details wrap within the available width.

TypeScript declarations provide the complete public API.

## Related topics

- [Info chips](../components/chips.md)
- [Typography](../foundations/typography.md)
- [Text fields](../components/text-field.md)
