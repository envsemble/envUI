---
'@envsemble/envui-codemods': major
---

First release of `@envsemble/envui-codemods`, which moves an application from envUI 0.x to the 1.0 names. `envui-codemods v1-names <paths>` rewrites imports, JSX, values, types and `typeof` from `@envsemble/envui`, merges compound parts into namespace imports (`MenuItem` becomes `Menu.Item`), turns `DirectionLink` into `Pager.Previous` or `Pager.Next`, turns `<Theme theme={useTheme()}>` into `<Theme {...useTheme()}>` and other `useTheme()` calls into `useTheme().theme`, the color scheme they returned in 0.x, unless the file already reads them as `{ theme, contrast }`, and reports the exports that became internal with what to use instead, a `useTheme()` call that is returned or passed to a context, and each `require()` or `import()` of envUI, which it does not follow. The codemods are meant for 0.x code, run once. `envui-codemods v1-classes <paths>` renames `env-*` classes and custom properties in style sheets, `className` values and selector strings. Both take `--dry`, `--print` and `--ignore-pattern`, and read the rename map in `src/maps/v1.json`.

Migration guide: [Upgrade from envUI 0.x to 1.0](https://github.com/envsemble/envUI/blob/main/docs/migration.md#upgrade-from-envui-0x-to-10).
