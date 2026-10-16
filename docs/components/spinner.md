# Spinner

## React usage

```tsx
import { Button, Spinner } from '@envsemble/envui';

// Work in place.
<Spinner label="Refreshing seats" />;

// The result of an action: the pending state of the button that started it.
<Button pending={saving} onClick={save}>
  Save changes
</Button>;
```

### Props & contracts

| Name           | Contract                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| Spinner label  | Accessible name, or none when a busy control announces the work                            |
| Spinner size   | small, standard or large                                                                   |
| Button pending | A spinner replaces the content at the same size; the button is busy and ignores activation |

## Guidelines

- Use a spinner for work of unknown length in a small area, or an update to content already shown. For the result of an action, use the pending state of the button that started it.
- With reduced motion, spinners turn slowly.
- The [loading pattern](../patterns/loading.md) compares spinners with skeletons, progress and the page loading bar.

TypeScript declarations provide the complete public API.

## Related topics

- [Skeleton](../components/skeleton.md)
- [Button](../components/button.md)
- [Progress](../components/progress.md)
- [Accessibility](../foundations/accessibility.md)
