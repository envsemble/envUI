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
related:
  - text-field
  - select
  - checkbox
components:
  - Field
---

# Field

## Overview

Field puts a form control together with its label, its description and its error: `Field.Label` names the control, and `Field.Description` and `Field.Error` describe it, with their ids, `aria-invalid` and the disabled state wired through Base UI's Field. `Field.Control` is a native text input in the outlined field look by default, or any control through `render`.

envUI's own fields, such as TextField and Select, have this anatomy built in; use Field for a control they don't cover.

```tsx example=ProjectName

```

## Anatomy

1. **Root** (`Field.Root`): the field, which takes `name`, `invalid`, `disabled` and the validation props: `validate` and `validationMode`.
2. **Label** (`Field.Label`): the visible name, in the field's small type; it names the control.
3. **Control** (`Field.Control`): a text input at the control height of its `size`, with the pill outline of envUI's fields, or the control in `render`.
4. **Description** (`Field.Description`): lasting guidance under the control, in the muted color.
5. **Error** (`Field.Error`): how to correct the value, with an error icon, in the danger color, while the field is invalid.

## Variants and sizes

- **Size**: `size` on `Field.Control` gives it the control height of `sm`, `md` or `lg`, 2, 2.5 or 3 rem in the comfortable scale; without it, the control height of its container. Under a coarse pointer it grows to the 2.75 rem touch height.
- **Spacing**: the parts sit 0.75 rem apart, the label, description and error in the 0.875 rem body-small type.
- **A control of your own**: the control in `render` takes the class `env-field-control`, and so the outline; give it a style of its own where it draws itself, such as a slider.

## States and behaviour

- **Hover and focus**: the control's outline takes the accent color on hover and while it has focus.
- **Invalid**: with `invalid` on the root, or a failed validation, the control reports `aria-invalid`, its outline turns to the danger color and the error shows. Without children, the error shows the browser's validation message; `match`, such as `match="valueMissing"`, shows it for one kind of failure, and `match={true}` always.
- **Validation**: `validate` returns an error message for a value, or nothing for a valid one, on submit by default, or on blur or change with `validationMode`.
- **Disabled**: `disabled` on the root disables the control and fades the field.

## Content guidelines

- Write the label as a short noun phrase, such as "Project name".
- Put lasting guidance, such as a format or a limit, in the description, not in a placeholder.
- Write the error as what to do, such as "Enter a project name.", not what went wrong.

## Do and don't

### Do

- Use envUI's fields where one fits; reach for Field for a control of your own.
- Keep the description while the error shows; the error adds to it.

### Don't

- Don't use a placeholder as the label.
- Don't show an error before people have had the chance to fill in the field.

## Accessibility

### Keyboard

| Key                                             | Action                                                          |
| ----------------------------------------------- | --------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the control and away; the other parts take none. |

### envUI provides

- A label element linked to the control, whose press focuses it.
- The description and the error linked to the control as its description, and `aria-invalid` while the field is invalid.
- The error icon hidden from assistive technology.

### You provide

- A label for every field.
- A control that forwards its props and ref to the element people interact with, when you pass one in `render`.

## Examples

### Validate on blur

`validate` checks the value as focus leaves the control, and the error shows the message it returns.

```tsx example=ValidateOnBlur

```

### A control of the application's own

`render` takes any control, such as a native range input, which the label and the description describe.

```tsx example=ApplicationControl

```

## Changelog

- **1.0.0**: Field, on Base UI's Field.
