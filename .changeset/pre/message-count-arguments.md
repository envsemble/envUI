---
'@envsemble/envui': minor
---

A message whose number picks a plural form receives `count`, the number, and `countText`, the count in the locale's digits. CommandPalette's `messages.commandPalette.results` and the toasts' `messages.toast.hidden` take `countText` too, and write their counts in the locale's digits; AvatarGroup's `number` is `countText`, and DiffStat's `added` and `removed` are `additionsText` and `deletionsText`.
