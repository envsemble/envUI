---
'@envsemble/envui': patch
---

SegmentedControl: under the pointer a segment not chosen takes no layer, only the text color on its label, and pressed only the faint neutral pressed layer, `--env-color-bg-neutral-subtle-pressed`, with a muted label, so only the thumb reads as chosen and hover never looks like a second selection, in the dark theme too. In dark the thumb is the raised neutral grade, `--env-color-bg-neutral-strong-hover`, opaque and clearly lighter than the track and a hovered segment; at high contrast it keeps a layer of the neutral fill.
