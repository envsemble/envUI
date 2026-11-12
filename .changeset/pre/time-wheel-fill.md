---
'@envsemble/envui': patch
---

TimePicker's and DatePicker's time wheels keep the fill on the row they turn to, rather than passing it over the rows on the way, and a row's text takes the fill's color only while it is on the fill, so a value the fill leaves is never white on the popup; the field shows the new time once the wheel comes to rest.
