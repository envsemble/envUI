---
'@envsemble/envui': patch
---

RichTextEditor's code blocks keep their lines and scroll sideways, as the document's style says: the editor no longer has Tiptap add ProseMirror's base styles in a style element outside any cascade layer, where they won; envUI's style sheet holds them in its layer, so an application's CSS overrides them too.
