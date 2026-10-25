---
title: Filtering and search
summary: Let people narrow a list or a table to what they want, see how many items match, and undo it in one step.
status: beta
since: 1.0.0
intent: Work with lists and tables
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
  - A list or a table long enough to look for items in
  - Narrowing items by what they are, such as status, owner or type
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
examples:
  SearchAndFilters: overview
  FilterPanel: example
  ActiveFilters: example
  FilteringAnatomy: anatomy
  NarrowFilters: example
  AppliedAtOnce:
    role: do
    caption: Each choice filters at once, and a count says how many match.
  WaitsForApply:
    role: dont
    caption: 'An Apply button for quick filters: nothing says what will match.'
---

# Filtering and search

## Variants

### Filters in a popover

A Filters button, with a count of the filters in use, opens a [Popover](../components/popover.md) of checkboxes in groups that apply as they change.

```tsx figure=FilterPanel

```

### Filters in use

Each filter in use is a token named after it, "Status: Open", beside Add filter and Clear filters. A token is a small button with a close cross that removes it.

```tsx figure=ActiveFilters

```

## Anatomy

```tsx figure=FilteringAnatomy

```

1. **Toolbar** (`env-page-header-toolbar`, `toolbar`)
2. **Search** (`env-text-field`)
3. **Filter** (`env-select`)
4. **More filters** (`env-badge[data-count]`)
5. **Count** (`env-page-header ~ env-text`)

A search and a few filters sit in the [PageHeader](../components/page.md)'s toolbar, above the results.

## Behaviour

### Keep the state in the address

Write the query and the filters into the address through the router, so a reload, the back button and a shared link show the same results.

### Adapting to width

Narrower than a medium [window](../foundations/responsive.md), the filters move into a [Sheet](../components/sheet.md) opened by a Filters button, with its own count; the search stays in view.

```tsx figure=NarrowFilters widths="24 44"

```

## Rules

Each choice filters at once, and a count says how many match.

```tsx figure=AppliedAtOnce

```

```tsx figure=WaitsForApply

```

### Apply only when slow

Keep an Apply button only for a slow or costly query, and say what it shows: "Show 12 projects".

### Count and search

Count what the filters leave, never one page of a table. Never hide the search in a menu or a sheet.

### Content

Name each control after what it does, and count in the items' units.

- Label the search with what it searches, "Search projects".
- Name the option for all after the filter, "Any status", rather than "All".
- Count in the units of the items, "3 projects of 6".
- Say Clear filters for removing them all.

## Accessibility

### Focus and keyboard

Typing filters without moving focus, and the count is announced politely.

- The popover takes focus as it opens.
- <kbd>Tab</kbd> past its last checkbox closes it, and <kbd>Esc</kbd> returns focus to its button.
- When Clear filters or a token goes, focus moves to the search, or to the next token.

### envUI provides

- A SearchField named by its label, cleared with its button or <kbd>Esc</kbd>.
- A Popover that is a dialog named by its `title`, and a modal Sheet that keeps focus inside.
- A count Badge that reads its `aria-label` in place of the number.

### You provide

- The filtering, the state in the address, and a count in a `role="status"` element.
- A `fieldset` and `legend` around each group of checkboxes.
- Token names that say what pressing them does, "Remove filter Status: Open".

## Compose

### Usage

Put the SearchField and the filters, Selects or Comboboxes, in the PageHeader's `toolbar`, and the count of what matches in a Text with `role="status"` below it. envUI's controls are controlled through `value` and `onValueChange`, so keep the query and the filters in the address through the router and pass them in.

```tsx source=SearchAndFilters

```

#### Filters in a popover

The Filters button is a small secondary Button, the trigger of a Popover with a `title`, holding a Badge with `count` and an `aria-label` that says what the number counts, "2 in use". Each group of Checkboxes is a native `fieldset` with its `legend`, and each box filters at once, so the popover has no Apply button and stays open.

#### Filters in use

Each token is a Button with `variant="secondary"`, `size="sm"` and a Close `endIcon`, whose `aria-label`, "Remove filter Status: Open", says what pressing it does and includes its visible text. The tokens sit in a Row with `role="group"` and an `aria-label`, beside a Menu for Add filter and a Clear filters Button. When a token goes, focus moves to the next token, or to the search, as the ActiveFilters example does.

```tsx
<Button
  variant="secondary"
  size="sm"
  endIcon={<Close />}
  aria-label="Remove filter Status: Open"
  onClick={() => remove('status')}
>
  Status: Open
</Button>
```

### Composition

#### Filters in a sheet on narrow screens

Measure the filters' own width with `useContainerSize` and compare it with `windowClasses.medium`: below it, the filters move into a Sheet opened by a Filters button with its own count Badge, and a DialogClose, "Show 12 projects", closes it. The sheet has its own `role="status"` count, there as it opens; the search stays in the toolbar. The NarrowFilters example builds it.

```tsx
<Sheet
  title="Filters"
  closeLabel="Close filters"
  trigger={
    <Button variant="secondary" size="sm" startIcon={<FilterList />}>
      Filters
      {applied > 0 && <Badge count={applied} aria-label={`${applied} in use`} />}
    </Button>
  }
  actions={<DialogClose variant="primary">Show 12 projects</DialogClose>}
>
  {filters}
</Sheet>
```

## Changelog

- **1.0.0**: The page is on the figure template.
