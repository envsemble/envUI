---
'@envsemble/envui': patch
---

Fields speak one state language: under the pointer an outline field's edge darkens toward its text, to the muted text color, rather than turning the accent blue, so the accent shows focus alone. This applies to TextField, SearchField, Textarea, Select, Combobox, DatePicker, TimePicker, MonthPicker, Field.Control, ColorPickerButton and Composer. A focused ghost field draws the outline field's accent frame, twice as thick, rather than the fill it shows under the pointer, so its focus shows without a label too; the command palette's search, which always holds the caret, shows no ring. `--env-text-field-indicator` colors the edge while pressed and focused, and no longer under the pointer, where the edge follows `--env-text-field-outline` and `--env-text-field-content`.
