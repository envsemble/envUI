---
'@envsemble/envui': patch
---

Every tone's primary button steps the same way under the pointer and while pressed: in light, the danger primary darkens a grade on hover and another on press, as the default and accent primaries do, where it lightened; in dark, the soft primary, danger and accent fills deepen by a clear, even step on hover and again on press, where their hover barely showed (`--env-color-bg-{primary,danger,accent}-emphasis-hover` and `-pressed`). A destructive outline button's edge and an invalid field's border darken on hover and press too (`--env-color-border-danger-emphasis-hover` and `-pressed`).
