---
'@envsemble/envui': patch
---

Every pending Button and IconButton takes one model: a spinner the size of an icon turns centred over the button, in the label's color, while the label and icons stay in place, transparent, so the button keeps its width, its centred label's place and its accessible name. This replaces a small spinner squeezed into the padding beside a visible label, which read as a stray mark and set the label off centre; an underlined text button drops its underline while pending.
