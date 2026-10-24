---
'@envsemble/envui': minor
---

Lists in formatted text, which Markdown, RichText and RichTextEditor render, take envUI's own markers instead of the browser's discs: a small dot in the muted text color, a ring one level in, and muted numbers in tabular figures, then letters and roman numerals for nested ordered lists. Each marker hangs in the list's indent on the middle of its item's first line, and items stand a small step apart. Custom properties on `env-prose` tune them: `--env-prose-list-marker-color`, `--env-prose-list-marker-size`, `--env-prose-list-marker-gap`, `--env-prose-list-indent` and `--env-prose-list-item-gap`. Task lists keep their checkboxes.
