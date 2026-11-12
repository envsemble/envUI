---
'@envsemble/envui': patch
---

Skeletons draw the bars over their text faster when many are on a page at once: every skeleton's text is measured before any skeleton's bars are set, so the page is laid out once rather than once for each skeleton.
