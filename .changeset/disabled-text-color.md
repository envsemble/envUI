---
'@envsemble/envui': minor
---

`--env-color-fg-disabled`, the label and value of a disabled control: quieter than muted text yet readable, in every theme. A disabled Button and TextField no longer fade as a whole, which left their text hard to read in dark: the label, value and icons take the disabled color, and the shape quiets more than the text, a filled button to half the secondary's neutral fill, an outline button and a field's outline to the muted border. Under forced colors they keep `GrayText`.
