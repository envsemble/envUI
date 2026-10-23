---
'@envsemble/envui': patch
---

DatePicker, MonthPicker and TimePicker:

- The actions under a popup, Today, This month, Now and Clear, keep their labels on one line; where the popup is too narrow for them side by side, the row wraps whole buttons.
- A mouse wheel turns a time wheel one row a notch, and a touchpad as far as it scrolls, easing into place, rather than as far as a page would scroll; quick notches add up to one turn.
- Switching between AM and PM keeps the hour and minutes and moves the time by 12 hours, also while another wheel is still settling, and each choice reaches `onValueChange` once.
