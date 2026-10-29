---
'@envsemble/envui': patch
---

Hairlines separate the items of one list, always across the full width, and no longer divide regions. Menu.Separator is a hairline across the menu's whole width, edge to edge rather than inset from its sides, with space above and below, in menus, context menus, menubar menus and submenus. Markdown rules (`hr`) and table rows keep their lines. Lines that only divided regions are gone: DocumentTabs' bar has no base line, and the command palette's footer no line above it. A sticky PageHeader and a docked panel's header take the muted fill, `--env-color-bg-muted`, once content scrolls beneath them, instead of a line, and keep a line in forced colors. Panes.Divider is the gap between the panes, with a small grip of three dots in it, darker on hover and in the focus color with keyboard focus, which also rings the gap, and while dragging; it draws no line. Give each pane a Surface so they stand apart across the gap. Toolbar.Separator keeps its line between groups. Dev mode's inspector sits beside the view without a line. No class, prop or token changes: where an application needs a line, give the part its own `border`.

Migration guide: [Navigation and collections](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
