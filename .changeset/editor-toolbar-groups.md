---
'@envsemble/envui': minor
---

RichTextEditor and MarkdownEditor draw their formatting toolbar as a Toolbar of ghost buttons in groups, with a line between each: text styles, lists, blocks, and links and tables, then Undo and Redo, then Attach files. Commands of one kind next to each other in `toolbar` share a group, and the default orders put inline code with the text styles. RichTextEditor's formatting buttons are toggles from the start, pressed while the formatting is on at the caret. The toolbar stays one tab stop, the arrow keys move across its groups, and it still scrolls sideways where it is wider than the editor.
