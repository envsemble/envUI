---
title: Select
summary: One choice from a list that stays collapsed until opened, in an outlined field with a label, description and error.
status: stable
since: 1.0.0
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
examples:
  ProjectVisibility:
    role: overview
    motion: true
  TriggerStyles: variants
  SmallToolbar:
    role: example
    caption: A small select beside small buttons in a toolbar.
  SelectAnatomy: anatomy
  SelectListAnatomy: anatomy
  SettingRows: example
---

# Select

## Variants

```tsx figure=TriggerStyles

```

1. **Outline**
2. **Floating**

| Variant  | Use for                                                    |
| -------- | ---------------------------------------------------------- |
| Outline  | A select anywhere, as every field. The default.            |
| Floating | A select in a long form on a page, beside floating fields. |

### Sizes

Small, medium and large, the control heights of the [scale](../foundations/spacing.md). Without a size of its own the select takes its container's, so it lines up with the buttons beside it. Without a visible label, as in a toolbar, it is as wide as its longest option.

```tsx figure=SmallToolbar

```

## Anatomy

```tsx figure=SelectAnatomy

```

1. **Select** (`env-select`)
2. **Label** (`env-select-label`, `label`)
3. **Trigger** (`env-select-trigger`)
4. **Value** (`env-select-trigger > span::text`)
5. **Chevron** (`env-select-icon`)
6. **Description** (`env-field-description`, `description`)

```tsx figure=SelectListAnatomy open

```

1. **List** (`env-select-popup`)
2. **Option** (`env-select-item`, `items`)
3. **Check** (`env-select-item-indicator`)

## Behaviour

### States

While nothing is chosen, the trigger shows a placeholder.

- People can't clear a choice, only make another.
- An option can be unavailable, so it can't be chosen.

<!-- specimen: States -->

### In list rows

A row's title names the select in it, so the select shows no label of its own.

```tsx figure=SettingRows

```

## Rules

Start on the option most people want, and let choosing do nothing but set the value.

### Defaults

Choose a default where one option suits most people. A placeholder makes everyone choose, so keep it for a choice people must make themselves.

### Order

Order options naturally, such as by frequency, or alphabetically where there is no order.

### Choosing does nothing else

Choosing an option sets a value: it never moves to another page or runs a destructive action.

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

## Compose

### Usage

```tsx
<Select
  label="Visibility"
  items={[
    { value: 'team', label: 'Team' },
    { value: 'private', label: 'Private' },
    { value: 'public', label: 'Public', disabled: true },
  ]}
  value={visibility}
  onValueChange={setVisibility}
/>
```

Each item has a `value`, a `label` and `disabled` where it can't be chosen. Control it with `value` and `onValueChange`, or leave it uncontrolled with `defaultValue`; with neither, nothing is chosen and the trigger shows `placeholder`. `label`, `description` and `error` work as on TextField.

#### In a form

```tsx
<form onSubmit={invite}>
  <TextField label="E-mail address" name="email" type="email" required />
  <Select label="Role" name="role" items={roleOptions} defaultValue="editor" />
  <Button type="submit">Send invitation</Button>
</form>
```

With `name`, a hidden input submits the chosen value, and a form reset restores `defaultValue`. `required` makes the browser refuse the form while nothing is chosen and move focus to the trigger, and `autoComplete` gives the browser's autofill a hint, such as `country`.

#### In list rows

Where a row's title names the select, give the select that name as its `aria-label`; it is then as wide as its longest option.

#### Variants and sizes

`variant` is a field's: `outline`, the default, or `floating`, taller, with its label resting inside and floating into the outline. `size` is `sm`, `md` or `lg`; without it, the field takes its container's control height. `showLabel={false}` keeps the label for assistive technology only, as on a TextField, and the field fits its longest option.

### Composition

The field is `env-field` with `env-select`, a text field's frame: its well, `env-select-control`, holds the trigger, `env-select-trigger`, with the chosen option's label, `env-select-value`, the label and the chevron, `env-select-icon`. The open list is the shared popup, with its list, `env-select-list`, and its options are the popup's rows. `className` and `style` reach the field's root, and `ref` the trigger. `defaultOpen` opens the list on the first render, `open` and `onOpenChange`, which receives why, control it, and `readOnly` shows the choice without opening the list.

### Customize

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0-prerelease.5**: Select is an outlined field, as TextField and DatePicker are, with the label inside: `variant` is `outline`, the default, or `floating`, where it was a Button's `secondary` or `outline`. Without a visible label it fits its longest option. It takes `open`, `onOpenChange`, `readOnly` and `showLabel`.
- **1.0.0-prerelease.5**: The open list is frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge but a faint hairline in dark, and is solid with its edge at high contrast and with reduced transparency. Options are the md control height in body text, the highlighted one, under the pointer or the keyboard, takes the neutral fill with no focus ring, and the chosen one shows its check mark. The list opens 8 px clear of the trigger at every scale and size. Its options lie one under the next with no space between them. The chosen option's check mark ends its row, after the label. The outline trigger has no fill at rest, as an outline button has none.
- **1.0.0**: `options` is `items`, and `SelectOption` is `SelectItem`; `hint` is `description`; `variant="outlined"` is `variant="outline"`. `className` and `style` style the field's root rather than the trigger, which takes `ref`. The trigger is a Button, the popup the shared popup and the options its rows: `env-dropdown-trigger` is `env-select-trigger`, `env-dropdown-options` `env-select-popup`, `env-dropdown-list` `env-select-list`, `env-dropdown-option` `env-select-item` and `env-dropdown-option-check` `env-select-item-indicator`.
- **1.0.0**: The open list takes the level-2 elevation edge, with no shadow.
