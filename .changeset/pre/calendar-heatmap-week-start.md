---
'@envsemble/envui': minor
---

CalendarHeatmap's weeks start on the locale's first day, as Calendar's and DatePicker's do, and `weekStart` takes any `Weekday`, 0 to 6. They started on Sunday: pass `weekStart={0}` to keep that. CalendarHeatmap reads dates with Calendar's parser, so a date that doesn't exist, such as 2026-02-31, is left out and reported while developing, where it moved to the next month.
