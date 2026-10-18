---
'@envsemble/envui-codemods': minor
---

The rename map covers the fields and choice controls: `hint` to `description`, the field variants, Select's `options` and `SelectOption`, DatePicker's `withTime`, Slider's `onValueCommitted`, DropZone's `onDropAccepted` and `onDropRejected`, RadioGroup's `orientation` and Radio's `description`, and the classes of the text field, Select, Combobox, DatePicker, Checkbox, Switch and Radio.

`v1-props` reports each `className` and `style` on TextField, SearchField, Textarea, MarkdownEditor, Select, Combobox, DatePicker, Checkbox, Switch and Radio, which style the root element in 1.0 rather than the input, textarea or trigger, and leaves them as they are. The map's prop rules can now be report-only: a rule with a `report` and neither `to` nor `values` keeps the prop and reports every use.
