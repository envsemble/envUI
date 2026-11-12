---
'@envsemble/envui': patch
---

A multiple Combobox stays one row tall while its chips fit there: beside chips, the input is as wide as its text and takes what the chips leave of the row, and moves to a row of its own only once its text no longer fits, rather than whenever less than 4 rem was left. Where the browser can't size an input to its text, it keeps the 4 rem.
