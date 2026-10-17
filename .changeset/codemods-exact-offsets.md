---
'@envsemble/envui-codemods': patch
---

`v1-classes` and `v1-render` find the text they replace by offsets in the file as it is: in a file indented with tabs, after a U+2028 or U+2029, and on the first line after a byte order mark, `v1-render` no longer writes `render` in the wrong place, and `v1-classes` no longer leaves the classes in tab-indented literals unchanged.
