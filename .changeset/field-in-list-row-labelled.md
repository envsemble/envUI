---
'@envsemble/eslint-plugin-envui': minor
---

`no-field-in-list-row` reports only a field with no `label`, `aria-label` or `aria-labelledby` in a `List.Item`'s `control` or `end`, and lets a Radio be a row's `control`, which the row names and describes, as it does a Switch or a Checkbox. A settings row that ends in a labelled field, such as `<Select label="Theme" />` or `<SegmentedControl aria-label="View" />`, now passes; a Radio with no label in a row's `end`, and an unlabelled RadioGroup in either, are still reported. See [no-field-in-list-row](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-field-in-list-row).
