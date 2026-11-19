---
'@envsemble/envui': minor
---

Dialog: `actionsStart` puts content at the start of the actions' row, such as a destructive Delete, a Learn more link or a Don't show again checkbox; `headerStart` and `headerEnd` put content before the title and at the end of its row, such as a back button or a Menu. `closeButton` moves the built-in close button to the heading, as an IconButton with a cross as on a Sheet, with `'heading'`, or leaves it out with `'none'` for a dialog that places its own DialogClose. `title` is optional where `aria-label` or `aria-labelledby` names the dialog, such as an image viewer. The new `useDialogPending` hook gives any action component of the application's own the dialog's or sheet's pending state, where the last action isn't a plain Button. See [Dialog](https://github.com/envsemble/envUI/blob/main/docs/components/dialog.md).
