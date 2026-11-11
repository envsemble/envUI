---
'@envsemble/envui': patch
---

A Table loads the code and the style sheet of its column resize handles only with `resizableColumns`, as it renders, so a page whose tables don't resize their columns no longer downloads them. The handles show once that code has arrived, right after the table.
