---
'@envsemble/envui': major
---

A Combobox option takes its content before the label, such as an Avatar, as `start`, as List.Item does, where it was `leading`.

Migrate with the codemods: `envui-codemods v1-props` renames `leading` to `start` in an array written in `items`, also in a group's `items`, and reports items it can't read, such as a variable; TypeScript points at the rest.

Migration guide: [Fields and choice controls](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
