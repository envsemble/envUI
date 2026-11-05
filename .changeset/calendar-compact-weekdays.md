---
'@envsemble/envui': patch
---

Where its days are narrower than 2 rem, as in a DatePicker's popup at the compact scale, a Calendar names the weekdays by their first two letters, Mo Tu We in English, where those tell the seven apart, else by the locale's narrow names where those do, so the names no longer run into each other; wider days keep the short names, and each column's header still carries the full name. The names are `env-calendar-weekday` and `env-calendar-weekday-compact`.
