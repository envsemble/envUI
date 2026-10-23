---
title: Field
summary: The parts of a labelled form field, a label, a control, a description and an error, for a control envUI has no field for.
status: beta
since: 1.0.0
category: Forms & selection
aliases:
  - form field
  - form control
  - label
  - field label
  - helper text
  - error message
  - validation
useWhen:
  - A control of the application's own needs a label, a description and an error, wired for assistive technology.
  - A form validates a value on blur or on submit with the browser's validity or a function of its own.
avoidWhen:
  - text: A single-line text input with a label, a description and an error.
    use: TextField
  - text: A choice from a list.
    use: Select
  - text: Text over several lines.
    use: Textarea
  - text: A choice that turns on or off.
    use: Checkbox
components:
  - Field
---

# Field

## Overview

Field gives a control of your own a label, a description and an error, wired for assistive technology.

```tsx example=ProjectName

```

### Validate on blur

`validate` returns an error message for a value, or nothing for a valid one. `validationMode` checks on submit, the default, on blur or on change.

```tsx example=ValidateOnBlur

```

### A control of the application's own

`render` on `Field.Control` takes any control, which the label and description then describe.

```tsx example=ApplicationControl

```

## When to use

```tsx do=ErrorAfterLeaving caption="Show an error once people leave the field or submit."

```

```tsx dont=ErrorOnArrival caption="An error before people have had a chance to type."

```

- Keep the description while the error shows; the error adds to it.
- Without children, `Field.Error` shows the browser's validation message; `match` picks one kind of failure.

## Anatomy

```tsx anatomy=FieldAnatomy

```

1. **Field** (`env-field`, `Field.Root`)
2. **Label** (`env-field-label`, `Field.Label`)
3. **Control** (`env-field-control`, `Field.Control`)
4. **Description** (`env-field-description`, `Field.Description`)
5. **Error** (`env-field-error`, `Field.Error`)

## Accessibility

### Keyboard

| Key                                             | Action                                           |
| ----------------------------------------------- | ------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the control; no other part takes focus. |

### envUI provides

- A label linked to the control, whose press focuses it.
- The description and error as the control's description, and `aria-invalid`.
- The error icon hidden from assistive technology.

### You provide

- A label for every field.
- A control in `render` that forwards its props and ref to the element people use.

## Changelog

- **1.0.0**: Field, on Base UI's Field.
