---
'@envsemble/envui': patch
---

Text breaks inside a word only where the word is longer than its line: themes and components wrap with `overflow-wrap: break-word` in place of `anywhere`, so a table column, a cell or a button keeps room for its longest word, and short words such as a project's name no longer split at narrow widths. Code keeps breaking anywhere. A Link takes the wrapping of the text around it, so it stays on one line in a `nowrap` table cell.
