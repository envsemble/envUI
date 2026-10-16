# AnimatedNumber

## React usage

```tsx
import { AnimatedNumber, Button } from '@envsemble/envui';

<Button onClick={showResults}>
  Show <AnimatedNumber value={matchingHomes} /> homes
</Button>;
```

### Props & contracts

| Name              | Contract                                                         |
| ----------------- | ---------------------------------------------------------------- |
| value             | The number to show                                               |
| format            | Text for the value; the locale's number format by default        |
| Native span props | ref, className, style and accessible attributes on the container |

## Guidelines

- Use an animated number for a count that changes while the person makes choices elsewhere, such as matching results in a button label or seats left in a dialog. Keep static counts plain text.
- The new value rolls in from below when it grows and from above when it shrinks, in a quarter second. With reduced motion it only fades in.
- The text is always the current value, so accessible names and copied text never show an intermediate number. Digits use tabular figures, so the width changes only with the number of digits.

TypeScript declarations provide the complete public API.

## Related topics

- [Button](../components/button.md)
- [Typography](../foundations/typography.md)
- [Accessibility](../foundations/accessibility.md)
