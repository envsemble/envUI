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
    caption: 'Outline: a short value on one line, with a label and a description.'
  SearchInSidebar:
    role: overview
    caption: 'Ghost: a search atop a sidebar, only its icon and words until it is used.'
  Variants: variants
  SearchInToolbar: example
  FieldsBesideButtons: example
  PrefixAndSuffix: example
  IconAndEndAction: example
  TextFieldAnatomy: anatomy
  Validation: example
  TextareaSizing: example
  LongAddress: example
  OutlineForm:
    role: do
    caption: Outline fields in a form, so people see where to type.
  GhostForm:
    role: dont
    caption: 'Ghost fields in a form: a faint fill says less than an edge about where to type.'
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
2. **Ghost**

| Variant | Use for                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------- |
| Outline | In forms, dialogs, panes and toolbars, and a field on its own on a page. The default.                   |
| Ghost   | A search in an application's chrome: atop a sidebar, among quiet buttons in a toolbar, or in a palette. |

### Outline

An outline field has no fill of its own. It takes the background of what it sits on, such as a card or a dialog. Its label rests inside it and floats into the edge, which opens behind it.

- It is as tall as a button of its size, so the two line up in a row.
- Stacked in a Column or a Grid, it keeps a little room above it for its floated label.
- A field on its own on a page, or in a long form, takes the large size.
- It can be given a fill of its own where it needs one.

### Ghost

A ghost field has no edge. A faint fill at rest shows where to type, and deepens under the pointer. Focus draws the accent edge an outline field takes.

- It has the outline field's corners, so the two sit together in a row.
- Keep it to toolbars, an application's chrome and palettes. In a form, a faint fill says less than an edge, so a form's fields are outline.
- Its label floats inside the fill, above the value, as there is no edge to cut a notch in, and stays within the field's height, so a ghost field is as tall as an outline one.
- A read-only or disabled ghost field keeps a fainter fill, quieter than one to fill in.
- An invalid ghost field shows a red edge.
- The [CommandPalette](command-palette.md)'s search is a large ghost field that keeps its fill.

```tsx figure=SearchInToolbar motion

```

### Sizes

Outline and ghost fields come in the three control heights of the [scale](../foundations/spacing.md): small, medium and large.

- A field lines up with a button of its size.
- Small is for a field with its label hidden, as in a dense toolbar or a filter row. A small field that shows its label takes the medium height, so the label and the value each keep room, and says so in the console while developing.

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

```tsx figure=IconAndEndAction

```

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

## Behaviour

### States

The label rests in an empty field and floats into the outline on focus or with a value.

- Under the pointer, the outline darkens.
- Focus alone draws it in the accent, twice as thick.

<!-- specimen: States -->

### Show an error

An error marks the field invalid and shows under its description. Say how to correct the value.

- Check on leaving the field and on submit, never while people type.
- Clear the error as soon as the value fits.

```tsx figure=Validation motion

```

### Search

A SearchField's clear button and <kbd>Esc</kbd> empty the query.

- Its label is for assistive technology, unless it is set to show; with the label hidden, its placeholder says Search unless it is given another.

<!-- specimen: ClearingTheQuery -->

### Textarea sizing

A Textarea keeps its height and scrolls, or grows with its text instead.

- People resize it by its bottom edge, by dragging or with the arrow keys.
- The grip, two short diagonal lines in the end corner, shows under the pointer and while the field has focus. A Textarea that grows with its text has none.

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

Show a value people can't change as read-only, so they can still focus and copy it.

- Its outline stays as at rest and doesn't answer the pointer. The value stays as dark as any other.
- A disabled field can't be focused, copied or submitted.

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
- The clear and resize labels and the search placeholder in the application's language, through EnvUIProvider's `messages`.

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
<TextField size="lg" label="Owner" name="owner" />
<TextField variant="ghost" label="Find projects" visibleLabel={false} startIcon={<IconSearch />} />
<TextField size="sm" label="Filter" visibleLabel={false} placeholder="Filter" name="filter" />
```

`variant` is `outline`, the default, or `ghost`, as on Textarea. `size` is `sm`, `md` or `lg`; without it, a field takes its container's. `visibleLabel={false}` keeps the label for assistive technology only; `sm` is for a field with its label hidden, as [Sizes](#sizes) says.

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

- **1.0.0**: `showLabel` is `visibleLabel`, named after the label that `visibleLabel={false}` hides. SearchField keeps `showLabel`, which shows its label where it is hidden by default.
- **1.0.0**: `hint` is `description`, and the variants are `outline`, `floating` and `ghost`: `outlined` is `outline` and `quiet` is `ghost`, and `plain` is gone, for the default outline. `className` and `style` style the field's root rather than the input; `ref` and the other native props still reach the input. TextField and Textarea take `onValueChange`. The frame is Field's parts, and the classes follow: `env-text-input` is `env-text-field-input`, `env-text-field-well` `env-text-field-control`, `env-form-field` `env-field` and `env-field-hint` `env-field-description`. A button in `endAction` takes the ghost variant where it sets none. Textarea's resize edge is a `separator`, and its labels and the clear label come from EnvUIProvider's `messages`. Textarea's resize edge, `env-textarea-resize-edge`, is `env-textarea-resize-handle`, as every resize handle is named.
- **1.0.0**: `Input` is `TextField`, with the same props, behaviour and look; the page is `text-field`.
- **1.0.0-prerelease.6**: The edge and the label change color in `--env-motion-duration-fast` with `--env-motion-ease-enter`, as every color under the pointer does; the label still floats and the notch still opens over `--env-motion-duration-medium`.
- **1.0.0-prerelease.6**: Colors under the pointer and while pressed change with `--env-motion-ease-enter`, rather than easing in slowly, so hover and press show from the first frame.
- **1.0.0-prerelease.6**: The outline's notch closes at the pace the floated label settles, so the edge never crosses it.
- **1.0.0-prerelease.6**: A SearchField with its label hidden and no `placeholder` shows Search, `messages.searchField.placeholder`, rather than an empty field with only its icon.
- **1.0.0-prerelease.6**: Textarea's resize grip is two short diagonal lines in its end corner, rather than a bar in the middle that read as a sheet's handle.
- **1.0.0-prerelease.6**: A Textarea whose text runs past its `rows` clips that text at its padding, rather than showing the next line under the bottom border.
- **1.0.0-prerelease.6**: The `floating` variant is gone: a field on its own or in a long form on a page takes `outline`, the default, with `size="lg"`. An outline field takes a text area's rounded corners rather than round ends, and so does a ghost field. A small field with a visible label takes the medium height, so its floated label and its value each have room, and says so in the console while developing: `sm` is for a field with its label hidden. A ghost field shows a faint fill at rest, fainter when it is read-only or disabled, so a labelled one no longer reads as a label and its value, and its label floats inside the fill, within the field's height, rather than across its top edge. A focused ghost field keeps its placeholder, as an outline one does. A disabled field no longer fades as a whole: its label, value and icons take `--env-color-fg-disabled` and its outline the muted border, so it stays readable, also in dark.
- **1.0.0-prerelease.2**: The `underline` variant, which `plain` became in the earlier prereleases, is gone from TextField, SearchField and Textarea, for the default outline. Outline and floating fields have no fill of their own.
