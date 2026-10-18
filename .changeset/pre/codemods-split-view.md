---
'@envsemble/envui-codemods': minor
---

`v1-structure` makes an element's children from its props, as the map's `content` lists them, and limits a case to elements that set some props, whatever their values, with `has`. It rewrites 0.6's SplitView into SplitPane's parts: `start` and `end` become the two `SplitPane.Pane`s, `resizeLabel` the `label` of a `SplitPane.ResizeHandle` between them and `storageKey` `persist`, before or after `v1-names`, which maps `SplitView` to `SplitPane.Root` and `SplitViewProps` to `SplitPane.RootProps`. A SplitView that spreads props or has children is reported. `v1-classes` renames `env-split-view` to `env-split-pane`, and `env-split-view-divider` to `env-split-pane-handle`; the documentation page `split-view` is `split-pane`.
