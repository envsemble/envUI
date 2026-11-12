---
title: Form layout and validation
summary: Ask for information in a form, check it, and help people fix what's wrong.
status: beta
since: 1.0.0
intent: Enter and change data
aliases:
  - form
  - form validation
  - error summary
  - error message
  - required field
  - multi-step form
  - stepper
  - wizard
  - which control
  - optional field
  - inline validation
  - submit
useWhen:
  - Several answers, given and submitted together
  - Finding and fixing what a form refused
avoidWhen:
  - text: A single setting that takes effect at once.
    see: settings
  - text: Deleting or removing something, with undo or a confirmation.
    see: destructive-actions
  - text: Narrowing a list or a table as people choose, without submitting.
    see: filtering
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
  - Progress
  - DescriptionList
  - Button
  - Alert
  - Link
  - Column
  - Grid
  - Row
  - Text
examples:
  CreateProject: overview
  OneColumn:
    role: do
    caption: One column, read top to bottom, with the action after the last field.
  SideBySide:
    role: caution
    caption: 'Fields side by side: people miss the one beside their path.'
  FormAnatomy: anatomy
  ErrorSummary: example
  GroupedChoices: example
  LongFormInSteps: example
  ValidationTiming: example
  ServerError: example
---

# Form layout and validation

## Variants

### Error summary

After a refused submit, a danger [Alert](../components/alert.md) titled "There is a problem" lists each error as a [Link](../components/link.md) that moves focus to its field. It is read once, as it takes focus, with no announcement of its own.

```tsx figure=ErrorSummary motion

```

### Grouped choices

Several checkboxes go in a group whose name says what they are for, as the choices of a [RadioGroup](../components/radio.md) do.

```tsx figure=GroupedChoices

```

### A long form in steps

A long form splits into a few short steps, each a page of its own with its fields.

- [Progress](../components/progress.md), split into steps, says where people are.
- Continue checks the step's fields before moving on, and Back keeps every answer.
- The last step shows the answers before the form's own action.

```tsx figure=LongFormInSteps motion

```

## Anatomy

```tsx figure=FormAnatomy

```

1. **Error summary** (`env-alert`)
2. **Field and its label** (`env-text-field-control`, `label`)
3. **Description** (`env-field-description`, `description`)
4. **Error** (`env-field-error`, `error`)
5. **Primary action** (`env-button:not(env-link)`)

## Behaviour

### When to check

On submit first: show each field's error, and move focus to the error summary, or straight to the field when there is only one.

- Then as people leave a field they have typed in.
- Never while they type, though an error goes as soon as the value is right.

```tsx figure=ValidationTiming motion

```

### Sending

While the form is sent, its submit button shows that it is working: it keeps its size and ignores presses.

- When the server refuses or can't be reached, keep everything people entered.
- Move focus to an [Alert](../components/alert.md) at the top that says what to do.

```tsx figure=ServerError motion

```

## Rules

The aim is a form people get right on the first submit.

### Which control?

Ask for a choice with the control that shows it best.

| Control           | Use for                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Checkbox          | A yes or no that waits for the submit, or several choices of a few.                          |
| Switch            | A setting that applies at once, outside a form people submit, as in [settings](settings.md). |
| Radio group       | One choice of a few, all in view, where people compare them.                                 |
| Segmented control | One choice of a few short options that changes a view at once, such as a layout.             |
| Select            | One choice of many, or of a few where room is short.                                         |
| Combobox          | One choice of a long list that people type to find, such as a time zone or a person.         |

### Dates and times

A date, a time or a month each have a picker of their own, which people can also type into.

| Control      | Use for                                                     |
| ------------ | ----------------------------------------------------------- |
| Date picker  | A day, such as a due date or a start date.                  |
| Time picker  | A time of day, such as when a meeting starts.               |
| Month picker | A month, such as a report's period or a card's expiry date. |

```tsx figure=OneColumn

```

```tsx figure=SideBySide

```

### After an error

Keep the submit button enabled, and say what is wrong after a submit.

- A disabled button can't tell people why.
- Keep what people entered after any error.

### Labels

A label is a short noun phrase with no colon, such as "Project name".

- Mark the optional fields, "Description (optional)", never the required ones with a star.
- A format or a limit goes in the description, read before people type.
- A placeholder holds only an example value, such as name@example.com, never the label or instructions.
- The submit button says what it does, "Create project", never "Submit".
- Cancel, where a form has one, is a secondary Button before it, as a dialog's close button is.

### Error messages

Start with the fix, in the field's own words, such as "Enter a due date after the start date" or "Enter an email address like name@example.com".

- Never "Error: invalid input" or "Project name is required!".
- Blame no one and show no code; a reference may follow for support.
- The summary is titled "There is a problem" and repeats each field's message word for word.

## Accessibility

### Focus and keyboard

<kbd>Tab</kbd> follows the fields in the order they show, and <kbd>Enter</kbd> in a text field submits.

- A refused submit moves focus to the summary, whose links each focus their field.
- Where focus goes straight to the field and is already there, as after <kbd>Enter</kbd>, say the error in a status too.

### envUI provides

- Native inputs, radios and checkboxes, so typing, autofill and submission behave as the platform's.
- A label tied to every field; the description and error linked to it, and `aria-invalid` while `error` is set.
- RadioGroup as a `fieldset` with its `legend`, and a pending Button that reports busy.

### You provide

- `noValidate`, the checks and their messages, and focus after a refused submit: `tabIndex={-1}` and a ref on the summary.
- Links in the summary whose `onClick` focuses their field.
- A `fieldset` and `legend` around a group of checkboxes, and a `role="status"` message once saved.

## Compose

### Usage

A form is a native `<form noValidate onSubmit={…}>`, and the application runs the checks. On submit, set each wrong field's `error` and focus the error summary, or the field when only one is wrong. Then check a field in its `onBlur`, and clear its `error` as soon as the value fits.

```tsx source=ErrorSummary

```

#### Sending

```tsx
<Button type="submit" pending={sending}>
  Create project
</Button>
```

When the server refuses or can't be reached, keep the values and focus a danger Alert at the top.

#### Error summary

A danger Alert with `tabIndex={-1}` and a ref, without `announce`, so it is read once as it takes focus; its title takes `role="heading"`. Each error is a Link whose `onClick` focuses its field through the field's `ref`.

#### Grouped choices and browser help

A RadioGroup is a `fieldset` whose `legend` is its `label`; Checkboxes go in a native `fieldset` and `legend`. Set `type` and `autoComplete`, such as `autoComplete="email"`, on fields people fill in often.

#### A long form in steps

Keep every step's answers in state above the steps, so Back keeps them. Progress takes `segments` and `max` of the number of steps, `value` and `aria-valuetext`, such as "Step 2 of 3: Team". Continue, a `type="submit"` Button, checks only its step's fields, then focuses the next step's heading, a Text with `tabIndex={-1}`. The last step shows the answers in a DescriptionList, as the LongFormInSteps example does.

### Composition

One Column, kept to a width that reads easily, such as `maxInlineSize: '32rem'`, with the actions in a Row after the last field, the primary action last. A Grid suits only short fields that belong together, such as a city and a postal code. Field's parts build a control envUI lacks.

## Changelog

- **1.0.0**: The page is on the figure template, with a long form in steps, which controls to choose, and the labels and error messages of the content guidelines.
