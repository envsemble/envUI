---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
---

The underline field is gone: TextField, SearchField, Textarea, MarkdownEditor and RichTextEditor take `variant` `outline`, `floating` (TextField and SearchField) or `ghost`, and no longer `underline`, with its state value `data-variant="underline"` on `env-text-field-control`. The `v1-props` codemod drops `variant="underline"`, and 0.x's `variant="plain"`, so the field takes the default outline, and reports each.

Migration guide: [Fields and choice controls](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
