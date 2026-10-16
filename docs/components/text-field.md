---
title: TextField
summary: Single-line inputs, search fields and multiline textareas share labels, guidance and states.
status: beta
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
  - stack
  - accessibility
components:
  - TextField
  - SearchField
  - Textarea
---

# TextField

## Overview

A text field takes a short value on one line, such as a name, an address or a number. It is a native `<input>` with a label that rests in the empty field and floats into the outline while the field has focus or a value, and a hint and an error linked to the control, so typing, autofill, form submission and reset behave as the platform's.

The family shares the field's frame, label, hint, error and states:

- **SearchField** is a TextField for a query, with a search icon and, while it has a query, a clear button; <kbd>Esc</kbd> also clears. Its label is hidden by default, so it sits beside buttons with a placeholder.
- **Textarea** takes text over several lines, at a fixed height that scrolls and resizes from its bottom edge, or growing with its content.

```tsx example=ProjectName

```

## Anatomy

1. **Well**: the border, fill and corners of the variant, around every part but the hint and the error. Fields at the control height are pills; floating and plain fields and text areas have 1 rem corners.
2. **Label** (`label`): rests in the empty field and floats into the outline while the field has focus or a value, hiding only the outline behind it. `showLabel={false}` hides it, as SearchField does by default.
3. **Start icon** (optional, `startIcon`): decorative, at the control icon size of 1 rem.
4. **Prefix and suffix** (optional, `prefix`, `suffix`): short text in line with the value, not part of it.
5. **Value**: the native input or textarea, with its placeholder.
6. **End action** (optional, `endAction`): a control at the end of the field, such as SearchField's clear button.
7. **Hint** (optional, `hint`) and **error** (optional, `error`): under the well, 0.75 rem below it; the error leads with an error icon.
8. **Resize edge** (Textarea with fixed sizing): the whole bottom edge, drawn as a line in the border's color.

## Variants and sizes

| Variant    | Use for                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `outlined` | In forms, dialogs, panes and toolbars: a thin border that turns blue on hover and focus, at the control height. The default.          |
| `floating` | A long form on a page: an outlined field 3.5 rem tall, whose label floats above the value.                                            |
| `plain`    | A value in a document or a header, such as a title, where a border would compete with the content: an underline on hover and focus.   |
| `quiet`    | A search at the top of a sidebar or a list: only the text and the start icon at rest, and a soft fill under the pointer and in focus. |

Textarea comes outlined or plain.

<!-- specimen: Appearances -->

- Outlined and quiet fields take the control height of their `size`, as every control does: `sm`, `md` and `lg` are 2, 2.5 and 3 rem in the comfortable scale, and 1.625, 2 and 2.375 rem in the compact one. Without a size, a field takes its container's control height, `md` by default. The label rests in the middle and floats into the outline without adding height, so the field stays in line with buttons beside it. An end action is 0.5 rem shorter than the field. On touch screens fields grow to 2.75 rem, as every control does, and an end action takes presses up to 2.75 rem tall, within the field.
- Floating and plain fields are 3.5 rem tall inside a 0.0625 rem border, 2.75 rem in the compact scale, with 1 rem padding. A field with a visible label keeps 0.5 rem above it for the floated label. See [scale and density](../foundations/scale.md).
- A Textarea starts at 7.5 rem. With `rows`, a fixed Textarea is that many lines tall, at least 7.5 rem, and a growing one starts at that many lines, also below 7.5 rem.
- Entered text and a resting label are 0.9375 rem, 0.8125 rem in the compact scale; a floated label, the hint and the error are 0.875 rem. On touch screens, entered text, resting labels, prefixes and suffixes are 1 rem (16 px by default), so focusing a field does not zoom the page.
- A field fills the width of its container; set the width on the container.

## States and behaviour

