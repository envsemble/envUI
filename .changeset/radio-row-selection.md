---
'@envsemble/envui': patch
---

The chosen row of a RadioGroup with `orientation="vertical"` takes the selection's fill and text, `--env-color-bg-selected` and `--env-color-fg-on-selected`, with the selected hover and pressed fills, as a selected list row and Select's chosen option do, rather than the hover fill among the other rows. Its description stays muted; a Radio's own color properties still apply.
