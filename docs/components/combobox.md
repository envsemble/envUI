---
title: Combobox
summary: A text field that filters options as people type, to pick one or several as chips.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - autocomplete
  - autosuggest
  - typeahead
  - type-ahead
  - searchable select
  - filterable select
  - select with search
  - multi-select
  - multiselect
  - tag input
  - token input
  - chips input
  - people picker
useWhen:
  - One option from a list long enough to search, such as an owner
  - Several options from such a list, shown as chips
  - Options found by a search, such as contacts on a server
avoidWhen:
  - text: One of a handful of options, which people scan without typing.
    use: Select
  - text: Typing a query that searches or filters content on the page.
    use: SearchField
  - text: Finding and running a command or opening a document by name.
    use: CommandPalette
components:
  - Combobox
examples:
  ChooseOwner:
    role: overview
    open: true
  ComboboxAnatomy: anatomy
  ComboboxListAnatomy: anatomy
  Reviewers: example
  ServerSearch: example
  RequiredInForm: example
  WrappingChips: example
  SmallToolbar: example
---

# Combobox

## Anatomy

```tsx figure=ComboboxAnatomy

```

1. **Field** (`env-combobox`)
2. **Chip** (`env-combobox-chip`)
3. **Chip label** (`env-combobox-chip-label`)
4. **Remove** (`env-combobox-chip-remove`)
5. **Input** (`env-combobox-input`)
6. **Clear** (`env-combobox-clear`, `clearable`)
7. **Trigger** (`env-combobox-trigger`)

```tsx figure=ComboboxListAnatomy open

```

1. **List** (`env-combobox-popup`)
2. **Option** (`env-combobox-item`, `items`)
3. **Leading content** (`env-combobox-item env-avatar`, `start`)
4. **Check** (`env-combobox-item-indicator`)

## Behaviour

### States

<!-- specimen: States -->

### Typing to filter

<!-- specimen: ChooseOwner -->

### Several reviewers

```tsx figure=Reviewers motion

```

### Search on a server

```tsx figure=ServerSearch motion

```

### In a form

```tsx figure=RequiredInForm motion

```

### Adapting to width

```tsx figure=WrappingChips widths="30 16" sweep

```

### In a toolbar

```tsx figure=SmallToolbar

```

## Accessibility

### Keyboard

| Key                                   | Action                                                            |
| ------------------------------------- | ----------------------------------------------------------------- |
| <kbd>Backspace</kbd> in empty text    | Removes the last chip.                                            |
| <kbd>←</kbd> at the start of the text | Moves to the chips; <kbd>Backspace</kbd> removes the focused one. |
