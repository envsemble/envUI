---
'@envsemble/envui': patch
---

A Table.Cell whose props are unchanged, such as one holding text, renders nothing again when its row renders, so a table whose rows an application renders anew changes only the cells whose values changed: changing one row of a 1,000-row table takes about a quarter less of React's time.
