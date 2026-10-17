---
'@envsemble/envui': minor
---

Disclosure takes `defaultOpen` and `onOpenChange(open)`, which receives whether it is open each time it opens or closes, also when find in page opens it. `open` with `onOpenChange` controls it: it shows what `open` says, also when the parent leaves `open` as it is; a native `onToggle` still passes through.
