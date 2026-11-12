---
'@envsemble/envui': patch
---

`readPanesWidth`, and Panes under `persist`, treat a kept width that is no valid encoding, such as a cookie value with a stray `%`, as no width kept, rather than throwing.
