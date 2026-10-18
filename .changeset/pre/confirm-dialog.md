---
'@envsemble/envui': minor
---

ConfirmDialog, an alert dialog that asks people to confirm an action whose consequence needs a sentence: a `title` that asks the question, a `description`, Cancel (`cancelLabel`, from `messages.confirmDialog.cancel`) and a confirm button named by `confirmLabel`. `tone="danger"` makes the confirm button a danger one and starts focus on Cancel; a neutral confirmation starts on the confirm button. `onConfirm` runs the action: when it returns a promise, the confirm button is pending and nothing dismisses the dialog until it resolves, and a rejection keeps the dialog open, with `error` shown as an announced danger Alert. It opens from `trigger`, or from `open` and `onOpenChange`, and `finalFocus` returns focus to the control that opened it, such as a menu's button.
