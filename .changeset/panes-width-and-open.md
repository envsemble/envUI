---
'@envsemble/envui': minor
---

Panes takes the words Sheet takes for one resizable width: `size`, `defaultSize`, `onSizeChange`, `minSize`, `maxSize` and `persistedSize` are `width`, `defaultWidth`, `onWidthChange`, `minWidth`, `maxWidth` and `persistedWidth`, and `readPanesSize` is `readPanesWidth`. `ResizeDetails`, `{ committed }`, is what every resize callback receives, Table's `onColumnWidthsChange` now too.

Panes.Root takes `defaultOpen`, so a supporting pane opens from Panes.Trigger and closes without the application keeping its state, and `onOpenChange` receives why, `Panes.OpenChangeDetails`: `trigger-press`, `escape-key`, `close-press`, `outside-press` or `back-press`. The part props are `Panes.MainProps`, `Panes.DetailProps` and `Panes.ListProps`, for `PaneProps` and `NamedPaneProps`.
