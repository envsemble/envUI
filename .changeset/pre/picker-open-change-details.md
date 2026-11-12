---
'@envsemble/envui': minor
---

Combobox, DatePicker, TimePicker and MonthPicker pass `onOpenChange` a second argument, why the popup opens or closes, as the overlays do: `ComboboxOpenChangeDetails`, whose `reason` is one of the combobox's, such as `input-change` or `item-press`, and `PickerOpenChangeDetails`, whose `reason` is a popover's or `list-navigation`, `item-press` or `clear-press`.
