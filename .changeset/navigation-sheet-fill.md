---
'@envsemble/envui': patch
---

A Sheet that holds a Drawer or a Rail takes the navigation's background, `--env-color-bg-default`, or the page's for `background="page"`, rather than the popup's, so navigation that opens in a sheet in a narrow window keeps the color it has at the window's edge in a wide one. The sheet keeps its edge and scrim.
