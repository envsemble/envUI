---
'@envsemble/envui': patch
---

A disabled Menu item's label takes the disabled text color, `--env-color-fg-disabled`, as a disabled button's does, rather than the muted color of its description, so an unavailable command no longer reads like the explanatory text beneath it; the description stays muted and readable.
