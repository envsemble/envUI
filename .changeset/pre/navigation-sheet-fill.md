---
'@envsemble/envui': patch
---

A Sheet is on the navigation's background, `--env-color-bg-default`, rather than the popup's, in every theme, so navigation that opens in a sheet in a narrow window keeps the color it has at the window's edge in a wide one. The sheet keeps its elevation edge and scrim; Dialog, menus and popovers keep the popup's fill. Panes' supporting sheet takes the same fill, which differs from its former raised one only at high contrast in the light theme.
