---
'@envsemble/envui': patch
---

Avatar's initials stay legible at small sizes: at least the caption size, rather than 0.38 of the avatar, which fell to about 9 px at `sm`. An avatar smaller than `sm`, such as one sized to a dense row, shows its color alone, without initials.
