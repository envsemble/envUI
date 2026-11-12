---
'@envsemble/envui': minor
---

Tree and table rows under the pointer take a state layer of their own, `--env-color-bg-row-hover` and `--env-color-bg-row-pressed`: a clear layer over the row's surface, in dark too, and a step below the selection, so the selected row always reads strongest. In dark, `--env-color-fg-link-on-muted` and its hover and pressed values are a grade lighter, so a link in a hovered or pressed row keeps 4.5:1. High contrast keeps its row states.
