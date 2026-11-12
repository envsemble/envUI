---
'@envsemble/envui': patch
---

DatePicker's days and MonthPicker's months take the chosen fill and its white text at once, and a day or month the choice leaves loses both at once, so its text is never white on a fill half gone and two never read as chosen together; the hover fill still eases in and out.
