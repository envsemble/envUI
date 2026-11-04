---
title: Combobox
summary: A text field that filters a list of options as people type, to choose one option or, as chips, several.
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

Not shown: the control, which holds the chips, the input and the buttons, and takes the field's own box.

```tsx figure=ComboboxListAnatomy open

```

1. **List** (`env-combobox-popup`)
2. **Option** (`env-combobox-item`, `items`)
3. **Leading content** (`env-combobox-item env-avatar`, `start`)
4. **Check** (`env-combobox-item-indicator`)

## Behaviour

### States

A read-only field can be focused and its list browsed, but its value can't change.

<!-- specimen: States -->

### Typing to filter

The list narrows as people type, and the whole list opens again from the field's button.

<!-- specimen: ChooseOwner -->

### Several reviewers

Where people choose several options, each shows as a chip in the field, and the list stays open as they choose.

```tsx figure=Reviewers motion

```

### Search on a server

The application can find the options itself, such as on a server, and a spinner shows while it searches.

```tsx figure=ServerSearch motion

```

### In a form

A required field shows its error when the form is sent without a value.

```tsx figure=RequiredInForm motion

```

### Adapting to width

A field fills its container, and chips wrap onto more rows.

```tsx figure=WrappingChips widths="30 16" sweep

```

## Rules

A combobox's value is always one of its options.

### Optional values

Give an optional value a clear button, so people can remove it, not only change it.

### Options

Options people could mistake for each other need telling apart, and only options are values.

- Give options that share a label a description, such as an e-mail address.
- Text people type is never the value: offer it as an option instead.

### Labels

Name the field after what people choose, and use the placeholder for what to type.

A field without a visible label, such as in a toolbar, says what to type in its placeholder.

```tsx figure=SmallToolbar

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

## Compose

### Usage

Combobox takes its options as `items`, each with a `value` and a `label`, and optionally a `description` and `start` content, such as an Avatar; a ComboboxGroup puts items under a heading.

- Control it with `value`, `null` for none, and `onValueChange`, which receives the value and its item, or leave it uncontrolled with `defaultValue`.
- `label`, `description` and `error` work as on TextField.
- `clearable` adds a clear button while there is a value, and <kbd>Esc</kbd> on the closed field clears it too.

```tsx source=ChooseOwner

```

#### Several options

With `multiple`, `value` is an array of values, each shown as a chip with a remove button, and the list stays open as people choose.

```tsx
<Combobox
  multiple
  label="Reviewers"
  placeholder="Add people"
  items={people}
  value={reviewers}
  onValueChange={setReviewers}
/>
```

#### Search on a server

By default the list shows the options whose label or description contains the typed text, ignoring case and accents, in `locale`; `filter` takes a function of your own.

- With `filter={null}` it shows `items` as given: search from `onInputValueChange`, which receives the typed text.
- Set `loading` while the search runs, which shows `loadingLabel` instead of `emptyLabel`.
- `onOpenChange` can load the options as the list opens; its second argument, `ComboboxOpenChangeDetails`, says why it opens or closes.

```tsx
<Combobox
  label="Contact"
  items={results}
  filter={null}
  onInputValueChange={setQuery}
  loading={searching}
  loadingLabel="Searching…"
  emptyLabel={query ? 'No contacts found' : 'Type a name to search'}
  value={contact}
  onValueChange={setContact}
/>
```

#### In a form

`name` submits the value, or one entry for each chip, and a form reset restores `defaultValue`.

- `readOnly` lets people focus the field and browse the list without changing the value.
- Validation and its `error` belong to the application, such as an error set on submit when `new FormData(form).getAll('topics')` is empty.

```tsx
<Combobox
  multiple
  name="topics"
  label="Topics"
  items={topics}
  defaultValue={['accessibility']}
  required
  error={error}
/>
```

#### Sizes

- `size` is `sm`, `md` or `lg`; without it, the field takes its container's control height.
- With `showLabel={false}`, a `placeholder` and an `aria-label` name it.

```tsx
<Combobox
  size="sm"
  showLabel={false}
  aria-label="Document"
  placeholder="Document"
  items={documents}
/>
```

### Composition

The field is `env-field` with `env-combobox`: the control, `env-combobox-control`, holds the chips, `env-combobox-chip`, with their labels, `env-combobox-chip-label`, and remove buttons, `env-combobox-chip-remove`, IconButtons with a cross; then the input, `env-combobox-input`, the clear button, `env-combobox-clear`, and the trigger, `env-combobox-trigger`. The list is the shared popup, `env-combobox-popup`, and its options are its rows, `env-combobox-item`, with the check, `env-combobox-item-indicator`. `className` and `style` reach the field's root, and `ref` the input.

### Customize

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0-prerelease.6**: A multiple field stays one row tall while its chips fit there; the input moves to a row of its own only once its text no longer fits.
- **1.0.0-prerelease.6**: The `floating` variant and the `variant` prop are gone: the field is outlined, and takes `size="lg"` in a long form on a page. The field takes a text area's rounded corners rather than round ends, still as tall as a button.
- **1.0.0-prerelease.5**: The popup is frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge but a faint hairline in dark, and is solid with its edge at high contrast and with reduced transparency. Options are the md control height in body text, chosen ones show their check mark, and groups part by space. Group labels sit a little ahead of the rows, and options lie one under the next with no space between them. A chosen option's check mark ends its row, after the label.
- **1.0.0**: `hint` is `description` and `variant="outlined"` is `variant="outline"`. `className` and `style` style the field's root rather than the input, which takes `ref`. Read-only chips no longer carry `aria-readonly`, which the input reports. The popup is the shared popup and the options its rows, and a chip's remove button is an IconButton with a cross: `env-combobox-well` is `env-combobox-control`, `env-combobox-option` `env-combobox-item` and `env-combobox-check` `env-combobox-item-indicator`, and the icons at the start, `env-combobox-leading` and `env-combobox-value-leading`, are `env-combobox-start` and `env-combobox-value-icon`, as other components name their start slots. The loading, empty, clear and remove labels come from EnvUIProvider's `messages`. An option's `leading` content is `start`, as on List.Item.
