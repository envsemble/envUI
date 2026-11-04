---
'@envsemble/envui': patch
---

CommandPalette's search is TextField's ghost variant at the large size, kept opaque on the frosted palette with its placeholder in view, so the two share one look: the caret takes the accent color, the field shows its focus by its fill rather than a ring of its own, and under forced colors it is outlined like every field. `env-command-palette-search` is the field's root, beside `env-field` and `env-text-field`, and the input takes `env-text-field-input` beside `env-command-palette-input`.
