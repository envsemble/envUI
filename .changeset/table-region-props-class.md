---
'@envsemble/envui': major
---

Table.Root's scroll region takes its class through `regionProps`, with its style, ref, data attributes and listeners, so the region has one way to set each. See [Table](https://github.com/envsemble/envUI/blob/main/docs/components/table.md).

Breaking changes:

- Table.Root's `regionClassName` is removed: write `regionProps={{ className }}`.