- **Hover, pressed and focus**: an outlined field's single thin border turns blue on hover and focus in both themes, without changing its fill or adding an outline. Hover and pressed shades are color tokens of their own, as [colors and themes](../foundations/colors.md) describes, also while the field has focus. The label and the start icon take the focus color. Plain fields show an underline on hover and focus; quiet fields take a soft fill and clear their placeholder once focused.
- **Empty and filled**: the label rests in an empty field and floats into the outline once it has focus or a value. A labelled field shows its placeholder only while focused; a field with a hidden label shows it at rest.
- **Invalid**: while `error` is set, the control reports `aria-invalid` and the message shows under the field. Outlined and quiet fields turn their border red, and plain fields show a red underline, thicker on keyboard focus; hover and press change its shade, and the label turns red too.
- **Read only** (`readOnly`): looks like an enabled field. People can focus, select and copy the value but not change it, and forms submit it.
- **Disabled**: the field takes the shared disabled opacity, cannot be focused and is left out of form submission. Its prefix and suffix no longer place the caret, a Textarea cannot be resized and SearchField's clear button is disabled.
- **Prefix and suffix**: they stay hidden while the label rests in an empty field and appear once the field has focus or a value; with a hidden label they always show. A long prefix is cut short with an ellipsis so the value keeps its room. Pressing the prefix places the caret at the start of the value, and the suffix at its end. A form submits only what people type.
- **End action**: a text IconButton in the field takes the field's quiet icon color and darkens to the text color, over a state layer, on hover and press. An end action eases in as it appears.
- **SearchField**: the clear button shows while there is a query. Pressing it clears the query, reports an empty string to `onValueChange` and returns focus to the field. <kbd>Esc</kbd> clears too, and consumes the key so an enclosing dialog stays open; in an empty SearchField it goes on, such as to close the dialog. The query can be controlled with `value` and `onValueChange`, or start from `defaultValue`.
- **Textarea sizing**: with `sizing="fixed"`, the default, the field keeps its height and scrolls its text. Its whole bottom edge resizes it, by dragging or from the keyboard, never below the minimum height; the edge follows the border's color on hover, focus and error, takes the pressed shade while dragging, and is 2.75 rem tall on touch screens. With `sizing="content"` the field grows and shrinks with its text and has no resize edge; browsers without native content sizing keep the edge.
- **Native forms**: the controls are native, so `name`, `required`, `pattern`, autofill and form reset work as usual, and an uncontrolled field returns to its `defaultValue` on reset. Validation and drafts belong to the application.

<!-- specimen: States -->

## Content guidelines

- Name the value in the label with a short noun phrase in sentence case, without a colon: "Project name", "E-mail address".
- Put lasting instructions, such as a format, a limit or what the value is for, in the hint: "Used in links to the project." Keep it to one sentence.
- Write an error that says how to correct the value, not only that it is wrong: "Use only lowercase letters, numbers and hyphens", not "Invalid handle".
- Use a placeholder for an example of the value or, in a field with a hidden label, for what to type: "Search by name or e-mail". It disappears as people type, so it never holds the only instructions.
- Keep a prefix or suffix to a few characters, such as the start of an address, a currency or a unit: "https://example.com/", "€", "GB".
- Name a SearchField after what it searches: "Search members", "Find projects".
- Name an end action after what it does: "Show password", "Copy address".

## Do and don't

### Do

- Use TextField for one line and Textarea for text over several lines.
- Give a field and the buttons beside it the same size, so they line up; use `variant="floating"` for a long form on a page.
- Use a text IconButton as `endAction`, so it takes the field's icon color and state layers.
- Set `type`, `autoComplete` and `inputMode` to match the value, such as `type="email"` with `autoComplete="email"`, so browsers offer the right keyboard and autofill.
- Use `readOnly` for a value people can see and copy but not change.
- Show an error once people leave the field or submit the form, and remove it as soon as the value is corrected.

### Don't

- Don't use a placeholder as the label or for instructions that must stay; use `label` and `hint`.
- Don't put controls or part of the value in a prefix or suffix; they cannot be focused and forms don't submit them.
- Don't disable a field to show a value that cannot change; a disabled field cannot be focused or copied, and forms don't submit it.
- Don't use quiet fields in forms, where people need to see where to type.
- Don't add a search icon or a clear button to a SearchField; it has both.
- Don't use a Textarea for a message in a conversation; use [Composer](../components/composer.md), which sends with <kbd>Enter</kbd>.

## Accessibility

### Keyboard

