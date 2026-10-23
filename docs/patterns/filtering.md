---
title: Filtering and search
summary: Let people narrow a list or a table to what they want, see how many items match, and undo it in one step.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - filter
  - filters
  - search
  - filter bar
  - faceted search
  - filter chips
  - clear filters
  - result count
  - no results
useWhen:
  - A list or a table is long enough that people look for some of its items.
  - People narrow items by what they are, such as their status, owner or type.
avoidWhen:
  - text: Opening a page, a project or a document by name from anywhere in the application.
    use: CommandPalette
  - text: Choosing values for a form people submit.
    see: forms
  - text: Putting a table's rows in order.
    see: data-tables
  - text: No results that match, and a way to widen the search.
    see: empty-states
composes:
  - PageHeader
  - Column
  - Row
  - SearchField
  - Select
  - Combobox
  - Popover
  - Checkbox
  - Sheet
  - DialogClose
  - RadioGroup
  - Radio
  - Menu
  - Button
  - Badge
  - List
  - Text
  - useContainerSize
---

# Filtering and search

## Overview

Filtering helps people find items in a long list or table: a search and a few filters above the results, each applied as people choose it, a count of what matches, and one way to clear it all. When nothing matches, an [empty state](empty-states.md) names the query and offers Clear filters, under the toolbar that stays.

```tsx example=SearchAndFilters

```

### Keep the state in the address

Write the query and the filters into the address through the router, so a reload, the back button and a shared link show the same results; envUI's controls are controlled through `value`.

## Variants

### Filters in a popover

A Filters button, with a count Badge of the filters in use, opens a [Popover](../components/popover.md) of checkboxes in groups that apply as they change.

```tsx example=FilterPanel

```

### Filters in use

Each filter in use is a token named after it, "Status: Open", that removes it, beside Add filter and Clear filters. envUI has no removable chip yet: each is a small secondary Button with a Close `endIcon`.

```tsx example=ActiveFilters

```

## When to use

```tsx do=AppliedAtOnce caption="Each choice filters at once, and a count says how many match."

```

```tsx dont=WaitsForApply caption="An Apply button for quick filters: nothing says what will match."

```

- Keep an Apply button only for a slow or costly query, and say what it shows: "Show 12 projects".
- Count what the filters leave, never one page of a table.
- Never hide the search in a menu or a sheet.

### Content

- Label the search with what it searches, "Search projects".
- Name the option for all after the filter, "Any status", rather than "All".
- Count in the units of the items, "3 projects of 6", and say Clear filters for removing them all.

## Anatomy

```tsx anatomy=FilteringAnatomy

```

1. **Toolbar** (`env-page-header-toolbar`, `toolbar`)
2. **Search** (`env-text-field`)
3. **Filter** (`env-select`)
4. **More filters** (`env-badge[data-count]`)
5. **Count** (`env-page-header ~ env-text`)

The toolbar is no [Toolbar](../components/toolbar.md): every control keeps its tab stop, and the search its arrow keys.

## Adapting to width

Narrower than the `medium` [window class](../foundations/responsive.md), measured with useContainerSize, the filters move into a [Sheet](../components/sheet.md) opened by a Filters button, with its own count; the search stays in view.

```tsx example=NarrowFilters widths="24 44"

```

## Accessibility

Typing filters without moving focus, and the count is announced politely. The popover takes focus as it opens; Tab past its last checkbox closes it, and <kbd>Esc</kbd> returns focus to its button. When Clear filters or a token goes, focus moves to the search, or to the next token.

### envUI provides

- A SearchField named by its label, cleared with its button or <kbd>Esc</kbd>.
- A Popover that is a dialog named by its `title`, and a modal Sheet that keeps focus inside.
- A count Badge that reads its `aria-label` in place of the number.

### You provide

- The filtering, the state in the address, and a count in a `role="status"` element.
- A `fieldset` and `legend` around each group of checkboxes.
- Token names that say what pressing them does, "Remove filter Status: Open".

## Changelog

- **1.0.0**: The page is on the figure template.
