---
'@envsemble/envui': patch
---

`--env-motion-ease-exit` is a gentler acceleration, `cubic-bezier(0.4, 0, 1, 1)` rather than `cubic-bezier(0.3, 0, 0.8, 0.15)`, so popups, dialogs, sheets and notifications fade evenly through their exit instead of staying nearly opaque for its first half and then vanishing.
