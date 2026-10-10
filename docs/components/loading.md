# Loading

## React usage

```tsx
import { LoadingState, Skeleton } from '@envsemble/envui';

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

- Match placeholders to expected content without implying a precise completion time.
- Announce loading once per region. Respect the operating system reduced motion preference.

TypeScript declarations provide the complete public API.

## Related topics

- [Empty states](../components/empty-state.md)
- [Cards](../components/cards.md)
- [Accessibility](../foundations/accessibility.md)
