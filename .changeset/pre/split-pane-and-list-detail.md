---
'@envsemble/envui': major
---

New: `SplitPane` and `ListDetail`, which replace 0.6's SplitView.

- `SplitPane.Root` lays out two `SplitPane.Pane`s, side by side or one above the other (`orientation`), with a `SplitPane.ResizeHandle` between them: an APG window splitter that the pointer drags and the arrow keys move, in the text direction, and a double click resets. The first pane's `size`, `defaultSize`, `minSize` and `maxSize` are in `unit`, `%` of the split pane or `rem`; `onSizeChange` receives each size with `{ committed }`, and `persist` keeps it in localStorage, read after the first render. Below `stackBelow` of its own width the panes stack and the handle goes (`onStackedChange`, `data-stacked`). A Pane with `label` is a named region; the handle's name comes from `label` or `messages.splitPane.resize`.
- `ListDetail.Root`, `ListDetail.List` and `ListDetail.Detail` put a list beside the detail of its chosen item on SplitPane, the list's width resizable and persisted. Below `stackBelow`, 44 rem by default, they show one at a time: `detailShown` shows the detail with a back button named by `backLabel`, which calls `onBack`. Focus moves to the back button as the detail opens, and back to the list's current row, the element with `aria-current`, as it closes.

Migrate a SplitView with the codemods: `v1-names` and `v1-structure` turn `<SplitView start end resizeLabel storageKey>` into `<SplitPane.Root persist>` around `<SplitPane.Pane>{start}</SplitPane.Pane>`, `<SplitPane.ResizeHandle label />` and `<SplitPane.Pane>{end}</SplitPane.Pane>`, `SplitViewProps` into `SplitPane.RootProps`, and `v1-classes` renames `env-split-view` and its parts. The sizes keep their percentages, now of the whole split pane.

Migration guide: [Split panes](https://github.com/envsemble/envUI/blob/main/docs/migration.md#split-panes).
