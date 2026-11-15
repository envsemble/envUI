---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Layout, navigation and overlays place what applications give them without styling it, close and stack the same way in every presentation, and fit their containers.

- **TopBar** takes `start`, `title`, `center` and `end` content, each in a part that only places it. `center` is centered in the bar. A `title` given as text is semibold and cut short first; any other content keeps its own look, so a button there keeps its focus ring.
- **PageHeader**'s `description` is no longer a paragraph, so a status line or any block content is valid there. Text in it still takes the smaller muted text. Its `breadcrumbs`, `start`, `meta`, `actions` and `toolbar` only place what they hold.
- **NavigationDrawer** is `--env-navigation-drawer-width` wide and never wider than its container, with no fixed minimum, so it also lists a page's sections in a narrow column. A destination's new `end` holds a control of its own at the end of its row, outside its link, such as a delete IconButton; the row's fill reaches under it. Its `badge`, `header` and `footer` only place what they hold, as do NavigationRail's `header` and `footer`.
- **The frame and the content share one background.** TopBar, NavigationDrawer, NavigationRail and NavigationBar sit on the page's background by default, and a Scaffold sets each apart from the body with a hairline. `background="default"` keeps the default surface color, set apart from the page. The current destination takes the selection tokens, neutral by default.
- **Panes** keeps one state for the supporting pane, which every presentation follows. Its close button closes it beside the main pane too: the main pane takes the room, and Panes.Trigger shows and takes focus. `open` and `defaultOpen` take `null`, the new default: shown side by side, the sheet closed until people open it. `closeButton={false}` on Panes.Supporting keeps the pane open beside the main one. Each pane takes a `header`, which stays in view while the pane's content scrolls under it, so a pane never overflows.
- **Modals stack in the order they open.** A Dialog opened from a Sheet, or any modal from another, covers it with a backdrop of its own. Backdrops and modal surfaces share `--env-z-modal`.
- A Dialog's, a Sheet's and a ConfirmDialog's `description` is no longer a paragraph.
- DocumentTabs' `end` and PanelDock.Header's `meta` and content only place what they hold; a panel's meta takes the smaller muted text from the heading around it.

Breaking changes:

- TopBar's `actions` is renamed `end`: write `<TopBar end={…} />`. The parts `env-top-bar-actions` is gone; the end is `env-top-bar-end`, and the bar adds `env-top-bar-lead`, `env-top-bar-middle`, `env-top-bar-center` and `env-top-bar-title-text`, with `data-centered` on the bar. An `img` or `svg` in TopBar's or PageHeader's `start` is no longer sized for it: use a Graphic.
- Tabs' `orientation` is gone, with `orientation="vertical"` and the rail's `data-orientation` state, whose `vertical` value styled a column: a side list of sections is a NavigationDrawer.
- NavigationDrawer's part `env-navigation-drawer-branch-row` is renamed `env-navigation-drawer-row`, which also holds a destination with an `end`. A drawer is no longer as wide as its longest destination between 15 and 20 rem: it is the drawer width, 17.5 rem, within its container.
- TopBar, NavigationDrawer, NavigationRail and NavigationBar default to `background="page"` and always write `data-background`, `page` or `default`. Write `background="default"` for the earlier fill.
- Panes' `open` and `defaultOpen` default to `null` rather than `false`; an application that keeps `open` as `false` until people open the pane now has the pane closed side by side too: start it at `null`. Panes.Supporting shows its close button side by side unless `closeButton={false}`. Each pane's content is in `env-panes-body`, which scrolls in place of the pane, under `env-panes-header`.
- Breadcrumbs' item `label` is a string.
- `--env-z-backdrop` is now only a backdrop in the page, such as a supporting pane's; modal backdrops are at `--env-z-modal`.
