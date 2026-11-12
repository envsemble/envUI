---
'@envsemble/envui': major
---

Stat.Root's `detail` is `description`, and Stat.Group's `tone` is `background`.

- `detail` is `description`, and its class `env-stat-detail` is `env-stat-description`.
- Stat.Group's `tone` is `background`, as Surface's: `pane` is `default`, the default, `row` is `muted`, `canvas` is `page` and `alternate` is `raised`.

Migrate with the codemods: `envui-codemods v1-props` renames both props and maps the values, and `v1-classes` renames the class.

Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
