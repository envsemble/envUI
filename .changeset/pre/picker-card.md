---
'@envsemble/envui': patch
---

DatePicker, TimePicker and MonthPicker open one picker card, with the same inset, corners, gaps and footer: TimePicker's popup takes DatePicker's spacing, so Now and Clear no longer sit at its edges, and the actions of all three line up with the body, the shortcut at the start and Clear at the end. The card's parts are `env-picker-popup`, `env-picker-popup-body`, `env-picker-popup-footer` and `env-picker-popup-footer-end`; the popups keep `env-date-picker-popup`, `env-time-picker-popup`, `env-month-picker-popup`, `env-date-picker-actions` and `env-date-picker-actions-end` beside them.
