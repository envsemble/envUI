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

| Name                | Contract                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| title / description | Heading and concise explanation                                          |
| icon / action       | Optional React content                                                   |
| tone                | neutral (default) or error: error icon by default, announced as an alert |
| headingLevel        | The title's level in the page outline, 1–6; 4 by default, same look      |

## Guidelines

- Distinguish first-use emptiness from a search with no results.
- Use the error tone when content failed to load, with a retry action. Report failed actions with an error toast instead.
- Offer an action that resolves the situation. Keep the content aligned to the start.
- When an empty or error state is the whole page, such as a failed sign-in, set headingLevel to 1 so the page keeps a top-level heading.

TypeScript declarations provide the complete public API.

## Related topics

- [Loading](../components/loading.md)
- [Cards](../components/cards.md)
- [Buttons](../components/buttons.md)
