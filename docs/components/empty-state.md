# Empty states

## React usage

```tsx
import { EmptyState, Button } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

<EmptyState
  icon={<Search />}
  title="No results"
  description="Try a different name or clear the filters."
  action={
    <Button variant="secondary" onClick={clearFilters}>
      Clear filters
    </Button>
  }
/>;
```

### Props & contracts

| Name                | Contract                        |
| ------------------- | ------------------------------- |
| title / description | Heading and concise explanation |
| icon / action       | Optional React content          |

## Guidelines

- Distinguish first-use emptiness from a search with no results.
- Offer an action that resolves the situation. Keep the content aligned to the start.

TypeScript declarations provide the complete public API.

## Related topics

- [Loading](../components/loading.md)
- [Cards](../components/cards.md)
- [Buttons](../components/buttons.md)
