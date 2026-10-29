---
'@envsemble/envui-codemods': minor
---

A new codemod, `v1-entries`, imports the exports that moved to another entry point from it: ColorPicker, ColorSwatch, ColorPickerProps and ColorSwatchProps, from `@envsemble/envui/color`. It moves named imports and re-exports, into the file's import of the new entry point where it has one, keeps local names and `type`, and reports a use through a namespace import, such as `<ui.ColorPicker>`. It runs after `v1-props`, which now drops ColorPicker's `variant` and reports its `ref`, which reaches the picker's root. The rename map has a `moved` section for such exports.

Migration guide: [Color picker and swatches](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
