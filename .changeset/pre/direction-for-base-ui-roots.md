---
'@envsemble/envui': patch
---

The arrow keys of SegmentedControl, Tabs, Menubar and the Markdown and rich text editors' toolbars follow the text direction in a right-to-left region without an `EnvUIProvider` `dir`, as Toolbar's do: each reads the direction at its element, from `dir` attributes and CSS, and tells Base UI. Before, they ran left to right there.
