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
  - One option from a list long enough to search, such as an owner
  - Several options from such a list, shown as chips
  - Options found by a search, such as contacts on a server
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

```tsx example=ChooseOwner

```

### States

A read-only field can be focused and its list browsed, but its value can't change.

<!-- specimen: States -->

### Several reviewers

Where people choose several options, each shows as a chip in the field, and the list stays open as they choose.

```tsx example=Reviewers

```

### Search on a server

The application can find the options itself, such as on a server, and a spinner shows while it searches.

```tsx example=ServerSearch

```

### In a form

The field sends its value with the form, or one entry for each chip. Checking the value and showing its error belong to the application.

```tsx example=RequiredInForm

```

## Variants

```tsx variants=Variants

```

1. **Outline**
2. **Floating**

| Variant  | Use for                                                 |
| -------- | ------------------------------------------------------- |
| Outline  | In forms, dialogs and toolbars. The default.            |
| Floating | A long form on a page, as TextField's floating variant. |

### Sizes

Small, medium and large, the control heights of the [scale](../foundations/spacing.md). A field without a visible label, such as in a toolbar, says what to type in its placeholder.

```tsx example=SmallToolbar

```

## When to use

```tsx do=ClearableOptional caption="A clear button where the value is optional."

```

```tsx dont=StuckOptional caption="An optional value that people can change but not remove."

```

### Options

Give options that share a label a description, such as an e-mail address. Text people type is never the value: offer it as an option instead.

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

One field can give its chips colors of their own: their fill and their text. Their hover, focus and press then follow them; with none set, they keep their own colors.

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

## In code

### Usage

Combobox takes its options as `items`, each with a `value` and a `label`, and optionally a `description` and `start` content, such as an Avatar; a ComboboxGroup puts items under a heading. Control it with `value`, `null` for none, and `onValueChange`, which receives the value and its item, or leave it uncontrolled with `defaultValue`. `label`, `description` and `error` work as on TextField. `clearable` adds a clear button while there is a value, and <kbd>Esc</kbd> on the closed field clears it too.

```tsx source=ChooseOwner

```

#### Several options

With `multiple`, `value` is an array of values, each shown as a chip with a remove button, and the list stays open as people choose.

```tsx source=Reviewers

```

#### Search on a server

By default the list shows the options whose label or description contains the typed text, ignoring case and accents, in `locale`; `filter` takes a function of your own. With `filter={null}` it shows `items` as given: search from `onInputValueChange`, which receives the typed text, and set `loading` while the search runs, which shows `loadingLabel` instead of `emptyLabel`. `onOpenChange` can load the options as the list opens.

```tsx source=ServerSearch

```

#### In a form

`name` submits the value, or one entry for each chip, and a form reset restores `defaultValue`. `readOnly` lets people focus the field and browse the list without changing the value. Validation and its `error` belong to the application.

```tsx source=RequiredInForm

```

#### Variants and sizes

`variant` is `outline`, the default, or `floating`, 3.5 rem tall with room for its label. `size` is `sm`, `md` or `lg`; without it, the field takes its container's control height. With `showLabel={false}`, a `placeholder` and an `aria-label` name it.

```tsx source=SmallToolbar

```

### Composition

The field is `env-field` with `env-combobox`: the control, `env-combobox-control`, holds the chips, `env-combobox-chip`, with their labels, `env-combobox-chip-label`, and remove buttons, `env-combobox-chip-remove`, IconButtons with a cross; then the input, `env-combobox-input`, the clear button, `env-combobox-clear`, and the trigger, `env-combobox-trigger`. The list is the shared popup, `env-combobox-popup`, and its options are its rows, `env-combobox-item`, with the check, `env-combobox-item-indicator`. `className` and `style` reach the field's root, and `ref` the input.

### Customize

`--env-combobox-chip-container` and `--env-combobox-chip-content` set the colors of one Combobox's chips, through `style` or CSS. Their hover, focus and press then follow them, as state layers; with none set, they keep their own colors.

## Changelog

- **1.0.0**: `hint` is `description` and `variant="outlined"` is `variant="outline"`, which the `v1-props` codemod writes. `className` and `style` style the field's root rather than the input, which takes `ref`. Read-only chips no longer carry `aria-readonly`, which the input reports. The popup is the shared popup and the options its rows, and a chip's remove button is an IconButton with a cross: `env-combobox-well` is `env-combobox-control`, `env-combobox-option` `env-combobox-item` and `env-combobox-check` `env-combobox-item-indicator`. The loading, empty, clear and remove labels come from EnvUIProvider's `messages`. An option's `leading` content is `start`, as on List.Item.
- **0.6.0**: Combobox, for one option or several, with leading content, descriptions, groups, a server search, compact density and native form support.
