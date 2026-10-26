---
'@envsemble/envui': patch
---

Toast's notices glide from where they were drawn to their new place inside a transformed or zoomed container, such as a scaled preview of a screen: the stack measures layout pixels rather than the drawn boxes, so a notice no longer jumps part of the way, or past its place, as others arrive and leave.
