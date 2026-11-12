---
'@envsemble/envui': patch
---

A popup that held focus, such as a select's list, a menu, a popover or the calendar of a date picker, gives focus back to its trigger as it starts to close rather than once it has faded out, so a key pressed meanwhile, such as Enter to open it again, reaches the trigger instead of being lost in the closing popup. A date, time or month picker opened again while its popup still fades out shows it afresh, the calendar at the value with focus on the chosen day.
