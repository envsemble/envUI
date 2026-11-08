---
'@envsemble/envui': patch
---

Panes ignores a `width`, `defaultWidth` or `persistedWidth` that is no number, such as NaN from a stored value that didn't parse, as Sheet and NavigationDrawer do: the pane keeps its width as if it weren't given.
