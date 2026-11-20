---
'@envsemble/envui': major
---

DatePicker, TimePicker, MonthPicker and Menubar.Menu name what their `onOpenChange` receives the way every other overlay does: `DatePickerOpenChangeDetails`, `TimePickerOpenChangeDetails` and `MonthPickerOpenChangeDetails`, with their `…OpenChangeReason` types, and `Menubar.OpenChangeDetails`. The details themselves are the same.

Breaking changes:

- `PickerOpenChangeDetails` and `PickerOpenChangeReason` are no longer exported: write `DatePickerOpenChangeDetails` and `DatePickerOpenChangeReason`, or the TimePicker or MonthPicker ones.
- `Menubar.MenuFocusDetails` is renamed: write `Menubar.OpenChangeDetails`.
