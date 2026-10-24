---
'@envsemble/envui': minor
---

Text fields have no fill of their own: TextField, SearchField, Textarea, Combobox, the date and time pickers, MarkdownEditor, RichTextEditor and Field.Control take the background of what they sit on, such as a card, a sheet or a dialog, in every theme, and keep their hover, focus and invalid borders. The border is a new part, `env-text-field-border`, a fieldset over the well's edge whose legend opens a notch behind the floated label, right to left too, so the label needs no fill to hide the line. A focused field's floated label takes the accent's text color, `--env-color-fg-accent`, which keeps 4.5:1 on every surface. `--env-text-field-container` still gives one field a fill. In RichTextEditor, code blocks, a selected table cell and references take the neutral muted fill, `--env-color-bg-neutral-muted`, as inline code does, and ColorPickerButton has no fill either.
