---
'@envsemble/envui': minor
---

Fields are rounded rectangles rather than pills: TextField, SearchField, Select, Combobox, DatePicker, TimePicker, MonthPicker and Field.Control take a text area's large corner, `--env-radius-lg`, no more than a third of the field's height, so a small field still reads as a rectangle. They stay as tall as a button of their size, so a row of fields and buttons still lines up, and buttons keep their round ends. The notched label is unchanged: the outline runs level into the notch past the corner. A ghost field takes the same corners, so a row of outline and ghost fields shares one corner; the command palette's search stays a pill. An editable ghost field shows a faint fill at rest, half the neutral fill, so a labelled one no longer reads as a label and its value; a read-only or disabled one has none, and doesn't answer the pointer.
