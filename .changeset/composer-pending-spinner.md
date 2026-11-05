---
'@envsemble/envui': patch
---

Composer's send button shows the shared pending spinner while `pending` is set or an enclosing form's action is pending, rather than an unavailable arrow, so a send in progress reads as work under way; the field keeps its text and height and stays editable.
