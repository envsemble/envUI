---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': patch
---

SplitPane and ListDetail are gone: Panes replaces them, one scaffold for two panes side by side with two behaviors in less room, `supporting` and `list-detail`, which CSS decides from its own width instead of measuring it.

- `<ListDetail.Root detailShown onBack backLabel>` is `<Panes.Root behavior="list-detail" open onOpenChange backLabel>`, with Panes.List and Panes.Detail; the `v1-structure` codemod rewrites it, and reports its sizes, its `stackBelow`, which is `splitAt` at a window class, and its `resizeLabel`, as the divider is Panes.Divider, a part of its own. SplitPane is rewritten by hand, as supporting Panes with Panes.Main, an optional Panes.Divider and Panes.Supporting.
- Sizes are in rem: `size`, `defaultSize`, `minSize` and `maxSize` are the resized pane's width, and `persist` keeps it.
- The part classes go: `env-split-pane`, `env-split-pane-pane`, `env-split-pane-handle`, `env-split-pane-probe`, `env-list-detail`, `env-list-detail-list`, `env-list-detail-detail` and `env-list-detail-back`, which are `env-panes`, `env-panes-main`, `env-panes-supporting`, `env-panes-list`, `env-panes-detail`, `env-panes-divider` and `env-panes-back`. Their state attributes go: `data-orientation`, `data-axis` (the divider keeps it, as every resize handle does), `data-stack-below`, `data-stacked` and `data-detail-shown`; Panes has `data-behavior`, `data-split-at` and `data-open`.
- A vertical split pane has no counterpart.
- `v1-classes` renames the classes of SplitPane and ListDetail to Panes', `env-split-pane-handle` to `env-panes-divider` and `env-list-detail-back` to `env-panes-back`, and reports `env-split-pane-probe` and the states Panes no longer sets, such as `[data-stacked]`.

Migration guide: [Split panes](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
