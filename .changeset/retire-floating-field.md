---
'@envsemble/envui': major
---

The `floating` field variant is retired before 1.0. TextField and SearchField take `variant="outline"`, the default, or `"ghost"`, and `TextFieldVariant` is `'outline' | 'ghost'`; Select, Combobox, DatePicker, TimePicker and MonthPicker no longer take `variant`, as their one look is the outline. The `--env-field-floating-height` token is gone with it, as is TextField's `[data-variant='floating']`, and so is `[data-tall]` on Combobox, DatePicker and Select, which only a floating field took; Textarea, MarkdownEditor and RichTextEditor keep it. The outline field's label still rests inside and floats into a notch in the outline.

**Migration:** replace `variant="floating"` with the default outline and `size="lg"`, such as `<TextField size="lg" label="Owner" />`, and drop `variant` from Select, Combobox and the pickers, `variant="outline"` included ([TextField](https://github.com/envsemble/envUI/blob/main/docs/components/text-field.md)).
