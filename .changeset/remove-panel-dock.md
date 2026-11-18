---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

PanelDock is gone: docking, minimizing and maximizing panels is an application's own logic. A panel people keep open beside the page is a Sheet, or a pane of Panes.

Breaking changes:

- **PanelDock is removed**: `PanelDock.Root`, `PanelDock.Header` and their props, the types `PanelDockMode` and `PanelDockPanel`, the messages `panelDock` (`minimize`, `maximize`, `restore`, `closeWindow`, `minimized`, `open`, `close` and `resize`), its parts `env-panel-dock`, `env-panel-dock-row`, `env-panel-dock-panel`, `env-panel-dock-header`, `env-panel-dock-heading`, `env-panel-dock-title`, `env-panel-dock-meta`, `env-panel-dock-header-content`, `env-panel-dock-actions`, `env-panel-dock-controls`, `env-panel-dock-content`, `env-panel-dock-resize-handle`, `env-panel-dock-strip`, `env-panel-dock-tab`, `env-panel-dock-tab-label`, `env-panel-dock-tab-attention`, `env-panel-dock-tab-restore`, `env-panel-dock-tab-close` and `env-panel-dock-probe`, and its states `data-active` (`data-active=''`), `data-mode` (`data-mode='open'`, `data-mode='minimized'`, `data-mode='maximized'`), `data-placement` (`data-placement='row'`, `data-placement='fill'`, `data-placement='hidden'`), `data-panel-id`, `data-entering`, `data-attention` (`data-attention=''`), `data-filled` (`data-filled=''`), `data-overflowing` (`data-overflowing=''`), `data-resizing` (`data-resizing=''`), `data-scrolled` (`data-scrolled=''`), `data-stacked` (`data-stacked=''`) and `data-tabs` (`data-tabs=''`). Write the panels as the application's own, with a [Sheet](https://github.com/envsemble/envUI/blob/main/docs/components/sheet.md) for one beside the page or [Panes](https://github.com/envsemble/envUI/blob/main/docs/components/panes.md) for one in the layout.
- A Scaffold's body no longer places a PanelDock across its scrollport.
