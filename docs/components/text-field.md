---
title: TextField
summary: Single-line inputs, search fields and multiline textareas share labels, guidance and states.
status: stable
since: 0.1.0
category: Forms & selection
aliases:
  - Input
  - text input
  - text box
  - textbox
  - input field
  - form field
  - email field
  - email
  - password field
  - password
  - search field
  - search box
  - textarea
  - multiline text
  - description field
useWhen:
  - Someone types a short value on one line, such as a name, an e-mail address or a number.
  - A value has a fixed start or a unit beside it, such as an address after a domain or a size in GB.
  - People search or filter a list, a table or a sidebar by typing (SearchField).
  - Someone writes text over several lines, such as a description or notes (Textarea).
avoidWhen:
  - text: Text that runs over several lines.
    use: Textarea
  - text: A query that searches or filters content, which needs a search icon and a way to clear it.
    use: SearchField
  - text: Choosing one of a few known options.
    use: Select
  - text: Choosing from a long list of options by typing to filter them.
    use: Combobox
  - text: A date, or a date and time.
    use: DatePicker
  - text: A time of day.
    use: TimePicker
  - text: A month of a year.
    use: MonthPicker
  - text: A message in a conversation, sent with Enter.
    use: Composer
  - text: Formatted text, such as headings, lists and links.
    use: MarkdownEditor
related:
  - select
  - combobox
  - date-picker
  - composer
  - markdown
  - column
  - accessibility
components:
  - TextField
  - SearchField
  - Textarea
---

# TextField

## Overview

A text field takes a short value on one line, with a label, a description and an error.

```tsx example=ProjectName

```

```tsx example=SearchMembers caption="SearchField: a query, with a search icon and a clear button."

```

```tsx example=Notes caption="Textarea: text over several lines."

```

### States

The label rests in an empty field and floats into the outline on focus or with a value.

<!-- specimen: States -->

### Show an error

`error` marks the field invalid and shows under the description. Say how to correct the value.

```tsx example=Validation

```

### Prefix and suffix

Short text in line with the value, which forms don't submit. Pressing it places the caret.

```tsx example=PrefixAndSuffix

```

### Icon and end action

`startIcon` is decorative; `endAction` holds a control, such as an IconButton, which takes the field's ghost look.

```tsx example=IconAndAction

```

### Textarea sizing

A fixed Textarea scrolls, and its bottom edge resizes it by dragging or with the arrow keys. With `sizing="content"` it grows with its text.

```tsx example=TextareaSizing

```

## Variants

```tsx example=Variants

```

| Variant     | Use for                                                      |
| ----------- | ------------------------------------------------------------ |
| `outline`   | Forms, dialogs, panes and toolbars. The default.             |
| `floating`  | A long form on a page.                                       |
| `underline` | A value in a document or a header, such as a title.          |
| `ghost`     | A search in an application's chrome, such as atop a sidebar. |

Textarea comes outline, underline or ghost.

### Sizes

Outline and ghost fields take the control heights of the [scale](../foundations/scale.md), `sm`, `md` and `lg`, so they line up with buttons of the same size.

```tsx example=FieldsBesideButtons

```

## When to use

```tsx do=ReadOnlyValue caption="readOnly for a value people can see and copy but not change."

```

```tsx dont=DisabledValue caption="Disabled to show a fixed value: it can't be focused, copied or submitted."

```

```tsx do=OutlineForm caption="Outline fields in a form, so people see where to type."

```

```tsx dont=GhostForm caption="Ghost fields in a form: nothing shows where to type."

```

- Set `type`, `autoComplete` and `inputMode` to fit the value, such as `type="email"` with `autoComplete="email"`.
- Show an error once people leave the field or submit, and remove it once the value fits.

### Labels

Name the value in a short noun phrase, and keep lasting instructions in the description.

```tsx do=LabelAndDescription caption="A label that names the value, and the rule in the description."

```

