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
  - A long list or table read a page at a time, such as reports or invoices.
  - A list read in batches whose total isn't known yet, such as an activity feed.
  - A toolbar with little room for paging, beside a search field or filters.
avoidWhen:
  - text: Links between the pages of an ordered sequence, such as the chapters of a guide.
    use: Pager
components:
  - Pagination
---

# Pagination

## Overview

Pagination shows which items of a long list are on screen, such as 1–60 of 245, and moves a page back or forward. The application owns the page and its loading; while `pending`, the button pressed shows a spinner and focus stays on it.

```tsx example=PagesOfAList

```

### Without a known total

Without `total`, the range shows only the page's items, and `hasNextPage` says when the list ends.

```tsx example=WithoutATotal

```

### The application's own strings

`messages.pagination` on EnvUIProvider sets the names and the range for every pager inside it, and its `locale` formats the numbers; `previousLabel`, `nextLabel` and `formatRange` set them for one pager.

```tsx example=ApplicationStrings

```

## Variants

`size` gives the buttons a control height, `sm`, `md` or `lg`, and `variant` their look, as on IconButton: secondary by default, or text for a quiet toolbar. Without a size they take their container's.

```tsx example=SmallToolbar caption="size sm and the text variant in a toolbar."

```

## When to use

```tsx do=MatchingSize caption="The size of the fields beside it."

```

```tsx dont=MismatchedSize caption="A larger size than the field beside it: the row doesn't line up."

```

- Keep focus where it is after a page loads, and scroll the list to its top.
- Pass `pending` while a page loads, and `total` once it is known.
- Leave the end buttons to the pager: they stay focusable and unavailable. `hideWhenSinglePage` hides a pager with one page.

## Anatomy

```tsx anatomy=PaginationAnatomy

```

1. **Pagination** (`env-pagination`)
2. **Range** (`env-pagination-range`)
3. **Previous** (`env-pagination-button`)
4. **Next** (`env-pagination > env-pagination-button:last-child`)

Not shown: the spinner, `env-button-spinner`, while a page loads.

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

## Changelog

- **1.0.0**: The range's numbers are in the locale, EnvUIProvider's or the runtime's, instead of always English, and the names and the range come from `messages.pagination`; `previousLabel`, `nextLabel`, `formatRange` and `aria-label` still override them.
- **0.6.0**: Pagination: the range of items shown, with previous and next buttons that wait while a page loads, `formatRange`, `hideWhenSinglePage` and `size="compact"`.
