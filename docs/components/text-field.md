---
title: TextField
summary: Single-line inputs, search fields and multiline textareas share labels, guidance and states.
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
  - A value with a fixed start or a unit, such as a size in GB
  - Searching a list, a table or a sidebar (SearchField)
  - Text over several lines, such as notes (Textarea)
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
components:
  - TextField
  - SearchField
  - Textarea
examples:
  ProjectName:
    role: overview
    caption: 'Outline: a short value on one line, with a label, a description and an error.'
  SearchInSidebar:
    role: overview
    caption: 'Ghost: a search atop a sidebar, only its icon and words until it is used.'
  Variants: variants
  SearchInToolbar: example
  FieldsBesideButtons: example
  PrefixAndSuffix: example
  TextFieldAnatomy: anatomy
  Validation: example
  TextareaSizing: example
  LongAddress: example
  OutlineForm:
    role: do
    caption: Outline fields in a form, so people see where to type.
  GhostForm:
    role: dont
    caption: 'Ghost fields in a form: nothing shows where to type.'
  LabelAndDescription:
    role: do
    caption: A label that names the value, and the rule in the description.
  PlaceholderAsLabel:
    role: dont
    caption: 'Instructions in the placeholder: they vanish as people type.'
---

# TextField

## Variants

```tsx figure=Variants

```

1. **Outline**
2. **Floating**
3. **Ghost**

| Variant  | Use for                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| Outline  | In forms, dialogs, panes and toolbars. The default.                                                        |
| Floating | A long form on a page, or a field on its own, such as a search above what it filters. Not for a text area. |
| Ghost    | A search in an application's chrome: atop a sidebar, among quiet buttons in a toolbar, or in a palette.    |

### Outline and floating

Outline and floating fields have no fill of their own: they take the background of what they sit on, such as a card, a sheet or a dialog.

- A floated label opens the border behind it.
- A field can be given a fill of its own where it needs one.

### Ghost

A ghost field has no edge: it is its icon and words until the pointer rests on it or it has focus, when its fill shows.

- Its placeholder clears once it has focus.
- An invalid ghost field shows a red edge.
- The [CommandPalette](command-palette.md)'s search is a large ghost field that keeps its fill.

```tsx figure=SearchInToolbar motion

```

### Sizes

Outline and ghost fields come in the three control heights of the [scale](../foundations/spacing.md), small, medium and large, so they line up with buttons of the same size.

```tsx figure=FieldsBesideButtons

```

### Prefix and suffix

Short text in line with the value, which forms don't submit. Pressing it places the caret.

```tsx figure=PrefixAndSuffix

```

### Icon and end action

An icon at the start only decorates the field.

- The end can hold a control, such as a button that shows the password.
- That control takes a quiet look to sit inside the field.

## Anatomy

```tsx figure=TextFieldAnatomy

```

1. **Field** (`env-text-field`)
2. **Control** (`env-text-field-control`)
3. **Label** (`env-text-field-label`, `label`)
4. **Start icon** (`env-text-field-start`, `startIcon`)
5. **Prefix** (`env-text-field-prefix`, `prefix`)
6. **Input** (`env-text-field-input`)
7. **End action** (`env-text-field-end`, `endAction`)
8. **Description** (`env-field-description`, `description`)

Not shown: the suffix, the error and a text area's resize edge.

## Behaviour

### States

The label rests in an empty field and floats into the outline on focus or with a value.

<!-- specimen: LabelFloats -->

<!-- specimen: States -->

### Show an error

An error marks the field invalid and shows under its description. Say how to correct the value.

- Check on leaving the field and on submit, never while people type.
- Clear the error as soon as the value fits.

```tsx figure=Validation motion

```

### Search

A search field's clear button and <kbd>Esc</kbd> empty the query.

- Its label is for assistive technology, unless it is set to show.

<!-- specimen: ClearingTheQuery -->

### Textarea sizing

A text area keeps its height and scrolls, and people resize it by its bottom edge, by dragging or with the arrow keys. It can grow with its text instead.

```tsx figure=TextareaSizing motion

```

### Adapting to width

A field fills its container; set the width there.

- A long prefix is cut short so the value keeps its room.

```tsx figure=LongAddress widths="30 16" sweep

```

## Rules

Fields show where to type, name their value, and say what they take.

```tsx figure=OutlineForm

```

