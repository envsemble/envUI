---
'@envsemble/envui': major
---

DocumentTabs: a tab carries its item's `value` in `data-value`, the attribute named after that prop, and `onClose`, `onPin` and `onReorder` name what they receive `value` and `values`. See [DocumentTabs](https://github.com/envsemble/envUI/blob/main/docs/components/document-tabs.md).

Breaking changes:

- The state `data-tab-id` on `env-document-tabs-tab` is now `data-value`: select a tab with `.env-document-tabs-tab[data-value="…"]`.
