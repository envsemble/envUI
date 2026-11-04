---
'@envsemble/envui': patch
---

TableOfContents' bulge stays whole at the list's ends: at the first or last section it is drawn smaller and a little toward the middle, so it tapers before the shape ends instead of being cut off into a drip. The shape runs a little past the first and last sections, into room the list now leaves above and below them, `--env-table-of-contents-room`, `--env-space-4` by default.
