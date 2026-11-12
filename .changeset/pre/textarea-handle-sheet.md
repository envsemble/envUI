---
'@envsemble/envui': patch
---

The rules of a text area's resize handle, `env-textarea-resize-handle`, are in a style sheet of their own that only Textarea, Composer and MarkdownEditor bring, so a page with TextField but no text area loads a little less CSS.
