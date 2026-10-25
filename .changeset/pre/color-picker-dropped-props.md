---
'@envsemble/envui-codemods': patch
---

`v1-props` reports the TextField props that the old ColorPicker passed to its HEX field and the new one doesn't take, or takes elsewhere: `required`, `size`, `autoComplete`, `autoFocus`, `startIcon`, `endAction`, `prefix`, `suffix`, and `onFocus` and `onBlur`, which run on the picker's root now. The migration guide lists what replaces each.
