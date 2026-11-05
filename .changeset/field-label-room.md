---
'@envsemble/envui': patch
---

An outline field that shows its label gives it room: it is at least 2.25 rem tall, so in a small field, or one at the compact scale, the floated label in the edge and the value below it no longer crowd each other, and the value sits in the middle rather than nudged toward the bottom edge. A field with its label hidden, as a search in a toolbar, keeps the control height and lines up with buttons. Stacked in a Column or a Grid, a single-line field with a visible label keeps `--env-space-1` above it for the label, so it doesn't crowd the field above. This applies to TextField, SearchField, Select, Combobox, DatePicker, TimePicker and MonthPicker; [TextField's sizes](https://github.com/envsemble/envUI/blob/main/docs/components/text-field.md#sizes) say how.
