---
'@envsemble/envui': patch
---

CommandPalette's search field draws no focus ring: it holds the caret the whole time the palette is open, so a ring there never says anything. It keeps its edge, and the options and the palette's buttons keep their rings for keyboard focus.
