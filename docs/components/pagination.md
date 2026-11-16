---
title: Pagination
summary: Previous and next page buttons, with the range of items shown.
status: stable
since: 1.0.0
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
examples:
  PagesOfAList:
    role: overview
    caption: The range counts items, as in 1–60 of 245.
  PaginationAnatomy: anatomy
  WithoutATotal: example
  ToolbarRow: example
---

# Pagination

## Variants

### Quiet buttons

```tsx figure=ToolbarRow widths="32 14" sweep

```

## Anatomy

```tsx figure=PaginationAnatomy

```

1. **Pagination** (`env-pagination`)
2. **Range** (`env-pagination-range`)
3. **Previous** (`env-pagination-button`)
4. **Next** (`env-pagination > env-pagination-button:last-child`)

## Behaviour

### While a page loads

<!-- specimen: WhileAPageLoads -->

### Without a known total

```tsx figure=WithoutATotal

```
