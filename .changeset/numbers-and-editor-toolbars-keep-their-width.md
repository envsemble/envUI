---
'@envsemble/envui': patch
---

Numbers and editor toolbars keep their width in narrow places.

- A Table cell with `numeric` no longer breaks a number at its separators, such as `$4,687.50` after the comma: where the columns keep their widths, the column stays as wide as its numbers and the region scrolls.
- The formatting toolbar of MarkdownEditor and RichTextEditor sizes its row of buttons to the buttons, so where they don't fit, the toolbar scrolls the whole row rather than the buttons spilling out of it.
