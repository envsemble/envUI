---
title: Select
summary: One choice from a list that stays collapsed until opened, on a Button-style trigger with a label, description and error.
status: stable
since: 0.1.0
category: Forms & selection
aliases:
  - dropdown
  - drop-down
  - dropdown list
  - select menu
  - select box
  - listbox
  - picker
  - option picker
  - pick list
  - choose from a list
useWhen:
  - One of several known options, such as a role, a sort order or a time zone
  - A setting in a row or a toolbar, such as a digest's frequency or a zoom level
avoidWhen:
  - text: Two to five options that read better side by side, or that each need explaining.
    use: RadioGroup
  - text: Finding one option in a long list by typing, or choosing several.
    use: Combobox
  - text: Switching between views or filters that apply at once, such as List and Board.
    use: SegmentedControl
  - text: A list of actions, such as Rename or Delete, rather than a value.
    use: Menu
  - text: A date, or a date and time.
    use: DatePicker
components:
  - Select
---

# Select

## Overview

Typing an option's label in the open list jumps to it.

```tsx example=ProjectVisibility

```

### States

While nothing is chosen, the trigger shows a placeholder. People can't clear a choice, only make another.

<!-- specimen: States -->

### In a form

The chosen value is sent with its form, and resetting the form restores the choice it started with.

```tsx example=InviteMember

```

### In list rows

A row's title names the select in it, so the select shows no label of its own.

```tsx example=SettingRows

```

## Variants

```tsx variants=TriggerStyles

```

1. **Secondary**
2. **Outline**

| Variant   | Use for                                           |
| --------- | ------------------------------------------------- |
| Secondary | A select on the page. The default.                |
| Outline   | A select on a pane, a dialog, a row or a toolbar. |

### Sizes

Small, medium and large, the control heights of the [scale](../foundations/scale.md), so a select lines up with the buttons beside it.

```tsx example=SmallToolbar

```

## When to use

```tsx do=SensibleDefault caption="A default where one option suits most people."

```

```tsx dont=NeedlessPlaceholder caption="A placeholder that makes everyone choose what most would pick."

```

### Order

Order options naturally, such as by frequency, or alphabetically where there is no order.

### Choosing does nothing else

Choosing an option sets a value: it never moves to another page or runs a destructive action.

### Labels

Name the select with a short noun, and say in a disabled option's label why it is unavailable.

## Anatomy

```tsx anatomy=SelectAnatomy

```

1. **Select** (`env-select`)
2. **Label** (`env-select-label`, `label`)
3. **Trigger** (`env-select-trigger`)
4. **Value** (`env-select-trigger > span::text`)
5. **Chevron** (`env-select-icon`)
6. **Description** (`env-field-description`, `description`)

```tsx anatomy=SelectListAnatomy open

```

1. **List** (`env-select-popup`)
2. **Option** (`env-select-item`, `items`)
3. **Check** (`env-select-item-indicator`)

### Colors

One select can take colors of its own: its fill, its text and its edge. Its hover, focus and press then follow them; with none set, it keeps its own colors.

## Accessibility

### Keyboard

| Key                                                            | Action                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                | Moves to and from the trigger; in the list, closes it. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> | Opens the list at the chosen option.                   |
| A letter on the trigger                                        | Chooses the next option that starts with it.           |
| <kbd>↓</kbd>, <kbd>↑</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>    | Highlight an option in the open list.                  |
| <kbd>Enter</kbd>, <kbd>Space</kbd>                             | Chooses the highlighted option and closes the list.    |
| <kbd>Esc</kbd>                                                 | Closes the list without choosing.                      |

### envUI provides

- A `combobox` trigger with a `listbox` of options, the select-only combobox pattern.
- The label, description and error tied to the trigger, and `aria-invalid`.
- Focus into the list as it opens and back to the trigger as it closes.
- A hidden input for form submission, validation and reset.

### You provide

- A `label`, or `aria-label` where the name shows elsewhere.
- A `name` for a select in a form.
- Validation and the `error` message.

## In code

### Usage

Select takes its options as `items`, each with a `value`, a `label` and `disabled` where it can't be chosen. Control it with `value` and `onValueChange`, or leave it uncontrolled with `defaultValue`; with neither, nothing is chosen and the trigger shows `placeholder`. People can't clear a choice, only make another. `label`, `description` and `error` work as on TextField.

```tsx source=ProjectVisibility

```

#### In a form

With `name`, a hidden input submits the chosen value, and a form reset restores `defaultValue`. `required` makes the browser refuse the form while nothing is chosen and move focus to the trigger, and `autoComplete` gives the browser's autofill a hint, such as `country`.

```tsx source=InviteMember

```

#### In list rows

Where a row's title names the select, give the select that name as its `aria-label`, and the `outline` variant.

```tsx source=SettingRows

```

#### Variants and sizes

`variant` is the trigger's Button variant: `secondary`, a filled pill and the default, for the page, or `outline`, a bordered pill, for panes, dialogs, rows and toolbars. `size` is `sm`, `md` or `lg`; without it, the trigger takes its container's control height, so it lines up with the buttons beside it.

```tsx source=SmallToolbar

```

### Composition

The field is `env-field` with `env-select`: its label, `env-select-label`, the trigger, `env-select-trigger`, a Button that shows the value and the chevron, `env-select-icon`, then the description and the error. The open list is the shared popup, `env-select-popup`, with its list, `env-select-list`, and its options are its rows, `env-select-item`, with the check, `env-select-item-indicator`. `className` and `style` reach the field's root, and `ref` the trigger; `defaultOpen` opens the list on the first render.

### Customize

`--env-select-container`, `--env-select-content` and `--env-select-outline` set the colors of one Select, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0**: `options` is `items`, and `SelectOption` is `SelectItem`; `hint` is `description`; `variant="outlined"` is `variant="outline"`, which the codemods write. `className` and `style` style the field's root rather than the trigger, which takes `ref`. The trigger is a Button, the popup the shared popup and the options its rows: `env-dropdown-trigger` is `env-select-trigger`, `env-dropdown-options` `env-select-popup`, `env-dropdown-list` `env-select-list`, `env-dropdown-option` `env-select-item` and `env-dropdown-option-check` `env-select-item-indicator`.
- **1.0.0**: The open list takes the level-2 elevation edge, with no shadow.
- **0.5.0**: `density="compact"`. The outlined trigger is the outlined Button style, and the open list takes the popup surface corners, with rounded options inset by its padding.
- **0.4.0**: `variant`, secondary or outlined. The open list is a raised popup in its own color with a hairline border; options show only hover, press and selection, with stronger hover and pressed shades; the trigger settles like a button while pressed.
- **0.3.0**: The open list grows from its trigger.
- **0.1.0**: Select.
