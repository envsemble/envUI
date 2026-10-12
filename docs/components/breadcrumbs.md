# Breadcrumbs

## React usage

```tsx
import { Breadcrumbs } from '@envsemble/envui';

<Breadcrumbs
  items={[
    { label: 'Workspace', href: '/workspace' },
    { label: 'Plans', onClick: () => revealFolder('plans') },
    { label: 'Search', onClick: () => revealFolder('plans/search') },
    { label: 'Roadmap.md' },
  ]}
/>;
```

### Props & contracts

| Name         | Contract                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| items        | `{ label, href?, onClick? }` from the top level to the current page, which is last |
| href         | A destination, rendered through the LinkProvider link                              |
| onClick      | An action without a URL, rendered as a button styled like the links                |
| aria-label   | Accessible name of the navigation; Breadcrumb by default                           |
| Current page | The last item has aria-current="page" and is never a link                          |

## Guidelines

- Show breadcrumbs where people move through a hierarchy, such as folders above a document. They supplement the main navigation.
- The navigation is an ordered list. Chevron separators are decorative and mirror in right-to-left layouts.
- Earlier levels are muted until hovered; the current page is in the primary text color. Long labels truncate, and the trail wraps on narrow screens.
- An item without href or onClick is plain text, for a level that cannot be opened.

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation items](../components/navigation.md)
- [Tree](../components/tree.md)
- [Install the private package](../setup.md)
