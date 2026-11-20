---
'@envsemble/envui': major
---

MarkdownEditor is removed. An editor's storage format, toolbar, link picking and uploads are the application's decisions, so the editor is the application's own. `@envsemble/envui/markdown` keeps Markdown, which shows what was written in envUI's typography.

Breaking changes:

- `MarkdownEditor` is removed from `@envsemble/envui/markdown`, with the types `MarkdownEditorProps`, `MarkdownEditorActions`, `MarkdownEditorMode`, `MarkdownCommand`, `MarkdownLink` and `MarkdownLinkRequest`, the `markdownEditor`, `editor` and `linkDialog` messages, the parts `env-markdown-editor`, `env-markdown-editor-input`, `env-markdown-editor-view`, `env-markdown-editor-views` and `env-markdown-editor-write`, and the editor toolbar's `env-editor-toolbar` and `env-editor-status`. Write Markdown in a [Textarea](https://github.com/envsemble/envUI/blob/main/docs/components/text-field.md), or the application's own editor, and show it with [Markdown](https://github.com/envsemble/envUI/blob/main/docs/components/markdown.md), such as a SegmentedControl that switches between the two.
