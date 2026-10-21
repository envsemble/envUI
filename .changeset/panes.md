---
'@envsemble/envui': minor
---

Panes, two panes side by side after Material's pane patterns: `behavior="supporting"`, Panes.Main and Panes.Supporting, whose supporting pane is a sheet over the main one in less room while `open`, a side sheet in a medium width and a bottom sheet in a compact one, which is modal, with a close button and everything else on the page inert, the window's own inside a Scaffold whose document scrolls, and which Escape, the button and the scrim close; and `behavior="list-detail"`, Panes.List and Panes.Detail, which show one at a time in less room, with a back button. `splitAt` sets the window class of its own width from which they sit side by side, and CSS decides it. An optional Panes.Divider resizes the supporting pane or the list, in rem, by pointer and keyboard; `persist` keeps the width in a cookie, which `readPanesSize` reads on the server for `persistedSize`. `data-env-layout="panes"`, and the `env-panes` container.
