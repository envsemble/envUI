---
'@envsemble/envui': minor
---

TimePicker, and DatePicker with `granularity="minute"`, take `hourCycle`, `h12` or `h23`, which sets the clock of the shown time and the wheels whatever the locale's: `hourCycle="h23"` shows 18:00 and hours from 00 to 23 with no AM/PM wheel, also in English. The value stays on the 24-hour clock, as `HH:mm`.
