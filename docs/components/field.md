---
title: Field
summary: The label, description and error around a control envUI has no field for.
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
  - A value checked on blur or on submit, by the browser's rules or a check of its own
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
examples:
  ProjectName: overview
  FieldAnatomy: anatomy
  ValidateOnBlur: example
  ApplicationControl: example
  ErrorAfterLeaving:
    role: do
    caption: Show an error once people leave the field or submit.
  ErrorOnArrival:
    role: dont
    caption: An error before people have had a chance to type.
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

A field can check its value with a check of the application's own, which returns an error message or nothing, on submit, on blur or as people type.

```tsx figure=ValidateOnBlur motion

```

### A control of the application's own

The control can be any control, which the label and the description then name and describe.

```tsx figure=ApplicationControl

```

## Rules

An error shows once people have had a chance to answer, and adds to the description.

```tsx figure=ErrorAfterLeaving motion

```

```tsx figure=ErrorOnArrival

```

### Description and error

Keep the description while the error shows: the error adds to it.

### Beside envUI's fields

Field is the low-level building block, its label above the control, while TextField, Select, the pickers and the other form fields take the notched label in their edge. Build a form's fields from those, and keep Field for a control they don't cover, so one form doesn't mix the two labels.

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

## Compose

### Usage

Field.Root holds a Field.Label, a Field.Control, a Field.Description and a Field.Error, and gives the field its `name` for a form. Field.Control is a native input by default.

- It takes its native props, such as `required` and `maxLength`.
- It takes `defaultValue`, or `value` and `onValueChange`.
- It takes `size`, `sm`, `md` or `lg`, the control heights.

```tsx source=ProjectName

```

#### Validation

`validate` on Field.Root returns an error message for a value, or nothing for a valid one.

- `validationMode` checks `onSubmit`, the default, `onBlur` or `onChange`, with `validationDebounceTime` between checks as people type.
- Without children, Field.Error shows the field's validation message, the one `validate` returns or the browser's; `match` shows an error for one kind of failure only, such as `valueMissing`.
- `invalid`, `dirty` and `touched` take the state from a form library, and `actionsRef` validates on demand.

```tsx
<Field.Root name="handle" validationMode="onBlur" validate={checkAddress}>
  <Field.Label>Workspace address</Field.Label>
  <Field.Control />
  <Field.Error />
</Field.Root>
```

#### Any control

`render` on Field.Control takes any control, which receives the id, the ids of the label and the description, and the ref; it must forward them to the element people use. A control that draws its own frame can take the field's outline off through `style`, as the ApplicationControl example does.

```tsx
<Field.Control
  render={<Volume />}
  value={String(volume)}
  onValueChange={(next) => setVolume(Number(next))}
  style={{ border: 0, background: 'none', paddingInline: 0 }}
/>
```

### Composition

The parts are the root, `env-field`, the label, `env-field-label`, the control, `env-field-control`, the description, `env-field-description`, and the error, `env-field-error`. TextField, DatePicker and envUI's other fields are built from them, and so are fields of an application's own. `disabled` and `name` on Field.Root take precedence over the control's.
