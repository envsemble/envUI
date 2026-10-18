---
'@envsemble/envui': minor
---

`DocumentTabs` gains three things:

- `onReorder`: a tab dragged with a mouse or pen dims in place while a copy of it follows the pointer and a line marks the gap it will drop into; letting go moves it there and <kbd>Esc</kbd> cancels. Each tab's context menu offers Move left and Move right (`messages.documentTabs.moveLeft` and `moveRight`), which the keyboard and touch reach too.
- `end`: content after the tabs, outside the strip that scrolls and on its hairline, such as a button that opens a document or closes them all. The hairline and height move from the strip to the new `env-document-tabs-bar` around it.
- Tabs that run past an edge of the strip fade out toward it, and the active tab scrolls clear of the fade.
