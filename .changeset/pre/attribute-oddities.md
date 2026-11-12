---
'@envsemble/envui': major
---

Two state attributes read as the rest do: the number of buttons at the end of Combobox's, DatePicker's, TimePicker's and MonthPicker's field is `data-action-count` (`1` or `2`), where it was `data-actions`, which Card sets as a flag; and TimeList's period column is `data-part="day-period"`, in kebab case, where it was `dayPeriod`.
