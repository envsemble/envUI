---
'@envsemble/envui': major
---

The prop that hides a field's label is `visibleLabel`, named after the label it turns off, where it was `showLabel`: TextField, Select, Combobox, DatePicker, TimePicker, MonthPicker and ColorPicker take `visibleLabel={false}` where they took `showLabel={false}`, and it still defaults to true. Spinner's and SearchField's `showLabel`, which shows a label that is hidden by default, stay as they are.