| Key                                                                             | Action                                                                                                                                                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                 | Moves focus to the next or previous field. An end action, such as SearchField's clear button, and a fixed Textarea's resize edge follow their field in the tab order. |
| <kbd>Esc</kbd> in a SearchField with a query                                    | Clears the query and keeps focus in the field; an enclosing dialog stays open. In an empty SearchField the key goes on, such as to close the dialog.                  |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on SearchField's clear button              | Clears the query and returns focus to the field.                                                                                                                      |
| <kbd>↑</kbd> or <kbd>↓</kbd> on a resize edge                                   | Shrinks or grows the Textarea by one line.                                                                                                                            |
| <kbd>Shift</kbd>+<kbd>↑</kbd> or <kbd>Shift</kbd>+<kbd>↓</kbd> on a resize edge | Shrinks or grows the Textarea by five lines.                                                                                                                          |
| <kbd>Home</kbd> on a resize edge                                                | Restores the Textarea's minimum height.                                                                                                                               |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a resize edge                           | Grows the Textarea by one line.                                                                                                                                       |

### envUI provides

- Native `<input>` and `<textarea>` elements, so typing, selection, autofill, native validation, form submission and reset behave as the platform's. SearchField is `type="search"`, a search box.
- A `<label>` tied to the control, kept for assistive technology when `showLabel={false}` hides it.
- The hint and the error linked to the control as its description, and `aria-invalid` while `error` is set; the error icon is hidden from assistive technology.
- The prefix and suffix read once, after the label and before the hint.
- Decorative start icons hidden from assistive technology.
- SearchField's clear button, named "Clear search" (`clearLabel`), with the same text in its tooltip.
- Textarea's resize edge, a button named "Resize text area" that controls the field and describes its keys; it leaves the tab order while the field is disabled or grows with its content.
- 1 rem text on touch screens, so focusing a field does not zoom the page, and a 2.75 rem resize edge for coarse pointers.

### You provide

- A `label` for every field, or `aria-label` or `aria-labelledby` on a TextField or Textarea whose name shows elsewhere.
- An `aria-label` on every icon-only `endAction`.
- Validation: when to check, the `error` message, and moving focus to the first invalid field when a form is refused.
- `type`, `autoComplete` and `inputMode` that fit the value.
- `clearLabel` in the application's language.
- An announcement of the results when a search filters content as people type, such as a count in a status region.

## Examples

### Appearances

Outlined fields suit forms, plain fields a title in a document or a header, and quiet fields a search at the top of a sidebar.

```tsx example=Variants

```

### Show an error

The hint states the rule and the error says how to correct the value. Here the field is checked once people leave it, and the error goes as soon as the value fits.

```tsx example=Validation

```

### Prefix and suffix

Short text in line with the value, such as the start of an address or a unit; forms submit only the value. It appears once the field has focus or a value, and always beside the placeholder of a field whose label is hidden.

```tsx example=PrefixAndSuffix

```

### Icon and end action

`startIcon` adds a decorative icon at the start; `endAction` holds a control at the end, here a text IconButton that shows the password.

```tsx example=IconAndAction

```

### Fields beside buttons

Fields share the button height of their size. Without a visible label the placeholder guides; with its label shown, the label rests inside and floats into the outline without changing the height.

```tsx example=FieldsBesideButtons

```

### Search a list

SearchField filters as people type; its clear button and <kbd>Esc</kbd> clear the query. A status line announces how many members match.

```tsx example=FilterList

```

### Search a sidebar

A quiet SearchField at the top of a sidebar shows only its icon and placeholder until the pointer or focus gives it a soft fill.

```tsx example=SidebarSearch

```

### Textarea sizing

A fixed Textarea scrolls its text; drag its bottom edge, or focus the edge and use the arrow keys, to resize it. With `sizing="content"` and `rows={1}`, a reply starts at one line and grows with its text.

```tsx example=TextareaSizing

```

## Changelog

- **1.0.0**: `Input` is `TextField`, with the same props, behaviour and look; the page is `text-field`.
- **0.6.0**: The `quiet` variant on TextField and SearchField.
- **0.5.0**: `prefix` and `suffix`; entered text, resting labels, prefixes and suffixes are 1 rem on touch screens; a growing Textarea with `rows` starts at that many lines.
- **0.4.0**: `showLabel`; a floated label hides only the outline behind it; end actions take the field's icon color and state layers.
- **0.3.0**: End actions ease in as they appear.
- **0.2.0**: `startIcon`, `endAction` and `compact`; SearchField.
- **0.1.0**: Input and Textarea, outlined and plain, with labels, hints and errors; Textarea's fixed and content sizing with its resize edge.
