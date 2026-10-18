---
'@envsemble/envui': patch
---

A controlled Disclosure no longer shows its details for a frame when the parent refuses the change: a click or key on the summary asks through `onOpenChange` and leaves the element as `open` says. An uncontrolled Disclosure keeps the native behaviour, and a link or button inside the summary still takes its own click.
