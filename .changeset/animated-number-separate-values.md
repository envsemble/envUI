---
'@envsemble/envui': patch
---

AnimatedNumber: the value it changed from leaves before the new one arrives, so the two never read over each other; they roll a whole line inside the number's box, and where the new value is wider or narrower the box eases to its width, so the words after it move rather than jump.
