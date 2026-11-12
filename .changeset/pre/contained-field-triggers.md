---
'@envsemble/envui': patch
---

In a contained PortalContainer, a Combobox's text field and a DatePicker's, TimePicker's or MonthPicker's field close their popup as other overlays' triggers do: Esc in the field closes it, and so does focus leaving a Combobox's field, where both used to leave it open.
