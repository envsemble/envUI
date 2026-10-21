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
  - Row
  - Text
related:
  - settings
  - destructive-actions
  - field
  - text-field
  - select
  - radio
---

# Form layout and validation

## Overview

Use this pattern to ask for information in a form and get it right on the first submit: one column of labelled fields, the primary action after the last one, and errors that say how to fix each problem, shown when people submit or leave a field, with focus taken to where they need to act.

```tsx example=CreateProject

```

## Anatomy

1. **Form:** a native `form` with `noValidate`, so the application checks the fields and words the errors, and Enter in a field submits. One column, in a readable width.
2. **Fields:** [TextField](../components/text-field.md), [Textarea](../components/text-field.md), [Select](../components/select.md), [Combobox](../components/combobox.md), [DatePicker](../components/date-picker.md), each with a visible `label`, a `description` for a format or a constraint, and an `error` while the value is wrong. Set `name`, `type` and `autoComplete` so the browser can fill and submit them. For a control of your own, [Field](../components/field.md) gives the same label, description and error.
3. **Choices:** a [RadioGroup](../components/radio.md) of `Radio` options for one choice, a [Checkbox](../components/checkbox.md) for one yes-or-no answer, and a group of Checkboxes for several (see "Grouped choices").
4. **Actions:** the primary [Button](../components/button.md), `type="submit"`, first and at the start of the row after the last field, with `pending` while the form is sent. A secondary action, such as Cancel, follows it.
5. **Error summary:** after a refused submit, an [Alert](../components/alert.md) `tone="danger"` at the top of the form, its title "There is a problem" a level-2 heading, listing each error as a [Link](../components/link.md) to its field.
6. **Outcome:** a [Text](../foundations/typography.md) with `role="status"` that says the form was saved, or a toast where the page changes.

## States and behaviour

- **Validate on submit first.** Check every field when people submit. If any is wrong, show each field's `error` and the error summary, and move focus to the summary. A form with one field, or one that only checks a single field, can move focus straight to it instead, as the lead example does. When focus is already in that field, as after Enter in it, focusing it again reads nothing, so say the error in a status instead; otherwise only move focus, so the error isn't read twice.
- **Then on blur.** Once people have typed in a field, check it as they leave it.
- **Never while typing.** An error doesn't appear while people type, but it goes as soon as the value is fixed: a field that was wrong is checked on every change, only to clear it.
- **Keep submit enabled.** Never disable the submit button to signal invalid input; people can't tell why it doesn't work, and the button can't be focused to find out. Submit, and say what is wrong.
- **Sending.** The submit button is `pending` while the form is sent: it keeps its size, reports busy and ignores presses. The fields stay as they are.
- **Failure of the system.** When the server refuses or can't be reached, keep everything people entered, show an Alert at the top that says what happened and what to do, move focus to it, and let people submit again.
- **Success.** Say it once in a status, or move on to the new page. Don't clear the form on a failure.
- **Narrow windows.** The column fills the width; the action row wraps.
- **Not covered: multi-step forms.** envUI has no stepper yet. Split a long form into pages of your own, each with its own submit and a "Back" link, and keep the steps short.

## Content guidelines

- Labels, optional fields and descriptions follow [Labels, descriptions and placeholders](../foundations/content.md#labels-descriptions-and-placeholders): a noun phrase, "(optional)" on the fields that are, never a placeholder as the label.
- Errors follow [Error messages](../foundations/content.md#error-messages): say how to fix the value, "Enter an email address like name@example.com", with no "Error:" prefix. Use the same message in the field and in the summary.
- Name the submit button after what it does, "Create project" or "Save details", following [Buttons and actions](../foundations/content.md#buttons-and-actions); never "Submit".
- Title the error summary "There is a problem".

## Do and don't

### Do

- Ask only for what you need, in the order people think of it.
- Put the primary button first, at the start, after the last field.
- Set `type` and `autoComplete` on fields people fill in often, such as names, email addresses and phone numbers.
- Keep what people entered after any error.

### Don't

- Don't lay fields out in several columns; people miss the ones beside their path.
- Don't disable submit until the form is valid.
- Don't use a placeholder as a label or for instructions that must stay.
- Don't show an error while people are still typing.
- Don't mark required fields with an asterisk; mark the optional ones.

## Accessibility

### Focus and keyboard

Tab moves through the fields in the order they show, and Enter in a text field submits the form. When a submit is refused, focus moves to the error summary, whose content is read as it takes focus; Tab then reaches its links, and each link moves focus to its field rather than only scrolling to it. Where a form moves focus straight to an invalid field instead, the field reads its label and its error as focus arrives. After Enter in that field, focus is already there and nothing is read, so only then does the status beside the actions say the error; after a click on the submit button, moving focus reads it, and the status stays empty. After a failure of the system, focus moves to the Alert at the top. After success, focus stays on the submit button and the status is announced.

### envUI provides

- Native inputs, text areas, radios and checkboxes, so typing, autofill, form submission and reset behave as the platform's.
- A label tied to every field, and RadioGroup as a `fieldset` whose `legend` names its options.
- The `description` and the `error` linked to the control as its description, and `aria-invalid` while `error` is set.
- A pending Button that keeps its size, reports busy and ignores presses.
- Alerts with a tone icon hidden from assistive technology; info and success Alerts as status messages.

### You provide

- `noValidate` and the checks, with an error message for each field.
- Moving focus after a refused submit, to the summary or the invalid field: `tabIndex={-1}` and a ref on the summary Alert let it take focus.
- Where focus goes straight to the field, the error in a status too, for when focus is already in the field.
- A heading for the summary's title: `role="heading"` and `aria-level={2}` on an element in `title`.
- Links in the summary whose `onClick` focuses their field.
- A `fieldset` and `legend` around a group of checkboxes, until envUI has a checkbox group.
- A status message, `role="status"`, when the form is saved.

## Examples

### Error summary

Submitting with errors shows each field's error and a summary at the top, which takes focus. Each link in it moves focus to its field. envUI has no error summary component yet: this is a danger Alert with a list of Links, and its title is made a heading by hand. Leave the Alert without `announce`: a danger Alert then has no role, so it is read once, as it takes focus, rather than announced as an alert and read again with focus.

```tsx example=ErrorSummary

```

### Validation timing

A field is checked when people leave it, once they have typed in it, and on submit. While people type, an error only clears, as soon as the value is right. With two fields, a refused submit shows the error summary and moves focus to it.

```tsx example=ValidationTiming

```

### Server error

The first save fails: the fields keep their values, an Alert at the top says what happened and takes focus, and saving again succeeds.

```tsx example=ServerError

```

### Grouped choices

One choice of several is a RadioGroup. Several choices are Checkboxes in a native `fieldset` whose `legend` names them, since envUI has no checkbox group yet.

```tsx example=GroupedChoices

```
