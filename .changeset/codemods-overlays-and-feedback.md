---
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': patch
---

The rename map covers Dialog, Drawer, Popover, HoverCard, Toast, CommandPalette, Alert, EmptyState, Spinner and Meter: `v1-structure` turns `<Dialog placement="right">` into `<Drawer side="end">`; `v1-props` moves `tone="error"`, `size`, `width`, the CommandPalette props and the objects of `useToast().show` through the `calls` section; `v1-names` renames `ToastVariant` and `CommandPaletteSelectOptions`; `v1-classes` renames `env-modal-pane`, `env-bar`, `env-empty-copy` and the toast, spinner and empty-state modifier classes. The ESLint plugin's `no-renamed-exports` knows the renamed types.
