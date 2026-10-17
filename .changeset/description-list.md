---
'@envsemble/envui': minor
---

New: `DescriptionList`, the facts about one thing as labels and their values. `DescriptionList.Root` is a `dl` with `layout` `auto` (labels beside their values, above them below 24 rem of the list's own width, the default), `inline` or `stacked`, `size` `sm` (the default) or `md`, and `controls` for values that are small controls. Each `DescriptionList.Item` is a `div` around its `label` as the `dt` and its children as the `dd`.
