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

| Name                | Contract                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------- |
| title / description | Heading and concise explanation                                                             |
| icon / action       | Optional React content                                                                      |
| tone                | neutral (default) or error: error icon by default, announced as an alert                    |
| headingLevel        | The title's level in the page outline, 1–6; 4 by default, same look                         |
| align               | start (default), or center for a state that takes the place of a page's or region's content |

## Guidelines

- Distinguish first-use emptiness from a search with no results.
- Use the error tone when content failed to load, with a retry action. Report failed actions with an error toast instead.
- Offer an action that resolves the situation.
- Keep a state inside a card, panel or dialog aligned to the start. When it takes the place of a page's or region's content, such as a list with nothing in it yet, use `align="center"`: a larger icon, centred text and action, centred vertically in the height the application gives it. Give that region its height with layout, for example by letting it fill the rest of the page.
- When an empty or error state is the whole page, such as a failed sign-in, set headingLevel to 1 so the page keeps a top-level heading.

TypeScript declarations provide the complete public API.

## Related topics

- [Loading](../components/loading.md)
- [Cards](../components/cards.md)
- [Buttons](../components/buttons.md)
