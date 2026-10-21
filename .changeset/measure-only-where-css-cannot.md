---
'@envsemble/envui': patch
---

Components measure in script only where CSS can't decide, and render usably before they measure.

- CalendarHeatmap starts a narrow scroller at the most recent weeks through CSS (a reversed row, whose scroll origin is its end) instead of a ResizeObserver, so the server's markup and the first paint already show them; new data still scrolls back to them.
- CodeDiff measures its width as the diff loads, before it paints, so a wide diff no longer shows the unified layout for a frame before it splits. Split and unified are different markup, so the width stays measured.
- Tree renders 24 rows before it has measured its viewport, such as in the server's markup, so a tall tree's first paint is already full; measuring only adds rows below.
