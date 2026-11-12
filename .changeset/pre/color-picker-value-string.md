---
'@envsemble/envui': minor
---

ColorPicker's and ColorPickerButton's `onValueChange` receives the color's string in `valueFormat` alone, without React Aria's `Color` as a second argument, so a major release of React Aria's color packages needs none of envUI's. `value` and `defaultValue` still take a `Color`, and the picker keeps the hue of a gray itself.
