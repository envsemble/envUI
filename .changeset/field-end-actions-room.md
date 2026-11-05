---
'@envsemble/envui': patch
---

A field's two end actions, the clear button before a Combobox's chevron or a DatePicker's, TimePicker's or MonthPicker's icon, stand `--env-space-1` apart, so they no longer crowd each other in a small field. Beside a multiple Combobox's chips, which each have a cross, the clear button shows under a fine pointer only while the field is under it or has focus, keeping its room so nothing moves, and always under a coarse pointer; it stays in the accessibility tree and in reach of the keyboard. A chip's cross is a little smaller, 0.75 rem, so it reads as the chip's.
