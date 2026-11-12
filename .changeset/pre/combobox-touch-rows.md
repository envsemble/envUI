---
'@envsemble/envui': patch
---

On touch screens, Combobox's wrapped rows of chips lie a small step apart (0.5rem) instead of a touch height apart, so a field with several chips no longer spreads them far down. Each chip's remove button reaches its neighbours' with a hit area as tall as a row and its gap (2.25rem, well past the 24 px minimum), so the hit areas of neighbouring rows meet without overlapping.
