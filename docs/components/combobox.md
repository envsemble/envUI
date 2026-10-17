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
related:
  - select
  - text-field
  - avatar
  - command-palette
  - menu
  - accessibility
components:
  - Combobox
---

# Combobox

## Overview

A combobox is a text field with a list of options: typing filters the list, the first match is highlighted so <kbd>Enter</kbd> chooses it, and the field shows what was chosen. A single combobox shows the chosen option's label as its text; with `multiple`, chosen options are removable chips in the field. Focus stays in the field while people move through the options, as the WAI-ARIA combobox pattern describes. Combobox is built on Base UI's combobox and the shared text field.

```tsx example=ChooseOwner

```

## Anatomy

1. **Field**: the shared text field, with the floating `label`, `description` and `error` of TextField.
2. **Leading content** (an option's `leading`): such as an Avatar or an icon, before the chosen label in a single field, in chips and in options, at the size of its slot.
3. **Chips** (`multiple`): one per chosen option at the start of the field, with its start content, label and a remove button; the field wraps them onto more rows.
4. **Clear button** (`clearable`): a ghost icon button named `clearLabel` (Clear), while there is a value to clear.
5. **Trigger**: a chevron button at the end of the field that opens the list and turns while it is open.
6. **Popup**: the shared raised popup, as Select's, at least as wide as the field, with the options, group headings, and a status for loading or no matches.
7. **Option** (each entry of `items`): a rounded row with a check mark slot, `start` content, the `label` and a muted `description` below it.

## Variants and sizes

| Variant    | Use for                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `outline`  | In forms, dialogs and toolbars: the field at the control height of its `size`, as a TextField. The default.                       |
| `floating` | A long form on a page: the field 3.5 rem tall inside its border, whose label floats above the value, as TextField's floating one. |

<!-- specimen: States -->

- A field fills its container's width; set the width on the container.
- `size` sets the field's height, as on every control: `sm`, `md` or `lg` in the app's [scale](../foundations/scale.md); without it the field takes its container's control height. `showLabel={false}` hides the label in a toolbar, so a placeholder and an `aria-label` name it.
- Leading content is 1.25 rem in options and the field, and 1.5 rem in chips and a floating field; an icon takes the control icon size.
- Options are rows of the scale's row height, 2.25 rem or 1.75 rem in the compact scale, with 0.25 rem block and 0.5 rem inline padding; descriptions are 0.75 rem. The popup scrolls beyond 20 rem, or the room below the field.
- On touch screens the field, chips and options grow to the touch height, and each chip's remove button has a hit area of the touch size: wrapped rows of chips lie that far apart.

## States and behaviour

- **Filtering**: by default, options whose label or description contains the typed text, ignoring case and accents in the `locale` (the browser's), show; `filter` replaces the test. With `filter={null}` the list shows `items` as given, for options the application finds itself; `loading` shows `loadingLabel` (Loading…) with a spinner and marks the list busy, and `emptyLabel` (No matches) shows when nothing matches.
- **Highlight**: the first match is highlighted, also when options arrive after typing, so <kbd>Enter</kbd> chooses it. The arrow keys move the highlight, starting from the chosen option, and the pointer highlights the option it is on.
- **Choosing one**: choosing an option closes the list, shows its label and start content in the field, and calls `onValueChange` with its value and option. Focusing the field selects the label, so typing replaces it with a query; a press keeps that selection. Without `clearable`, the value can change but not be removed: emptying the text and leaving the field brings the label back.
- **Clearing**: with `clearable`, the clear button, <kbd>Esc</kbd> on the closed field and emptying the text remove a single value, and the clear button removes every chip. With nothing to clear, <kbd>Esc</kbd> changes nothing and goes on, such as to close an enclosing dialog.
- **Choosing several**: with `multiple`, choosing an option adds a chip and keeps the list open, and choosing it again removes it. <kbd>Backspace</kbd> in the empty text removes the last chip, and each chip's remove button removes it. <kbd>Esc</kbd> never removes chips.
- **Queries**: `onInputValueChange` receives the typed text, and an empty string once the query ends: when the text is cleared, or when the field shows the chosen label again after a choice or as people leave the query, so results for an abandoned query never stay for <kbd>Enter</kbd> to choose.
- **Values without options**: chosen options keep their labels while `items` changes, such as with each search. A value the field never saw among `items` shows as itself, and `onValueChange` reports it as `{ value, label: value }`.
- **Popup**: it opens below the field, flips above it near the bottom of the window, and keeps the theme of the page around the field, also inside a Dialog. `open`, `defaultOpen` and `onOpenChange` control it, such as to load the options as it opens.
- **Read only and disabled**: a read-only field can be focused and its list browsed, but its value can't change and chips lose their remove buttons. A disabled field can't be focused, takes the shared disabled look and is left out of form submission.
- **In forms**: `name` submits the value, or one entry for each chosen value; `required` asks for a value or at least one chip, and a form reset restores an uncontrolled field's `defaultValue`. Validation and its `error` belong to the application.

## Content guidelines

- Name the field after what people choose, in sentence case: "Owner", "Reviewers".
- Use a placeholder for what to type in a field with a hidden label or one with chips, such as "Add people".
- Give options a label that tells them apart and, where labels repeat, a description such as an e-mail address.
- Write `emptyLabel` for what to do next, such as "Type a name to search" before a server search, and "No contacts found" after one.
- Translate `clearLabel`, `removeLabel`, `loadingLabel` and `emptyLabel` where the interface is not in English.

## Do and don't

### Do

- Use start content, such as Avatars, where it helps tell options apart.
- Use `clearable` where the value is optional.
- Keep the chosen options in `items` when the field first shows a saved value from a search.
- Give a combobox the size of the buttons beside it, and an `aria-label` where its label is hidden.

### Don't

- Don't use a combobox for fewer than about seven options; use [Select](../components/select.md).
- Don't use a combobox to search content; use [SearchField](../components/text-field.md).
- Don't accept free text as a value; offer it as an option, or use a TextField.

## Accessibility

### Keyboard

| Key                                                                    | Action                                                                                                                     |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                        | Moves focus to and from the field; the clear button, the chips and the trigger are not tab stops.                          |
| Typing                                                                 | Filters the options, opens the list and highlights the first match.                                                        |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                             | Opens the list, or moves the highlight to the next or previous option.                                                     |
| <kbd>Enter</kbd>                                                       | Chooses the highlighted option.                                                                                            |
| <kbd>Esc</kbd>                                                         | Closes the list. On a closed clearable single field with a value, clears it; otherwise goes on, such as to close a dialog. |
| <kbd>Backspace</kbd> in the empty text of a multiple field             | Removes the last chip.                                                                                                     |
| <kbd>←</kbd> at the start of the text, then <kbd>←</kbd>, <kbd>→</kbd> | Moves focus to the last chip, then between chips and back to the text, in the reading direction.                           |
| <kbd>Backspace</kbd> or <kbd>Delete</kbd> on a chip                    | Removes the focused chip.                                                                                                  |

### envUI provides

- The combobox pattern: the field is a `combobox` with `aria-expanded`, `aria-controls` and the highlighted option as its active descendant, and the list is a `listbox` of `option` rows with `aria-selected`; group headings name their groups.
- The `label` tied to the field and the trigger, and the description and error linked to the field alone, with `aria-invalid` while `error` is set, so they are announced once.
- An option's description read as its description, not its name, and decorative check marks and start content hidden from assistive technology.
- The chosen options of a multiple field in its description, chips in a toolbar named after the field, and remove buttons named after each option, such as "Remove Alex Morgan".
- A status that announces `loadingLabel` while the options load and `emptyLabel` when nothing matches, with the list marked busy meanwhile.
- The shared focus rings, and touch-height fields, chips and options.

### You provide

- A `label`, or an `aria-label` on a field without one.
- The options, and with `filter={null}` the search behind them.
- Validation and its `error` message.
- `clearLabel`, `removeLabel`, `loadingLabel` and `emptyLabel` in the application's language.

## Examples

### Several reviewers

With `multiple`, chosen people show as chips in the field; <kbd>Backspace</kbd> in the empty text removes the last one.

```tsx example=Reviewers

```

### Small, in a toolbar

`size="sm"` gives the field the small control height, so it lines up with a small button beside it. Without a visible label, its placeholder guides; the popup groups its options under headings.

```tsx example=SmallToolbar

```

### Search on a server

With `filter={null}` the list shows the people the application finds for the typed text, with a loading status while it searches.

```tsx example=ServerSearch

```

### In a form

A multiple combobox submits one entry for each chosen topic. The application checks that one is chosen and shows the error; Reset returns to `defaultValue`.

```tsx example=RequiredInForm

```

## Changelog

- **1.0.0**: `hint` is `description` and `variant="outlined"` is `variant="outline"`, which the `v1-props` codemod writes. `className` and `style` style the field's root rather than the input, which takes `ref`. Read-only chips no longer carry `aria-readonly`, which the input reports. The popup is the shared popup and the options its rows, and a chip's remove button is a CloseButton: `env-combobox-well` is `env-combobox-control`, `env-combobox-option` `env-combobox-item` and `env-combobox-check` `env-combobox-item-indicator`. The loading, empty, clear and remove labels come from EnvUIProvider's `messages`. An option's `leading` content is `start`, as on List.Item.
- **0.6.0**: Combobox, for one option or several, with leading content, descriptions, groups, a server search, compact density and native form support.
