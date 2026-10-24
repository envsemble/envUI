---
'@envsemble/envui': minor
---

ColorPickerButton has no fill of its own, as fields have none: it takes the background of what it sits on, such as a card, a sheet or a dialog, instead of the field background. Its new color property, `--env-color-picker-button-container`, gives one button a fill. In RichText and RichTextEditor, code blocks and references sit on the translucent neutral fill and a selected table cell on the selection color, instead of the field background, so they follow the surface too. Customize colors describes how to give any field a fill.
