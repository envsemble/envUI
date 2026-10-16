# Skeleton

## React usage

```tsx
import { LoadingState, Skeleton } from '@envsemble/envui';

// Placeholders for incoming content.
<LoadingState label="Loading project">
  <Skeleton width="38%" height="1.25rem" />
  <Skeleton width="100%" height="0.8rem" />
  <Skeleton width="72%" height="0.8rem" />
</LoadingState>;
```

### Props & contracts

| Name                          | Contract                                                |
| ----------------------------- | ------------------------------------------------------- |
| Skeleton width / height       | CSS dimensions appropriate for anticipated content      |
| LoadingState label / children | Accessible loading announcement and visual placeholders |

## Guidelines

- Use skeletons in a LoadingState for content whose shape is known.
- Match placeholders to expected content without implying a precise completion time.
- Announce loading once per region. With reduced motion, skeletons stop pulsing.
- The [loading pattern](../patterns/loading.md) compares skeletons with spinners, progress and the page loading bar.

TypeScript declarations provide the complete public API.

## Related topics

- [Spinner](../components/spinner.md)
- [EmptyState](../components/empty-state.md)
- [Card](../components/card.md)
- [Accessibility](../foundations/accessibility.md)
