---
'@envsemble/envui': patch
---

Markdown, RichText and RichTextEditor keep a list item's line its own height when it holds more than one key cap, such as <kbd>Ctrl</kbd>+<kbd>K</kbd>: only the blocks in an item or a quote stand a step apart now, so a second key, or another element that runs in the line, no longer takes their margin, which pushed the line, and the item's text, below its bullet.
