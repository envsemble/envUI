---
title: Combobox
summary: A text field that filters a list of options as people type, to choose one option or, as chips, several.
status: stable
since: 0.6.0
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
  - People choose one option from a list long enough to search, such as an owner among a team's members.
  - People choose several options from such a list, which show as chips in the field (`multiple`).
  - The options come from a search, such as contacts on a server (`filter={null}`).
avoidWhen:
  - text: Choosing one of a handful of options, which people can scan without typing.
    use: Select
  - text: Typing a query that searches or filters content on the page.
    use: SearchField
  - text: Free text that is not one of the options, such as a name.
    use: TextField
  - text: One of two to five options shown side by side.
    use: SegmentedControl
  - text: Finding and running a command or opening a document by name.
    use: CommandPalette
components:
  - Combobox
---

# Combobox

## Overview

A combobox is a text field with a list of options: typing filters the list, and <kbd>Enter</kbd> chooses the first match.

```tsx example=ChooseOwner

```

### States

A read-only field can be focused and its list browsed, but its value can't change.

<!-- specimen: States -->

### Several reviewers

With `multiple`, chosen options are chips in the field, and the list stays open. <kbd>Backspace</kbd> in the empty text removes the last chip.

```tsx example=Reviewers

```

### Search on a server

With `filter={null}` the list shows the options the application finds for the typed text; `loading` shows a spinner while it searches.

```tsx example=ServerSearch

```

### In a form

`name` submits the value, or one entry for each chip. Validation and its `error` belong to the application.

```tsx example=RequiredInForm

```

## Variants

```tsx variants=Variants

```

1. **Outline**
2. **Floating**

| Variant    | Use for                                                 |
| ---------- | ------------------------------------------------------- |
| `outline`  | In forms, dialogs and toolbars. The default.            |
| `floating` | A long form on a page, as TextField's floating variant. |

### Sizes

`sm`, `md` and `lg`, the control heights of the [scale](../foundations/scale.md). With `showLabel={false}`, a placeholder and an `aria-label` name it.

```tsx example=SmallToolbar

```

## When to use

```tsx do=ClearableOptional caption="clearable where the value is optional."

```

```tsx dont=StuckOptional caption="An optional value that people can change but not remove."

```

- Give options that share a label a description, such as an e-mail address.
- Don't take free text as the value; offer it as an option, or use a TextField.

### Labels

Name the field after what people choose, and use the placeholder for what to type.

## Anatomy

```tsx anatomy=ComboboxAnatomy

```

1. **Field** (`env-combobox`)
2. **Control** (`env-combobox-control`)
3. **Chip** (`env-combobox-chip`)
4. **Chip label** (`env-combobox-chip-label`)
5. **Remove** (`env-combobox-chip-remove`)
6. **Input** (`env-combobox-input`)
7. **Clear** (`env-combobox-clear`, `clearable`)
8. **Trigger** (`env-combobox-trigger`)

```tsx anatomy=ComboboxListAnatomy open

```

1. **List** (`env-combobox-popup`)
2. **Option** (`env-combobox-item`, `items`)
3. **Leading content** (`env-combobox-item env-avatar`, `start`)
4. **Check** (`env-combobox-item-indicator`)

### Colors

`--env-combobox-chip-container` and `--env-combobox-chip-content` set the colors of one Combobox, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors. [Customize colors](../customizing-colors.md) describes the roles.

## Adapting to width

A field fills its container, and chips wrap onto more rows.

```tsx example=WrappingChips widths="16 30"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the field; its buttons and chips take no tab stop. |
| Typing                                          | Filters the options and highlights the first match.                  |
| <kbd>↓</kbd>, <kbd>↑</kbd>                      | Opens the list, or moves the highlight.                              |
| <kbd>Enter</kbd>                                | Chooses the highlighted option.                                      |
| <kbd>Esc</kbd>                                  | Closes the list; on a closed clearable field, clears it.             |
| <kbd>Backspace</kbd> in empty text              | Removes the last chip.                                               |
| <kbd>←</kbd> at the start of the text           | Moves to the chips; <kbd>Backspace</kbd> removes the focused one.    |

### envUI provides

- The combobox pattern: a `combobox` field with a `listbox` of options and the highlighted one as its active descendant.
- The label, description and error tied to the field, and `aria-invalid`.
- Remove buttons named after their option, such as Remove Alex Morgan.
- A status that announces loading and no matches.

### You provide

- A `label`, or `aria-label` on a field without one.
- The options, and with `filter={null}` the search behind them.
- Validation and its `error` message.
- `clearLabel`, `removeLabel`, `loadingLabel` and `emptyLabel` in the application's language.

## Changelog

- **1.0.0**: `hint` is `description` and `variant="outlined"` is `variant="outline"`, which the `v1-props` codemod writes. `className` and `style` style the field's root rather than the input, which takes `ref`. Read-only chips no longer carry `aria-readonly`, which the input reports. The popup is the shared popup and the options its rows, and a chip's remove button is an IconButton with a cross: `env-combobox-well` is `env-combobox-control`, `env-combobox-option` `env-combobox-item` and `env-combobox-check` `env-combobox-item-indicator`. The loading, empty, clear and remove labels come from EnvUIProvider's `messages`. An option's `leading` content is `start`, as on List.Item.
- **0.6.0**: Combobox, for one option or several, with leading content, descriptions, groups, a server search, compact density and native form support.
