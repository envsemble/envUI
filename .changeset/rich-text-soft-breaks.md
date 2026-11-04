---
'@envsemble/envui': patch
---

RichText shows a line break within a paragraph, a single newline in the Markdown, as a new line, and keeps runs of spaces, as RichTextEditor shows them, rather than joining the lines, so saved text reads as it was written, such as a line that starts after a reference.
