---
'@envsemble/envui': patch
---

Focus rings keep clear of their labels. A text Button's hit area and ring reach 0.25 rem past its label on each side, so the round ring no longer cuts into the first and last letters, and a negative inline margin takes that back, so its label lines up with the text around it as before (not where it fills its container with `fullWidth`). A ghost Button's ring traces the edge its state layer fills (`outline-offset: 0`), rather than floating 2 px past a shape nobody sees, so it is no larger than a filled button's.
