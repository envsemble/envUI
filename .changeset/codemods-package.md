---
'@envsemble/envui-codemods': major
---

First release of `@envsemble/envui-codemods`, which moves an application from envUI 0.x to the 1.0 names. `envui-codemods v1-names <paths>` rewrites imports, JSX, values, types and `typeof` from `@envsemble/envui`, merges compound parts into namespace imports (`MenuItem` becomes `Menu.Item`), turns `DirectionLink` into `Pager.Previous` or `Pager.Next`, turns `<Theme theme={useTheme()}>` into `<Theme {...useTheme()}>` and every other `useTheme()` call into `useTheme().theme`, the color scheme it returned in 0.x, and reports the exports that became internal with what to use instead. `envui-codemods v1-classes <paths>` renames `env-*` classes and custom properties in style sheets, `className` values and selector strings. Both take `--dry`, `--print` and `--ignore-pattern`, and read the rename map in `src/maps/v1.json`.
