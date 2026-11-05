---
'@envsemble/envui': patch
---

SegmentedControl: a segment not chosen keeps its muted label under the pointer and pressed, with only the faint neutral state layer, `--env-color-bg-neutral-subtle-hover` and `-pressed`, so only the thumb reads as chosen, in the dark theme too. In dark the thumb is the raised neutral grade, `--env-color-bg-neutral-strong-hover`, opaque and clearly lighter than the track and a hovered segment; at high contrast it keeps a layer of the neutral fill.
