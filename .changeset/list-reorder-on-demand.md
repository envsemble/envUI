---
'@envsemble/envui': patch
---

A List loads the code that moves its rows only with `onReorder`, as it renders, so a page whose lists don't reorder no longer downloads it. A drag or key press on a handle before it has arrived waits for it and then moves the row as it would have.
