---
'@envsemble/envui': patch
---

Toasts wait while a modal Dialog, Sheet, ConfirmDialog or CommandPalette is open in the same container: those showing step back, and new ones are held, until it closes, rather than covering the modal's actions, out of reach behind it, on a phone. Each then shows and is announced, for its full duration. See [Toast](https://github.com/envsemble/envUI/blob/main/docs/components/toast.md).
