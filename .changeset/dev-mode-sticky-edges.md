---
'@envsemble/envui': patch
---

Dev mode tells when a sticky element is stuck at the bottom or the right edge, of the page as of a scroll container; it measured those edges from the wrong line, so it said such an element was stuck when it wasn't, or never said so.
