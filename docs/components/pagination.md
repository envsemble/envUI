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
  - text: Switching between a few views of the same content.
    use: Tabs
related:
  - table
  - list
  - pager
  - button
  - tooltip
  - loading
components:
  - Pagination
---

# Pagination

## Overview

Pagination shows which items of a long list are on screen, such as 1–60 of 245, and moves a page back or forward. It is small enough for a toolbar: the range, then a previous and a next icon button with their names in tooltips, in a navigation landmark.

The application owns the page, the loading and the scroll position. Pagination reports the page a press asks for through `onPageChange`, shows a spinner on the button pressed while the page loads, announces the new range and keeps focus on the button, so people who page from the keyboard stay in place.

```tsx example=PagesOfAList

```

## Anatomy

1. **Landmark**: a `nav`, named Pagination unless `aria-label` names it, as wide as its content; its parts sit 0.25 rem apart on one line.
2. **Range**: the items shown, in 0.875 rem muted text with tabular digits, on one line, 0.75 rem before the buttons. `formatRange` writes it.
3. **Previous button**: an IconButton with a chevron that points back, named by `previousLabel` in a tooltip.
4. **Next button**: an IconButton with a chevron that points forward, named by `nextLabel`.
5. **Spinner** (while `pending`): replaces the chevron of the button pressed, at the button's size.

## Variants and sizes

| Option    | Use for                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------- |
| `size`    | The buttons' height, as on every control: `sm` in a toolbar beside small fields, `md` or `lg`. |
| `variant` | The buttons' look, as on IconButton: secondary by default, or text for a quiet toolbar.        |

- Without a size, the buttons take the control height of their container, `md` by default. See [scale and density](../foundations/scale.md).
- On touch screens the buttons grow to 2.75 rem, as every button does.
- In a toolbar the pager keeps its width while a field beside it shrinks; only a container too narrow for the pager itself wraps the buttons below the range.
- In right-to-left text the pager runs from the right, and the chevrons point the way the pages run.

## States and behaviour

- **Range**: the first and last item on the page and the total, such as 1–60 of 245; one number where the page holds one item, such as 241 of 241, and 0 of 0 for an empty list. Without `total` it shows only the page's items, such as 61–120. Numbers are English, such as 1,234, so the server and the browser render the same text; `formatRange` receives `start`, `end`, `total`, `page` and `pageCount` and writes it in another language.
- **Pages**: `page` counts from 1 in pages of `pageSize`, and stays within the pages that exist, so a page beyond the end shows the last one. With `total` the last page ends the list; without it, `hasNextPage`, true by default, says whether another page follows.
- **Paging**: a press calls `onPageChange` with the page before or after the current one, and nothing else; the application loads that page and passes it back as `page`.
- **Unavailable buttons**: on the first page the previous button, and on the last the next button, report `aria-disabled` and do nothing, but stay focusable and keep their tooltip, so focus never drops to the page when it reaches an end.
- **Pending**: while `pending` the button pressed shows a spinner and reports `aria-busy`, and both buttons ignore presses; focus stays on the button. The spinner shows for the load a press starts, whether `pending` follows at once or from an effect after the page changes, as with a query keyed by the page. A load for another reason, such as a refresh, makes both buttons wait without a spinner.
- **Announcements**: the range is a polite live region, so people hear the new range after a page loads while focus stays on the button.
- **Tooltips**: each button shows its name in a tooltip on hover and keyboard focus; <kbd>Esc</kbd> hides it.
- **A single page**: with `hideWhenSinglePage` the pager renders nothing while every item fits on one page.

## Content guidelines

- Name each pager after what it pages through, such as "Report pages", where a page has more than one navigation landmark.
- Keep the default names, Previous page and Next page, unless the interface is in another language; then set them, and the range, with EnvUIProvider's `messages.pagination`, or `previousLabel`, `nextLabel` and `formatRange` for one pager.
- Write the range as numbers people can check against the list, with an en dash between the first and last item, in the reader's number format.

## Do and don't

### Do

- Keep focus where it is and scroll the list to its top after a page loads, so the reader starts at the first new item.
- Pass `pending` while a page loads, and `total` as soon as it is known, such as on the last page.
- Give the pager the size of the fields beside it, such as `sm` in a toolbar.

### Don't

- Don't use Pagination between the pages of a guide or an article; use [Pager](../components/pager.md).
- Don't disable or hide the buttons at the ends yourself; the pager keeps them focusable and unavailable.
- Don't page a short list that fits on one screen; show it whole, or use `hideWhenSinglePage`.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the previous button, then to the next one; unavailable buttons stay in the tab order. |
| <kbd>Enter</kbd> or <kbd>Space</kbd>            | Asks for the page before or after the current one; does nothing at an end or while a page loads.     |
| <kbd>Esc</kbd>                                  | Hides the focused button's tooltip.                                                                  |

### envUI provides

- A `nav` landmark, named Pagination unless `aria-label` names it.
- Icon buttons named by `previousLabel` and `nextLabel`, with the names in tooltips, and decorative chevrons hidden from assistive technology.
- `aria-disabled` on a button that has no page to go to or waits for a load, and `aria-busy` on the button whose load is running; both stay focusable.
- The range as a polite, atomic live region, so a new range is announced once.
- The range's own text direction, so numbers keep their order in right-to-left text.

### You provide

- An `aria-label` that tells the pager apart where a page has several navigation landmarks, such as "Report pages".
- `pending` while a page loads, and the page itself.
- The strings in the application's language, through `messages.pagination` or the props, and a `lang` attribute, where the interface is not in English. The numbers follow EnvUIProvider's `locale`.

## Examples

### Without a known total

A list read in batches shows the items on the page; `hasNextPage` says when the list ends.

```tsx example=WithoutATotal

```

### In a small toolbar

`size="sm"` gives the buttons the small control height, as the field beside the pager has, and the field shrinks first. The text variant keeps the toolbar quiet.

```tsx example=SmallToolbar

```

### The application's own strings

EnvUIProvider's `messages.pagination` sets the strings of every pager inside it, in the reader's language, and its `locale` formats the numbers; `previousLabel`, `nextLabel` and `formatRange` set them for one pager. A pager in a language other than the page's takes `lang`, so assistive technology reads it in that language.

```tsx example=ApplicationStrings

```

## Changelog

- **1.0.0**: The range's numbers are in the locale, EnvUIProvider's or the runtime's, instead of always English, and the names and the range come from `messages.pagination`; `previousLabel`, `nextLabel`, `formatRange` and `aria-label` still override them.
- **0.6.0**: Pagination: the range of items shown, with previous and next buttons that wait while a page loads, `formatRange`, `hideWhenSinglePage` and `size="compact"`.
