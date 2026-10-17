---
'@envsemble/envui': major
---

PanelDock is a namespace, `PanelDock.Root` and `PanelDock.Header`, and its words come from EnvUIProvider's `messages.panelDock`:

- `PanelDock` is `PanelDock.Root` and `PanelDockHeader` is `PanelDock.Header`, with `PanelDock.RootProps` and `PanelDock.HeaderProps`; `PanelDockPanel` and `PanelDockMode` keep their names.
- PanelDockControls is internal. `PanelDock.Header`'s `controls` is a boolean, `true` by default, and `false` leaves the window controls out, where `null` did. Their names, Minimize, Maximize, Restore and Close, come from `messages.panelDock`, which also names the list of tabs, a tab's buttons and the resize handle; the dock's `minimizedLabel`, `openLabel`, `closeLabel` and `resizeLabel` still override those for one dock.
- Buttons in a header's `actions` that set no variant are `ghost`, as the window controls are, in place of the icon color hook for icon-only text buttons: an icon-only `variant="text"` button there shows the link color now, so drop its variant.
- Minimized panels are tabs, as on a taskbar: `env-panel-dock-chip*` is `env-panel-dock-tab*`, and the dock's `data-chips` is `data-tabs`. A tab's close button is a CloseButton.
- The resize handle runs on the shared window splitter: <kbd>Page Up</kbd> and <kbd>Page Down</kbd> change the height by 64 px as <kbd>Shift</kbd> with an arrow does, and a drag that loses its pointer keeps the height it began with.

The codemods rename the exports (`v1-names`), turn `controls={null}` into `controls={false}` and report a `controls` element (`v1-props`), report `PanelDockControls` with what replaces it, and rename the classes (`v1-classes`). Rename `[data-chips]` in style sheets by hand.

Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).
