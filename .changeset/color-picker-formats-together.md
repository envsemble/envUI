---
'@envsemble/envui': minor
---

ColorPicker shows several formats at once: `formats={['hex', 'rgb', 'hsl']}` shows each format's fields on a row of its own, in that order, with a copy button of its own, all editing the same color, their letters and numbers lined up from row to row. Each row is a group named after its format, and its copy button takes the new `messages.colorPicker.copyFormat`, such as Copy color as RGB. With one format, or without `formats`, the picker shows one format at a time as before, and the format menu stays the default. Before, `formats` with two or more formats listed them in the format menu; ColorPickerButton passes `formats` to its picker too.
