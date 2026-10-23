---
title: Form layout and validation
summary: Ask for information in a form, check it, and help people fix what's wrong.
status: beta
since: 1.0.0
intent: Collect and change information
aliases:
  - form
  - form validation
  - error summary
  - error message
  - required field
  - optional field
  - inline validation
  - submit
useWhen:
  - Someone gives or changes several pieces of information at once, and submits them together.
  - A form refuses what people entered and they need to find and fix each problem.
avoidWhen:
  - text: A single setting that takes effect at once.
    see: settings
  - text: Confirming a destructive action.
    use: ConfirmDialog
  - text: Filtering a list or a table as people choose.
    use: SearchField
composes:
  - Field
  - TextField
  - Textarea
  - Select
  - Combobox
  - RadioGroup
  - Radio
  - Checkbox
  - DatePicker
  - Button
  - Alert
  - Link
  - Column
  - Grid
  - Row
  - Text
---

# Form layout and validation

## Overview

A form asks for information and gets it right on the first submit: one column of labelled fields, the primary action after the last, and errors that say how to fix each problem, with focus taken to where people need to act.

```tsx example=CreateProject

```

### When to check

On submit first: show each field's `error`, and move focus to the error summary, or straight to the field when there is only one. Then as people leave a field they have typed in. Never while they type, though an error goes as soon as the value is right.

```tsx example=ValidationTiming

```

### Sending

The submit Button is `pending` while the form is sent: it keeps its size and ignores presses. When the server refuses or can't be reached, keep everything people entered, and move focus to an [Alert](../components/alert.md) at the top that says what to do.

```tsx example=ServerError

```

## Variants

### Error summary

After a refused submit, a danger Alert titled "There is a problem" lists each error as a [Link](../components/link.md) that moves focus to its field. Leave it without `announce`, so it is read once, as it takes focus.

```tsx example=ErrorSummary

```

### Grouped choices

One choice of several is a [RadioGroup](../components/radio.md); several are Checkboxes in a native `fieldset` whose `legend` names them.

```tsx example=GroupedChoices

```

## When to use

```tsx do=OneColumn caption="One column, read top to bottom, with the action after the last field."

```

```tsx dont=SideBySide caption="Fields side by side: people miss the one beside their path."

```

```tsx do=VisibleLabel caption="A label, and the format as a description that stays."

```

```tsx dont=PlaceholderLabel caption="The placeholder as the label: it goes as people type."

```

- Keep submit enabled, and say what is wrong after a submit; a disabled button can't tell people why.
- Keep what people entered after any error, and set `type` and `autoComplete` on the fields people fill in often.
- envUI has no stepper yet: split a long form into short pages of your own, each with its submit and a Back link.

### Content

- Name the submit button after what it does, "Create project", never "Submit".
- Mark the optional fields, "(optional)", rather than the required ones.
- Errors say how to fix the value, "Enter an email address like name@example.com", the same in the field and the summary ([error messages](../foundations/content.md#error-messages)).

## Anatomy

```tsx anatomy=FormAnatomy

```

1. **Error summary** (`env-alert`)
2. **Field and its label** (`env-text-field-control`, `label`)
3. **Description** (`env-field-description`, `description`)
4. **Error** (`env-field-error`, `error`)
5. **Primary action** (`env-button:not(env-link)`)

## Accessibility

Tab follows the fields in the order they show, and Enter in a text field submits. A refused submit moves focus to the summary, whose links each focus their field; where focus goes straight to the field and is already there, as after Enter, say the error in a status too.

### envUI provides

- Native inputs, radios and checkboxes, so typing, autofill and submission behave as the platform's.
- A label tied to every field; the description and error linked to it, and `aria-invalid` while `error` is set.
- RadioGroup as a `fieldset` with its `legend`, and a pending Button that reports busy.

### You provide

- `noValidate`, the checks and their messages, and focus after a refused submit: `tabIndex={-1}` and a ref on the summary.
- Links in the summary whose `onClick` focuses their field.
- A `fieldset` and `legend` around a group of checkboxes, and a `role="status"` message once saved.

## Changelog

- **1.0.0**: The page is on the figure template.
