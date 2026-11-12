---
'@envsemble/envui': patch
---

A drag follows the pointer on the content when a box around it scrolls, the page among them, not only the nearest one: a List or Table row lifted by its handle stays under the pointer, and a TextField's resize edge, a Table column's boundary and the resize handles of Panes, Sheet, NavigationDrawer and PanelDock move as far as the pointer moved on the content, rather than as far as it moved in the window.
