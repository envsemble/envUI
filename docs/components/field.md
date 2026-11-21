---
title: Field
summary: Adds a label, description and error message to a custom control.
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
  - A label, a description and an error for a control of the application's own
  - A value checked on blur or on submit
avoidWhen:
  - text: A single-line text input with a label, a description and an error.
    use: TextField
  - text: A choice from a list.
    use: Select
  - text: Text over several lines.
    use: Textarea
components:
  - Field
examples:
  ProjectName: overview
  FieldAnatomy: anatomy
  ValidateOnBlur: example
  ApplicationControl: example
---

# Field

## Anatomy

```tsx figure=FieldAnatomy

```

1. **Field** (`env-field`, `Field.Root`)
2. **Label** (`env-field-label`, `Field.Label`)
3. **Control** (`env-field-control`, `Field.Control`)
4. **Description** (`env-field-description`, `Field.Description`)
5. **Error** (`env-field-error`, `Field.Error`)

## Behaviour

### Validate on blur

```tsx figure=ValidateOnBlur motion

```

### A control of the application's own

```tsx figure=ApplicationControl

```
