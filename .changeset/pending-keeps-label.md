---
'@envsemble/envui': patch
---

A pending Button keeps its label, in its full color so it keeps its contrast on the fill, with a small spinner before it, rather than a spinner alone over a hidden label, so people still see which action is running. The spinner takes a start icon's place, and the button keeps its width; without a start icon, the spinner stands before the label, in room the padding gives up, so the button keeps its width there too. An IconButton's spinner still takes its icon's place.
