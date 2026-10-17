---
'@envsemble/envui': major
---

PanelDock.Root's `showLabel`, the function that names a tab's button, is `openLabel`, as SidebarTrigger's `openLabel` names the button that opens a sidebar; a field's `showLabel` stays a boolean.

Migrate with the codemods: `envui-codemods v1-props` renames `showLabel` to `openLabel` on PanelDock.Root.

Migration guide: [Shell, dock, editors and code](../../docs/migration.md#shell-dock-editors-and-code).
