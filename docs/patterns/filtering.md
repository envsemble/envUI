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
composes:
  - PageHeader
  - Stack
  - SearchField
  - Select
  - Combobox
  - Popover
  - Checkbox
  - Drawer
  - DialogClose
  - RadioGroup
  - Radio
  - Menu
  - Button
  - CounterBadge
  - Badge
  - List
  - Text
  - EmptyState
  - useBreakpoint
related:
  - data-tables
  - empty-states
  - navigation
  - text-field
  - select
  - popover
---

# Filtering and search

## Overview

Use this pattern to help people find items in a long list or table: a search field and a few filters above the results, each applied as people choose it, a count of what matches, and one way to clear it all. When nothing matches, the page says what was asked for and offers to clear it.

```tsx example=SearchAndFilters

```

## Anatomy

1. **Toolbar:** the `toolbar` of the page's [PageHeader](../components/page-header.md), a [Stack](../components/stack.md) row that wraps, with `controlSize="sm"` on the header and `size="sm"` on its fields. It is no [Toolbar](../components/toolbar.md): every control keeps its tab stop, and the search field its arrow keys.
2. **Search:** a [SearchField](../components/text-field.md) with a `label` that names what it searches, "Search projects".
3. **Filters:** a [Select](../components/select.md) with `variant="outline"` per filter of one value, with an option for all, such as "Any status". For a filter of several values, use a [Combobox](../components/combobox.md) with `multiple`, or Checkboxes.
4. **More filters:** a "Filters" [Button](../components/button.md), with a [CounterBadge](../components/badge.md) of the filters in use, that opens a [Popover](../components/popover.md) of [Checkboxes](../components/checkbox.md) in groups, or a [Drawer](../components/drawer.md) on narrow screens.
5. **Filters in use:** a row of removable tokens, one per filter, each a small secondary Button, with "Add filter", a [Menu](../components/menu.md), and "Clear filters".
6. **Count:** a [Text](../foundations/typography.md) with `role="status"` that says how many items match, "3 projects of 6".
7. **No results:** an [EmptyState](../components/empty-state.md) in place of the results, under the toolbar, with "Clear filters".

## States and behaviour

- **Apply at once.** Each change, a typed letter, a chosen option or a checked box, filters the results at once; there is no Apply button. Keep one only for a filter whose query is slow or costly, and then say so on the button: "Show 12 projects".
- **Keep the state in the address.** Write the query and the filters into the address, so a reload, the back button and a shared link show the same results. That is the application's router; envUI's controls are controlled through `value`.
- **The count.** The status under the toolbar says how many items match, and is announced as it changes. Count only what the filters leave, not what a page of a table shows.
- **Clear filters.** It shows while anything is filtered, and sets every filter back to all, the search included. When the button goes with the filters, focus moves to the search field or the first control.
- **No results.** The EmptyState names the query, "No project names contain “roadmap”", and offers "Clear filters". The toolbar stays above it, so people can change one filter instead.
- **A popover of filters.** Its checkboxes apply as they change, and it stays open until people close it, with <kbd>Esc</kbd>, a press outside or <kbd>Tab</kbd> past its last control; the list behind it changes as they go. The Filters button counts the filters in use.
- **Filter tokens.** Each filter in use shows as a token named after it, "Status: Open". Pressing it removes the filter; focus moves to the next token, or to "Add filter" when none is left. envUI has no removable token, or chip, yet: each is a `Button variant="secondary" size="sm"` with a Close `endIcon`.
- **Narrow windows.** Below the `md` breakpoint, from [useBreakpoint](../foundations/responsive.md), the filters move into a Drawer opened by the Filters button, and the search stays in view. The drawer's filters apply at once too; its primary button closes it and says how many results it shows.

## Content guidelines

- Label the search field with what it searches, "Search projects", following [Labels, descriptions and placeholders](../foundations/content.md#labels-descriptions-and-placeholders); a placeholder isn't needed.
- Name the option for all after the filter, "Any status", "Any owner", rather than "All" or a blank.
- Count in the units of the items, "3 projects of 6", with plurals from a function, as [Numbers, dates and time](../foundations/content.md#numbers-dates-and-time) describes.
- Write the no-results state as [Empty states](../foundations/content.md#empty-states) describes: the title states the fact, "No matching projects", the description names the query, and the action is "Clear filters".
- Use "Clear filters" for removing every filter, and "Apply" only where a button applies them, as the word table in [Buttons and actions](../foundations/content.md#buttons-and-actions) says.

## Do and don't

### Do

- Filter as people choose, and show the count.
- Keep the toolbar above the results and the no-results state.
- Offer one action that clears every filter.
- Keep the filters in the address.

### Don't

- Don't add an Apply button to filters that are quick to apply.
- Don't hide the search in a menu or a drawer.
- Don't replace the toolbar with the empty state; people would lose the way back.
- Don't show the count of a single page of results as the number that match.

## Accessibility

### Focus and keyboard

The search field, each Select and each button in the toolbar is a tab stop, in the order they show. Typing filters without moving focus, and the count is announced politely once the results change. A Select returns focus to its trigger once an option is chosen. The Filters popover takes focus into itself as it opens. <kbd>Tab</kbd> moves through its checkboxes, and past the last one closes it and goes on from the Filters button; <kbd>Esc</kbd> closes it and returns focus to the button. "Clear filters" moves focus to the search field when it goes. Removing a token moves focus to the next token, or to "Add filter". The Drawer traps focus while open and returns it to its trigger on closing.

### envUI provides

- A SearchField that is a search input named by its label, with a clear button while it has a query; <kbd>Esc</kbd> clears it too.
- Selects named by their `aria-label` or `label`, which report the chosen option.
- A Popover that is a dialog named by its `title`, and isn't modal, which takes focus as it opens and returns it to its trigger when <kbd>Esc</kbd> closes it.
- A Drawer that is a modal dialog named by its `title`, with focus kept inside and returned on closing.
- A CounterBadge that reads its `aria-label` in place of the number.

### You provide

- The filtering, and the state in the address.
- A count in a `role="status"` element, which says how many items match.
- A `fieldset` and `legend` around each group of checkboxes, until envUI has a checkbox group.
- Names for filter tokens that say what pressing them does, "Remove filter Status: Open", starting with or containing their visible text.
- Where focus goes when a control it was on goes, such as after "Clear filters".

## Examples

### Filters in a popover

A Filters button opens a popover of checkboxes in two groups, Type and Edited by; each box filters the documents at once, and the button counts the filters in use.

```tsx example=FilterPanel

```

### Filters in use

Each filter in use is a token that removes it, with "Add filter" to choose another and "Clear filters" to remove them all. envUI has no removable token yet: each is a small secondary Button with a Close icon, named "Remove filter" and its text.

```tsx example=ActiveFilters

```

### Narrow windows

Below the `md` breakpoint the Selects move into a Drawer opened by a Filters button, and the search stays in the toolbar. Narrow the window to see it.

```tsx example=NarrowFilters

```