```tsx figure=GhostForm

```

### Kinds of value

Say what kind of value each field takes, such as an e-mail address, so the browser can fill it in and show the right keyboard.

### Read-only values

Show a value people can't change as read-only, so they can still focus and copy it. A disabled field can't be focused, copied or submitted.

### Labels

Name the value in a short noun phrase, and keep lasting instructions in the description.

```tsx figure=LabelAndDescription

```

```tsx figure=PlaceholderAsLabel

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

## Compose

### Usage

```tsx
<TextField label="Project name" name="project" defaultValue="Launch" />
<TextField label="Owner" name="owner" value={owner} onValueChange={setOwner} />
<SearchField label="Search members" value={query} onValueChange={setQuery} />
<Textarea label="Notes" name="notes" sizing="content" rows={3} />
```

A TextField is a native `<input>` with its `label`, `description` and `error`. Give it a `name` for its form, and leave it uncontrolled, with `defaultValue`, or control it with `value` and `onValueChange`, which receives the string as people type.

#### Errors

`error` marks the field invalid, sets `aria-invalid` and shows under the description. Check on blur and on submit, and clear it as soon as the value fits.

#### Variants and sizes

```tsx
<TextField variant="floating" label="Owner" name="owner" />
<TextField variant="ghost" label="Find projects" showLabel={false} startIcon={<Search />} />
<TextField size="sm" label="Filter" name="filter" />
```

`variant` is `outline`, the default, `floating` or `ghost`; Textarea takes `outline` or `ghost`. `size` is `sm`, `md` or `lg`; without it, a field takes its container's. `showLabel={false}` keeps the label for assistive technology only.

#### Prefix, suffix, icon and end action

`prefix` and `suffix` are short text in line with the value, not part of it, and forms don't submit them. `startIcon` is decorative. `endAction` holds a control, such as an IconButton, which takes the ghost variant where it sets none; name an icon-only one with `aria-label`.

#### Values the browser can help with

Set `type`, `autoComplete` and `inputMode` to fit the value, such as `type="email"` with `autoComplete="email"`. Use `readOnly` for a value people can see and copy but not change: a `disabled` field can't be focused, copied or submitted.

#### SearchField and Textarea

SearchField takes `value` and `onValueChange`, or `defaultValue`; its `label` shows only with `showLabel`. Textarea keeps its height and scrolls with `sizing="fixed"`, the default, or grows with its text with `sizing="content"`; `rows` sets its height, or the lines it starts at.

### Composition

TextField, SearchField and Textarea are built from Field's parts: the root, `env-field` with `env-text-field`, the control and its contents, then the description and the error, `env-field-error`. The suffix is `env-text-field-suffix`, and a Textarea's resize edge `env-textarea-resize-handle`. Build a field of your own from the same parts, as [Build your own field](field.md) shows.

A field fills its container's width, so set the width on the container, or on the field through `style`. Put fields in a native `<form>`, in a Column or a Grid: the inputs are native, so submission, reset and autofill work, and `ref` reaches the input for a form library.

### Customize

`className` and `style` reach the field's root, and `ref` and the other native props the input. CSS may target the part classes and their state attributes, such as `data-invalid` on the control, listed under Part names below.

## Changelog

- **1.0.0-prerelease.2**: The `underline` variant, which `plain` became in the earlier prereleases, is gone from TextField, SearchField and Textarea, for the default outline. Outline and floating fields have no fill of their own.
- **1.0.0**: `hint` is `description`, and the variants are `outline`, `floating` and `ghost`: `outlined` is `outline` and `quiet` is `ghost`, and `plain` is gone, for the default outline. `className` and `style` style the field's root rather than the input; `ref` and the other native props still reach the input. TextField and Textarea take `onValueChange`. The frame is Field's parts, and the classes follow: `env-text-input` is `env-text-field-input`, `env-text-field-well` `env-text-field-control`, `env-form-field` `env-field` and `env-field-hint` `env-field-description`. A button in `endAction` takes the ghost variant where it sets none. Textarea's resize edge is a `separator`, and its labels and the clear label come from EnvUIProvider's `messages`. Textarea's resize edge, `env-textarea-resize-edge`, is `env-textarea-resize-handle`, as every resize handle is named.
- **1.0.0**: `Input` is `TextField`, with the same props, behaviour and look; the page is `text-field`.
