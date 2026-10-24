---
title: Pagination
summary: The range of items shown with previous and next page buttons, small enough for a toolbar.
status: stable
since: 0.6.0
category: Navigation
aliases:
  - paginator
  - paging
  - page navigation
  - page numbers
  - page range
  - next page
  - previous page
  - table pagination
useWhen:
  - A long list or table read a page at a time, such as invoices
  - A list read in batches whose total isn't known yet, such as a feed
  - Paging in a toolbar with little room, beside a search field
avoidWhen:
  - text: Links between the pages of an ordered sequence, such as the chapters of a guide.
    use: Pager
components:
  - Pagination
---

# Pagination

## Overview

The range counts items, as in 1–60 of 245. While a page loads, the button pressed shows a spinner and focus stays on it.

```tsx example=PagesOfAList

```

### Without a known total

Until the total is known, the range shows only the page's items.

```tsx example=WithoutATotal

```

## Variants

The buttons are secondary by default, or text for a quiet toolbar.

```tsx example=SmallToolbar caption="Small text buttons in a toolbar."

```

## When to use

### After a page loads

Keep focus where it is, and scroll the list to its top.

### Ends and totals

Show the total once it is known. Leave the end buttons to Pagination, which keeps them focusable and unavailable, and hide it where the items fit on one page.

## Anatomy

```tsx anatomy=PaginationAnatomy

```

1. **Pagination** (`env-pagination`)
2. **Range** (`env-pagination-range`)
3. **Previous** (`env-pagination-button`)
4. **Next** (`env-pagination > env-pagination-button:last-child`)

Not shown: the spinner while a page loads.

## Adapting to width

In a row, the pager keeps its width while a field beside it shrinks; only a container too narrow for the pager itself wraps the buttons below the range.

```tsx example=ToolbarRow widths="18 32"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the previous button, then the next; unavailable buttons stay in the tab order. |
| <kbd>Enter</kbd> or <kbd>Space</kbd>            | Asks for the page before or after; nothing at an end or while a page loads.             |
| <kbd>Esc</kbd>                                  | Hides the focused button's tooltip.                                                     |

### envUI provides

- A `nav` landmark named Pagination, with icon buttons named in tooltips.
- `aria-disabled` on a button with no page to go to, and `aria-busy` on the one whose load runs.
- The range as a polite live region, so the new range is announced once.

### You provide

- An `aria-label` that names what it pages through, where a page has several navigation landmarks.
- `pending` while a page loads, and the page itself.
- The strings in the application's language, through `messages.pagination`.

## In code

### Usage

Pagination shows `page`, counted from 1 and kept within the pages that exist, of `pageSize` items. `onPageChange` receives the page before or after when its button is pressed; the application loads that page and passes it back as `page`. While it loads, set `pending`: the button pressed shows a spinner, also when the load starts in an effect, and both buttons ignore presses while focus stays put. Keep focus where it is after the page loads, and scroll the list to its top.

```tsx source=PagesOfAList

```

#### Without a known total

`total` counts all items, when known: the range ends with it, as in 1–60 of 245, and the last page ends the list. Pass it once it is known. Without it, the range shows only the page's items, as in 61–120, and `hasNextPage`, `true` by default, says whether a later page exists, such as from a cursor's has more.

```tsx source=WithoutATotal

```

#### Strings

EnvUIProvider's `messages.pagination` sets the names, `label`, `previous` and `next`, and the `range` for every pager inside it, and its `locale` formats the numbers. `aria-label`, `previousLabel`, `nextLabel` and `formatRange` set them for one pager: `formatRange` receives the first and last item shown, the total, the page and the page count.

```tsx
import { useState } from 'react';
import { EnvUIProvider, Pagination } from '@envsemble/envui';

// The application's own strings for every pager inside the provider, in the page's language; an
// application that translates passes the strings of the reader's language. The numbers follow the
// locale the provider inherits from the page.
const messages = {
  pagination: {
    label: 'Result pages',
    previous: 'Previous results',
    next: 'More results',
    range: ({ start, end, total }: { start: string; end: string; total?: string }) =>
      total === undefined ? `${start}–${end}` : `${start}–${end} of ${total} results`,
  },
};

export default function ApplicationStrings() {
  const [page, setPage] = useState(2);
  return (
    <EnvUIProvider messages={messages}>
      <Pagination page={page} pageSize={20} total={1234} onPageChange={setPage} />
    </EnvUIProvider>
  );
}
```

#### Size and variant

`size` is `sm`, `md` or `lg`, the control heights; without it, the buttons take their container's. `variant` is the buttons' look, as on IconButton: `secondary` by default, or `text` for a quiet toolbar. `hideWhenSinglePage` renders nothing while every item fits on one page.

```tsx source=SmallToolbar

```

### Composition

The pager is a `nav`, `env-pagination`, with the range, `env-pagination-range`, and the previous and next buttons, `env-pagination-button`, the next one last; a loading button shows the spinner, `env-button-spinner`. The end buttons stay focusable with `aria-disabled` where there is no page to go to. In a row, the pager keeps its width while a field beside it shrinks.

## Changelog

- **1.0.0**: The range's numbers are in the locale, EnvUIProvider's or the runtime's, instead of always English, and the names and the range come from `messages.pagination`; `previousLabel`, `nextLabel`, `formatRange` and `aria-label` still override them.
- **0.6.0**: Pagination: the range of items shown, with previous and next buttons that wait while a page loads, `formatRange`, `hideWhenSinglePage` and `size="compact"`.
