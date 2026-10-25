---
'@envsemble/envui': patch
---

PanelDock's minimized tabs float over the bottom edge of the dock instead of taking a strip of their own, so minimizing or bringing back a panel no longer moves the open ones. Open panels reach the dock's bottom, and their room for `height` and `maxHeight` is the dock's height below the gutter. Their content keeps the tabs' height clear at its end, with scroll padding to match, so its last lines and actions scroll out from beneath the tabs; content that fills the panel ends above them.
