---
'@envsemble/envui': patch
---

In the wheels of TimePicker and of DatePicker with `granularity="minute"`, the chosen hour, minute and day period take the chosen calendar day's solid accent fill, `--env-color-bg-primary-emphasis`, rather than the selection's tint, and are pills, as the chosen day is round, so a chosen day and time look alike. A wheel with fewer values than it shows rows, such as minutes every 15, no longer loops, which showed a value at both its top and its bottom; its arrow keys still wrap around. A light fade at a wheel's edges hints that it scrolls, while every value it shows stays legible, and times outside `min` and `max` take the disabled color and are struck through rather than only faded, so they no longer look like the fade.
