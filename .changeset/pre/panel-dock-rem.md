---
'@envsemble/envui': minor
---

PanelDock's sizes are in rem, as Sheet's, NavigationDrawer's and Panes' are: a panel's `height`, `preferredWidth`, `minWidth`, `maxWidth`, `minHeight` and `maxHeight`, and the height `onHeightChange` reports, were pixels; divide them by 16, so `{ minWidth: 320 }` is `{ minWidth: 20 }`. A number for `stackBelow`, on PanelDock and Table, is rem too, where it was pixels; a CSS length works as before.
