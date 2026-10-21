---
'@envsemble/envui': patch
---

Components measure in script only where CSS can't decide, and render usably before they measure.

- CalendarHeatmap starts a narrow scroller at the most recent weeks through CSS (a reversed row, whose scroll origin is its end) instead of a ResizeObserver, so the server's markup and the first paint already show them; new data still scrolls back to them.
