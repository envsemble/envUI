---
'@envsemble/envui': major
---

RichTextEditor and RichText are removed, with the entry point `@envsemble/envui/rich-text`. An editor's storage format, schema, mentions and uploads are the application's decisions, so the editor is the application's own, built on the editor library it chooses.

Breaking changes:

- `@envsemble/envui/rich-text` is removed, with `RichTextEditor`, `RichText`, `createRichTextExtensions`, the types `RichTextEditorProps`, `RichTextEditorHandle`, `RichTextProps`, `RichTextReference`, `RichTextReferenceSource`, `RichTextRenderOptions`, `RichTextAttachment`, `RichTextCommand`, `RichTextSlashCommand`, `RichTextSuggestionContent` and `RichTextLinkEvent`, the `MarkdownLink` and `MarkdownLinkRequest` types this entry point also exported, and the `richText` messages. The parts go with them: RichText's `env-rich-text`, `env-rich-text-document`, `env-rich-text-reference`, `env-rich-text-suggestions`, `env-rich-text-suggestions-positioner`, `env-rich-text-task`, `env-rich-text-task-check` and `env-rich-text-task-content`, with the states `data-checked` (`true`, `false`) and `data-reference-id`; RichTextEditor's `env-rich-text-editor`, `env-rich-text-editor-content`, `env-rich-text-editor-control` and `env-rich-text-editor-footer`, with the states `data-disabled`, `data-invalid` and `data-readonly`; and the suggestion list's `env-listbox`, `env-listbox-options` and `env-listbox-empty`. Build the editor on Tiptap or another editor library in the application, and drop the Tiptap and `marked` packages if nothing else needs them. Show saved Markdown read-only with [Markdown](https://github.com/envsemble/envUI/blob/main/docs/components/markdown.md), and take plain text on several lines with Textarea.
