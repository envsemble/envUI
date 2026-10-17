---
'@envsemble/envui-codemods': major
---

`envui-codemods v1-props <paths>` moves the props 1.0 removed or changed, from the new `props` section of the rename map: `density`, `compact` and size-as-density become sizes, row densities or nothing. `<Select density="compact">` becomes `size="sm"`, `<Table.Root density="compact">` `density="sm"`, `<Tree density="standard">` `density="md"`, `<Tabs size="compact">` `size="sm"`, `<TextField compact>` `showLabel={false}`, `compact={false}` `variant="floating"`, and `<DropZone compact>` `size="sm"`. Removed props without a replacement, such as Surface's and the menus' `density` or NavList.Item's `size`, are dropped with a report that suggests `scale="compact"` on a Theme or `size="sm"`; a value it can't read, such as an expression, stays and is reported. It recognises elements under their 0.x and 1.0 names, so it runs before or after `v1-names`.

Migration guide: [Upgrade from envUI 0.x to 1.0](../../docs/migration.md#upgrade-from-envui-0x-to-10).
