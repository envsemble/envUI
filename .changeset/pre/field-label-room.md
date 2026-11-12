---
'@envsemble/envui': patch
---

A single-line field that shows its label is at least the md control height: a small one takes the medium height, so the floated label in the edge and the value below it no longer crowd each other, and at md and lg it is as tall as the buttons of its size. A field with its label hidden, as a search in a dense toolbar, keeps the small height and lines up with small buttons. Stacked in a Column or a Grid, a single-line field with a visible label keeps `--env-space-1` above it for the label, so it doesn't crowd the field above. This applies to TextField, SearchField, Select, Combobox, DatePicker, TimePicker and MonthPicker; [TextField's sizes](https://github.com/envsemble/envUI/blob/main/docs/components/text-field.md#sizes) say how.
