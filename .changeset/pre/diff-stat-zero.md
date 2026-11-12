---
'@envsemble/envui': patch
---

DiffStat leaves out a side that is 0, so a change that only adds reads +40 rather than +40 −0; with nothing on either side it still shows both.
