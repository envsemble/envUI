---
'@envsemble/envui': minor
'@envsemble/envui-codemods': minor
---

CalendarHeatmap's `formatTooltip` is `renderTooltip`: it returns content, as Markdown's `renderLink` does, while every `format*` callback returns text. `v1-props` renames it.
