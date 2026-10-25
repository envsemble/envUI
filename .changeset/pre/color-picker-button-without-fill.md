---
'@envsemble/envui': minor
---

ColorPickerButton takes a color property, `--env-color-picker-button-container`, which gives one button a fill through `style` or CSS; without it, the button keeps no fill of its own. In RichTextEditor, a selected table cell takes the selection color, `--env-color-bg-selected`, instead of the neutral muted fill, so it reads as selected rather than as a code block or reference.
