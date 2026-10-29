---
'@envsemble/envui': minor
---

CalendarHeatmap's `formatTooltip` is `renderTooltip`: it returns content, as Markdown's `renderLink` does, while every `format*` callback returns text.