```tsx dont=PlaceholderAsLabel caption="Instructions in the placeholder: they vanish as people type."

```

```tsx do=HelpfulError caption="An error that says how to correct the value."

```

```tsx dont=VagueError caption="An error that only says the value is wrong."

```

## Anatomy

```tsx anatomy=TextFieldAnatomy

```

1. **Field** (`env-text-field`)
2. **Control** (`env-text-field-control`)
3. **Label** (`env-text-field-control > label`, `label`)
4. **Start icon** (`env-text-field-start`, `startIcon`)
5. **Prefix** (`env-text-field-prefix`, `prefix`)
6. **Input** (`env-text-field-input`)
7. **End action** (`env-text-field-end`, `endAction`)
8. **Description** (`env-field-description`, `description`)

Not shown: the suffix, `env-text-field-suffix`, the error, `env-field-error`, and a Textarea's resize edge, `env-textarea-resize-edge`.

## Adapting to width

A field fills its container; set the width there. A long prefix is cut short so the value keeps its room.

```tsx example=LongAddress widths="16 30"

```

## Accessibility

### Keyboard

| Key                                                                | Action                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                    | Moves to the next or previous field, then its end action. |
| <kbd>Esc</kbd> in a SearchField                                    | Clears the query; in an empty one, the key goes on.       |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a resize edge                        | Shrinks or grows the Textarea by a line.                  |
| <kbd>Shift</kbd>+<kbd>↑</kbd>, <kbd>Shift</kbd>+<kbd>↓</kbd> on it | Shrinks or grows it by five lines.                        |
| <kbd>Home</kbd> on a resize edge                                   | Restores the Textarea's minimum height.                   |

### envUI provides

- Native `<input>` and `<textarea>`, so autofill, validation, submission and reset work.
- A `<label>` tied to the control, kept for assistive technology when hidden.
- The description and error as the control's description, and `aria-invalid`.
- SearchField's clear button, named Clear search.
- Textarea's resize edge as a `separator` named Resize text area.
- 1 rem text on touch screens, so focusing a field doesn't zoom the page.

### You provide

- A `label` for every field, or `aria-label`.
- An `aria-label` on an icon-only `endAction`.
- Validation, the `error` text, and focus on the first invalid field.
- An announcement of results when a search filters as people type.
- The clear and resize labels in the application's language, through EnvUIProvider's `messages`.

## Changelog

- **1.0.0**: `hint` is `description`, and the variants are `outline`, `floating`, `underline` and `ghost`: `outlined` is `outline`, `plain` is `underline` and `quiet` is `ghost`, which the `v1-props` codemod writes. `className` and `style` style the field's root rather than the input; `ref` and the other native props still reach the input. TextField and Textarea take `onValueChange`. The frame is Field's parts, and the classes follow: `env-text-input` is `env-text-field-input`, `env-text-field-well` `env-text-field-control`, `env-form-field` `env-field` and `env-field-hint` `env-field-description`. A button in `endAction` takes the ghost variant where it sets none. Textarea's resize edge is a `separator`, and its labels and the clear label come from EnvUIProvider's `messages`.
- **1.0.0**: `Input` is `TextField`, with the same props, behaviour and look; the page is `text-field`.
- **0.6.0**: The `quiet` variant on TextField and SearchField.
- **0.5.0**: `prefix` and `suffix`; entered text, resting labels, prefixes and suffixes are 1 rem on touch screens; a growing Textarea with `rows` starts at that many lines.
- **0.4.0**: `showLabel`; a floated label hides only the outline behind it; end actions take the field's icon color and state layers.
- **0.3.0**: End actions ease in as they appear.
- **0.2.0**: `startIcon`, `endAction` and `compact`; SearchField.
- **0.1.0**: Input and Textarea, outlined and plain, with labels, descriptions and errors; Textarea's fixed and content sizing with its resize edge.
