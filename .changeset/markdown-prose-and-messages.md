---
'@envsemble/envui': major
---

Markdown names its table regions and task checkboxes from EnvUIProvider's `messages.markdown`: a table is named after its caption, else the heading before it (`tableNamed`, "Prices table"), else `table` ("Table"), numbered where several share a name. Words in a table cell, inline code included, break only where they would overflow the cell, so a column keeps room for its longest word and the table's region scrolls instead; `Code` takes the hook `--env-code-overflow-wrap` for this.

The prose typography that Markdown, RichText and RichTextEditor's document share is the `env-prose` class: Markdown's root is `env-markdown env-prose`, and RichText's root and the editor's document no longer carry `env-markdown`. Select them by `env-prose`, or by their own `env-rich-text` and `env-rich-text-document`.

Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).
