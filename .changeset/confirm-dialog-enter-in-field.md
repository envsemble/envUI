---
'@envsemble/envui': patch
---

ConfirmDialog: Enter in a field in its content, such as a typed name, now confirms through `onConfirm` as the confirm button does, with the same pending state, run-once guard and error. The dialog's content and actions sit in a form whose submit button is the confirm button; the form lays out as if it weren't there and its submit doesn't reach a form around the dialog.
