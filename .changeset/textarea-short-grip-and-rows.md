---
'@envsemble/envui': patch
---

Textarea's resize grip is a short, quiet bar on its bottom edge toward its end, just inside the frame, rather than an accent line along the whole edge that read as a second underline or a bar in the middle that read as a sheet's handle; it still shows only under the pointer, while the field has focus and while it is dragged. A fixed Textarea given `rows` is that many lines tall, also under 7.5 rem, and resizes down to them or to 7.5 rem, whichever is less; without `rows` it keeps the 7.5 rem start. MarkdownEditor's text area follows.
