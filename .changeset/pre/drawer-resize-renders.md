---
'@envsemble/envui': patch
---

A resizable NavigationDrawer renders only itself and its handle on each move of a drag, not its destinations, so dragging the edge of a long drawer no longer lags. Where the application keeps the width, keep `destinations` the same array while it changes, such as with `useMemo`, as the [NavigationDrawer page](https://github.com/envsemble/envUI/blob/main/docs/components/navigation-drawer.md) shows.
