---
'@envsemble/envui': patch
---

Menu, ContextMenu and Menubar menus: a Menu.Separator, and the space before a group without a heading, is a break of half a row, rather than a quarter that read as uneven spacing between rows; it still draws no line. Groups with a heading keep their spacing.
