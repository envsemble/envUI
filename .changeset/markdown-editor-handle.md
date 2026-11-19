---
'@envsemble/envui': major
---

MarkdownEditor: `toolbarEnd` takes content, as RichTextEditor's does, and the application's buttons edit the source through `editorRef`, a `MarkdownEditorHandle` with `insert`. The type `MarkdownEditorActions`, which a `toolbarEnd` function received, is gone with that function. See [Markdown](https://github.com/envsemble/envUI/blob/main/docs/components/markdown.md).
