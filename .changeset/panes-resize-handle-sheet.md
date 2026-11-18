---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

**ResizeHandle, Panes and Sheet are three separate things.**

- **ResizeHandle** is a component of its own, for any edge people drag or move with the keys to resize what is beside it, such as a sidebar: a separator with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`, that the pointer drags and the arrow keys, Page Up, Page Down, Home and End move. It takes `axis`, `value`, `min`, `max`, `onChange`, `unit`, `step`, `largeStep`, `reverse`, `room`, `percentOf`, `valueText`, `disabled` and `label`, and is styled with a class like any element. Its track is invisible, with a grip of three dots at its middle; a 1 px line in `--env-color-border-default` shows along it under the pointer and while it is dragged, a 2 px line in the focus color with keyboard focus, CanvasText under forced colors. `grip={false}` turns the dots off. Sheet's, NavigationDrawer's and Panes' handles are this one.
- **Panes only splits a region into two panes**: `Panes.Pane`, an optional `Panes.ResizeHandle` and `Panes.Pane`. One pane has a width of its own, the first by default or the last with `sized="end"`, and the other takes the rest. With `stackBelow`, a window class of Panes' own width, the panes stack below it, each half the height, and the handle hides; without it they always sit side by side. Each pane takes `label` and `header`, and Panes keeps `width`, `defaultWidth`, `onWidthChange`, `minWidth`, `maxWidth`, `persist` and `persistedWidth`. The handle sits on the seam with its grip and reaches only into the pane after it.
- **Sheet** stays the panel that opens over the page; a pane that becomes a sheet in a narrow window is an application's own composition of Panes and Sheet.

Breaking changes:

- Panes' `behavior` and `splitAt` are gone, with the types `Behavior` and `SplitAt`: write `sized="end"` for a pane at the end that has the width, as the supporting pane had, and `stackBelow` for stacking in a narrow region. Panes no longer turns a pane into a sheet or shows one pane at a time: compose Panes with a [Sheet](https://github.com/envsemble/envUI/blob/main/docs/components/sheet.md) for that.
- Panes' `open`, `defaultOpen`, `onOpenChange`, `closeLabel` and `backLabel` are gone, with the types `OpenChangeReason` and `OpenChangeDetails` and the messages `panes.back` and `panes.close`; an application keeps whether a pane shows and renders it or not.
- `Panes.Main`, `Panes.Supporting`, `Panes.List` and `Panes.Detail` are one part, `Panes.Pane`, with `label` and `header`; Panes.Supporting's `closeButton` and `skeleton` are gone. `Panes.Trigger` is gone. `Panes.Divider` is `Panes.ResizeHandle`, with the same `label`.
- The parts `env-panes-main`, `env-panes-supporting`, `env-panes-list`, `env-panes-detail`, `env-panes-divider`, `env-panes-back`, `env-panes-close`, `env-panes-backdrop` and `env-panes-trigger` are gone: a pane is `env-panes-pane` and the handle `env-panes-resize-handle`. The states `data-behavior` (`data-behavior='supporting'`, `data-behavior='list-detail'`), `data-split-at` (`data-split-at='medium'`, `data-split-at='expanded'`, `data-split-at='large'`), `data-open`, `data-closed` and `data-sheet-only` are gone; the root takes `data-sized` and `data-stack-below`.
- The resize handle is invisible but for its grip, with no line at rest, and its grip keeps its color with keyboard focus, where a line in the focus color shows instead of an outline around the handle.
- The token `--env-z-supporting-pane` is gone with the supporting pane's sheet: a layer of the application's own over the page takes `--env-z-sticky` plus one, or `--env-z-modal` for a modal one.
