---
'@envsemble/envui': patch
---

MonthPicker's grid names its months at one length where the locale makes nearly all of them that long, such as Sep rather than Sept among en-GB's three-letter months; names with punctuation or digits, and locales whose names vary in length, keep the locale's own. Each month's accessible name is unchanged.
