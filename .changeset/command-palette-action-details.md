---
'@envsemble/envui': minor
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': minor
---

`CommandPaletteActionOptions`, the second argument of CommandPalette's `onAction`, is `CommandPaletteActionDetails`, as every callback's extra argument is named. `v1-names` writes it for 0.x's `CommandPaletteSelectOptions`, and `envui/no-renamed-exports` names it.
