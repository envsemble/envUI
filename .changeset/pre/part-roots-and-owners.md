---
'@envsemble/envui': major
---

Every component's root is `env-<component>`, and every part sits under its owner:

- Dialog, ConfirmDialog and Sheet: the popup is `env-dialog` or `env-sheet`, which were `env-dialog-popup` and `env-sheet-popup`.
- Textarea's root takes `env-textarea` too, beside `env-field` and `env-text-field`.
- DocumentTabs: the root, `env-document-tabs`, is the bar that holds the strip and the end content, and takes `className`, `style` and `ref`, which reached the strip before. The strip, the tab list, is `env-document-tabs-list`; `env-document-tabs-root` and `env-document-tabs-bar` are gone.
- MarkdownEditor's source text area, `env-markdown-source`, is `env-markdown-editor-input`, which
