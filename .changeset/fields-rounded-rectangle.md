---
'@envsemble/envui': minor
---

Fields are rounded rectangles rather than pills: TextField, SearchField, Select, Combobox, DatePicker, TimePicker, MonthPicker and Field.Control take a text area's large corner, `--env-radius-lg`, no more than a third of the field's height, so a small field still reads as a rectangle. They stay as tall as a button of their size, so a row of fields and buttons still lines up, and buttons keep their round ends. The notched label is unchanged: the outline runs level into the notch past the corner. A ghost field keeps its round ends, as the ghost buttons it sits among have, and so does the command palette's search.
