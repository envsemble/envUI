---
title: TextField
summary: A field for entering text, on one line or several.
status: stable
since: 1.0.0
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
  - A short value on one line, such as a name or an e-mail address
  - Searching a list, a table or a sidebar (SearchField)
  - Text over several lines, such as notes (Textarea)
avoidWhen:
  - text: Choosing one of a few known options.
    use: Select
  - text: Choosing from a long list of options by typing to filter them.
    use: Combobox
  - text: A date, or a date and time.
    use: DatePicker
components:
  - TextField
  - SearchField
  - Textarea
examples:
  ProjectName:
    role: overview
    caption: 'Outline: a short value on one line, with a label and a description.'
  Variants: variants
  SearchInToolbar: example
  FieldsBesideButtons: example
  PrefixAndSuffix: example
  ContentAffixes: example
  IconAndEndAction: example
  TextFieldAnatomy: anatomy
  Validation: example
  TextareaSizing: example
  LongAddress: example
---

# TextField

## Variants

```tsx figure=Variants

```

1. **Outline**
2. **Ghost**

### Ghost

```tsx figure=SearchInToolbar motion

```

### Sizes

```tsx figure=FieldsBesideButtons

```

### Prefix and suffix

```tsx figure=PrefixAndSuffix

```

### Content in affixes and a search's end

```tsx figure=ContentAffixes

```

### Icon and end action

```tsx figure=IconAndEndAction

```

## Anatomy

```tsx figure=TextFieldAnatomy

```

1. **Field** (`env-text-field`)
2. **Control** (`env-text-field-control`)
3. **Label** (`env-text-field-label`, `label`)
4. **Start** (`env-text-field-start`, `start`)
5. **Prefix** (`env-text-field-prefix`, `prefix`)
6. **Input** (`env-text-field-input`)
7. **End action** (`env-text-field-end-action`, `endAction`)
8. **Description** (`env-field-description`, `description`)

## Behaviour

### States

<!-- specimen: States -->

### Show an error

```tsx figure=Validation motion

```

### Search

<!-- specimen: ClearingTheQuery -->

### Textarea sizing

```tsx figure=TextareaSizing motion

```

### Adapting to width

```tsx figure=LongAddress widths="30 16" sweep

```

## Accessibility

### Keyboard

| Key                                                                | Action                                              |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| <kbd>Esc</kbd> in a SearchField                                    | Clears the query; in an empty one, the key goes on. |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a resize edge                        | Shrinks or grows the Textarea by a line.            |
| <kbd>Shift</kbd>+<kbd>↑</kbd>, <kbd>Shift</kbd>+<kbd>↓</kbd> on it | Shrinks or grows it by five lines.                  |
| <kbd>Home</kbd> on a resize edge                                   | Restores the Textarea's minimum height.             |
