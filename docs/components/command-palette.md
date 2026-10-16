# CommandPalette

## React usage

```tsx
import { CommandPalette } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

// The application filters and ranks its items, in display order.
const items = rankDocuments(documents, query).map((document) => ({
  id: document.path,
  label: document.name,
  detail: document.folder,
  icon: <Description />,
  group: document.recent ? 'Recently opened' : 'Documents',
}));

<CommandPalette
  open={quickOpen}
  onOpenChange={(open) => {
    setQuickOpen(open);
    if (!open) setQuery('');
  }}
  aria-label="Go to document"
  placeholder="Search documents"
  query={query}
  onQueryChange={setQuery}
  items={items}
  onSelect={(item, { modifier }) => openDocument(item.id, { toTheSide: modifier })}
  emptyLabel="No matching documents"
  hints={[
    { keys: ['Enter'], label: 'Open' },
    { keys: ['Ctrl', 'Enter'], label: 'Open to the side' },
  ]}
/>;
```

### Props & contracts

| Name                  | Contract                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| open / onOpenChange   | Controlled visibility; <kbd>Esc</kbd>, the backdrop and a selection call onOpenChange(false)                                     |
| aria-label            | Required name of the dialog, its search field and its list                                                                       |
| query / onQueryChange | Controlled search text                                                                                                           |
| items                 | `{ id, label, textValue?, detail?, icon?, group?, trailing? }` already filtered and ranked                                       |
| onSelect              | <kbd>Enter</kbd> or click; modifier is true with <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> held                                          |
| closeOnSelect         | Close after onSelect; true by default                                                                                            |
| placeholder           | Hint inside the empty search field                                                                                               |
| emptyLabel            | Message when there are no items (No results by default)                                                                          |
| hints                 | Key hints below the list: `{ keys, label }`, such as `{ keys: ['Ctrl', 'Enter'], label: 'Open to the side' }`, shown as Kbd keys |
| footer                | Other content below the list, after the hints                                                                                    |
| Option elements       | role option with a data-item-id attribute                                                                                        |

## Guidelines

- Use the palette for jumping to a document or running a command by name. The application owns the shortcut that opens it, the data, filtering and ranking, and what selection does.
- The search field keeps focus. It is a combobox that controls the list and points aria-activedescendant at the highlighted option. <kbd>↑</kbd> and <kbd>↓</kbd> move the highlight and wrap, <kbd>Home</kbd> and <kbd>End</kbd> reach the ends, and <kbd>Page Up</kbd> and <kbd>Page Down</kbd> move by a page. A new query highlights the first item again.
- Pointer movement highlights an option; a click selects it. <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> with <kbd>Enter</kbd> or a click sets modifier, for example to open beside the current document.
- A heading appears where group changes between consecutive items, and those items form a labelled group. Keep groups together in items.
- Use textValue when a label is not plain text, so the option keeps a clear accessible name. Use detail for a muted fact such as a folder, and trailing for a Kbd hint or Badge.
- The palette opens near the top of the window over a backdrop, in the originating theme. The list scrolls the highlighted option into view and is at most 60% of the viewport tall. <kbd>Esc</kbd> closes it and focus returns to where it was.

TypeScript declarations provide the complete public API.

## Related topics

- [Dialog](../components/dialog.md)
- [Menu](../components/menu.md)
- [TextField](../components/text-field.md)
- [Accessibility](../foundations/accessibility.md)
