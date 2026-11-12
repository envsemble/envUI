---
'@envsemble/envui': major
---

Fields and choice controls take the 1.0 vocabulary, and envUI's fields are built from Field's parts:

- `hint` is `description` on TextField, SearchField, Textarea, Select, Combobox, DatePicker, ColorPicker, Slider and MarkdownEditor.
- The field variants are `outline`, `floating`, `underline` and `ghost`: `outlined` is `outline`, `plain` is `underline` and `quiet` is `ghost`. Select's trigger is `secondary` or `outline`.
- Select takes `items`, of `SelectItem`, instead of `options` and `SelectOption`.
- DatePicker's `withTime` is `granularity`, `"day"` (the default) or `"minute"`.
- Slider's `onValueCommit` is `onValueCommitted`, as Base UI names it.
- DropZone's `onFiles` is `onDropAccepted` and `onReject` is `onDropRejected`. The zone is named by its label and description, as its visible text is, and described by its error.
- RadioGroup's `variant` is `orientation`: `inline` is `horizontal` and `rows` is `vertical`. Radio's `detail` is `description`. A focused radio shows the focus ring.
- `className` and `style` style the root, the field or the label around a choice, on TextField, SearchField, Textarea, Select, Combobox, DatePicker, Checkbox, Switch and Radio, and MarkdownEditor's `env-markdown-editor`; `ref` and the other native props reach the native control. Every one takes `ref` as a prop.
- TextField and Textarea take `onValueChange`, after the native `onChange`. An uncontrolled SearchField returns to its `defaultValue` on a native form reset.
- A button in a field's `endAction` takes the `ghost` variant where it sets none; the buttons of a popover or menu it opens don't. Textarea's resize edge is a focusable `separator`.
- Combobox's read-only chips no longer carry `aria-readonly`, which the input reports.
- The built-in strings of SearchField, Textarea, Combobox, DatePicker, Calendar, ColorPicker and Composer come from EnvUIProvider's `messages`, and Calendar, DatePicker and Slider format in its `locale`.
- Select's and Combobox's popups are the shared popup with its rows, and the classes follow the components: `env-text-input` is `env-text-field-input`, `env-text-field-well` `env-text-field-control`, `env-form-field` `env-field`, `env-field-hint` `env-field-description`; `env-dropdown-trigger`, `-options`, `-list`, `-option` and `-option-check` are `env-select-trigger`, `-popup`, `-list`, `-item` and `-item-indicator` (`env-combobox-popup` and `env-combobox-list` inside a combobox); `env-combobox-well`, `-option` and `-check` are `env-combobox-control`, `-item` and `-item-indicator`; `env-date-time-well` is `env-date-picker-control`; `env-checkbox-control` and `-mark` are `env-checkbox-input` and `-indicator`; `env-switch-control` is `env-switch-input`; `env-radio-options`, `-control` and `-detail` are `env-radio-group`, `env-radio-input` and `env-radio-description`; `env-choice-control` is `env-checkbox`, `env-switch` or `env-radio`.

Migrate with the codemods: `v1-props` moves the props and their literal values (an expression is reported), `v1-names` renames `SelectOption`, and `v1-classes` the classes. `v1-props` reports each `className` and `style` on these components; move one meant for the native control to a selector under the root by hand, as the migration guide shows.

Migration guide: [Fields and choice controls](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
