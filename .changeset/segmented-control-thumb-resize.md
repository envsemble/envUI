---
'@envsemble/envui': patch
---

SegmentedControl's thumb travels only to a newly chosen segment: as the control resizes, such as a full-width control in a container that narrows, it stays over the chosen segment instead of easing after it, and the thumb marks a move with `data-traveling`.
