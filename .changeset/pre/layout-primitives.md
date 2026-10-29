---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': patch
---

Row, Column, Grid and Box, the layout primitives, replace Stack: thin wrappers over flex and grid that size to their content and never paint.

- `<Stack direction="row">` is `<Row>`, with `wrap`, and any other Stack a `<Column>`; `gap`, `padding`, `align` and `justify` take Stack's values, the gap and the padding as steps of the spacing scale. Row and Column have no gap of their own, where Stack's was 1 rem.
- Grid lays content out in columns: `columns={3}` for three equal columns, a template such as `columns="minmax(0, 2fr) minmax(0, 1fr)"`, or `columns={{ min: '14rem' }}` for as many as fit. Box is a plain block for `padding`, a named size container (`container`) or a named region.
- Each renders `data-env-layout` (`box`, `row`, `column` or `grid`), `name` as `data-env-name`, and its options as attributes such as `data-gap`, and takes `render`, `className` and `ref`. Its rules have no specificity, so any class overrides them; the `env-stack` class and `StackProps` are gone.
- The `v1-stack` codemod rewrites each Stack, after `v1-structure` and `v1-render`, and reports a `direction` that is an expression. `envui/no-renamed-exports` no longer reports `Row` and `RowProps`, 0.x's list row, as 1.0 exports `Row` again.

Migration guide: [Layout primitives](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
