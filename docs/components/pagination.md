# Pagination

## React usage

```tsx
import { Pagination } from '@envsemble/envui';

<Pagination
  aria-label="Report pages"
  page={page}
  pageSize={60}
  total={reportCount}
  pending={loading}
  onPageChange={setPage}
/>

<Pagination
  page={page}
  pageSize={50}
  hasNextPage={batch.hasMore}
  size="compact"
  onPageChange={setPage}
/>
```

### Props & contracts

| Name                          | Contract                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| page                          | The page shown, counted from 1; kept within the pages that exist                                                  |
| pageSize                      | The most items a page shows                                                                                       |
| total                         | All items; omit when it is not known, and the range shows without it                                              |
| hasNextPage                   | Whether a later page exists, for a list without total; true by default                                            |
| onPageChange                  | Receives the page before or after the current one; the application loads it and passes the new page               |
| pending                       | A page is loading: the button pressed shows a spinner and both buttons wait, without losing focus                 |
| hideWhenSinglePage            | Renders nothing while all items fit on one page                                                                   |
| formatRange                   | Text for the range from `{ start, end, total, page, pageCount }`; 1–60 of 245 by default, or 61–120 without total |
| previousLabel / nextLabel     | Names and tooltips of the buttons; Previous page and Next page by default                                         |
| variant                       | As IconButton; secondary by default                                                                               |
| size                          | standard (default) takes the surrounding density; compact gives 2 rem buttons anywhere                            |
| aria-label / native nav props | The navigation's name, Pagination by default; ref, className, style and accessible attributes                     |

## Guidelines

- Use Pagination where a list is read a page at a time, such as a long table, and the toolbar has little room. The application owns the page, the loading and the scroll position; Pagination shows where the reader is and asks for the next or previous page.
- The range comes first, then the previous and next buttons, in a navigation landmark. Name it with aria-label where a page has more than one, such as Report pages. The range is announced politely when it changes, so people who press Next from the keyboard hear the new range while focus stays on the button.
- Without total the range shows only the items on the page, such as 61–120, and hasNextPage says when the list ends. Pass total once it is known, such as on the last page, so the range ends at the last item.
- The first and last pages leave the button that would go past them unavailable but focusable, so focus never drops to the page. While pending, the button pressed shows a spinner and both buttons ignore presses; focus stays on the button.
- The buttons are IconButtons with their names in tooltips. They are 2.5 rem tall, or 2 rem in a compact surface or with size="compact", so the pager fits a compact toolbar beside 2 rem fields and buttons; both grow to 2.75 rem on touch screens.
- The range keeps tabular digits and one line. In a toolbar the pager keeps its width while fields beside it shrink; only a container too narrow for the pager itself wraps the buttons below the range. In right-to-left text the pager runs from the right and the chevrons point the way the pages run.
- Localize with formatRange, previousLabel and nextLabel; the default numbers are English, so server and browser render the same text.

TypeScript declarations provide the complete public API.

## Related topics

- [Tables](../components/tables.md)
- [Buttons](../components/buttons.md)
- [Loading](../components/loading.md)
