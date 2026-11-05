---
'@envsemble/envui': patch
---

Checkbox and Switch answer the pointer with a halo: under it and while pressed, the shared state layer, `--env-color-bg-neutral-subtle-pressed`, rings the box or the switch's track, checked or not, and lays itself twice while pressed, a step stronger. The halo takes no room. An unchecked box's edge also darkens to the text color, `--env-color-fg-default`, and the box stays empty, so it doesn't read as a checked box that is unavailable; a switch that is off deepens its track a step as before and its ring darkens to the muted text color, `--env-color-fg-muted`. Checked boxes and switches that are on keep their hover and pressed fills.
