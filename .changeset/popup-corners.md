---
'@envsemble/envui': patch
---

Popups take a corner of their own, concentric with their rows, half the md control height (20 px, 16 px at the compact scale), rather than a surface's 28 px and 22 px, so a popup is only a step rounder than the field or button that opens it: popovers, hover cards, ColorPickerButton's popover and the DatePicker, MonthPicker and TimePicker popups, as menus and the Select and Combobox lists already were. Dialogs, sheets and the command palette keep a surface's corner, and the frosted fill is unchanged.
