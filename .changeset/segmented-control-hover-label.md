---
'@envsemble/envui': patch
---

SegmentedControl: a segment not chosen keeps its muted label under the pointer and pressed, with only the faint neutral state layer, `--env-color-bg-neutral-subtle-hover` and `-pressed`, so only the thumb reads as chosen, in the dark theme too. In dark the thumb is the neutral fill's lighter grade, `--env-color-bg-neutral-muted-hover`, over the track, so it stands clearly apart from it.
