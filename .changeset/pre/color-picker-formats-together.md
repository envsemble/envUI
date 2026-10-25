---
'@envsemble/envui': major
---

ColorPicker's `formats` with two or more formats shows them at once, instead of limiting the format menu to them as in 1.0.0-prerelease.2: `formats={['hex', 'rgb', 'hsl']}` shows each format's fields on a row of its own, in that order, with a copy button of its own, all editing the same color, their letters and numbers lined up from row to row. Each row is a group named after its format, and its copy button takes the new `messages.colorPicker.copyFormat`, such as Copy color as RGB. With one format, or without `formats`, the picker shows one format at a time as before, and the format menu stays the default. ColorPickerButton passes `formats` to its picker too.

To migrate, check each ColorPicker and ColorPickerButton with two or more `formats`: keep them to show those formats together, or remove `formats` to keep one format at a time with the menu, which then offers hex, RGB and HSL. A menu of only some formats is gone; to offer one format, pass it alone, such as `formats={['hex']}`.
