---
'@envsemble/envui': patch
---

In the wheels of TimePicker and of DatePicker with `granularity="minute"`, the chosen hour, minute and day period take the chosen calendar day's solid accent fill, `--env-color-bg-primary-emphasis`, rather than the selection's tint, so a chosen day and time look alike. A wheel with fewer values than it shows rows, such as minutes every 15, no longer loops, which showed a value at both its top and its bottom; its arrow keys still wrap around.
