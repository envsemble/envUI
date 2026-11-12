---
'@envsemble/envui': patch
---

Combobox's leading avatars show their initials: in the options and as the chosen option's in the field, an avatar takes the small picture size, `--env-picture-size-sm`, rather than 1.25 rem, below the size Avatar shows initials from. Where initials don't fit, in a small field at the compact scale and in a chip, an avatar of initials is left out rather than shown as a blank disc of its color; an icon, a photo or a figure stays. A read-only Combobox keeps its chevron in the field's quiet icon color, and it doesn't answer the pointer, as a read-only Select's.
