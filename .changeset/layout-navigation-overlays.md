---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Layout, navigation and overlays place what applications give them without styling it, close and stack the same way in every presentation, and fit their containers.

- **TopBar** takes `start`, `title`, `center` and `end` content, each in a part that only places it. `center` is centered in the bar. A `title` given as text is semibold and cut short first; any other content keeps its own look, so a button there keeps its focus ring.
- **PageHeader**'s `description` is no longer a paragraph, so a status line or any block content is valid there. Text in it still takes the smaller muted text. Its `breadcrumbs`, `start`, `meta`, `actions` and `toolbar` only place what they hold.
- **NavigationDrawer** is `--env-navigation-drawer-width` wide and never wider than its container, with no fixed minimum, so it also lists a page's sections in a narrow column. A destination's new `end` holds a control of its own at the end of its row, outside its link, such as a delete IconButton; the row's fill reaches under it. Its `badge`, `header` and `footer` only place what they hold, as do NavigationRail's `header` and `footer`.
- **The app frame keeps its own fill**: TopBar, NavigationDrawer, NavigationRail and NavigationBar take the default surface color, set apart from the page, as before; with `background="page"` they sit on the page's background and a Scaffold parts each from the body with a hairline. They now write `data-background` with either value. The current destination takes the selection tokens, neutral by default.
- **Modals stack in the order they open.** A Dialog opened from a Sheet, or any modal from another, covers it with a backdrop of its own. Backdrops and modal surfaces share `--env-z-modal`.
- A Dialog's, a Sheet's and a ConfirmDialog's `description` is no longer a paragraph.
- DocumentTabs' `end` only places what it holds.

Breaking changes:

- TopBar's `actions` is renamed `end`: write `<TopBar end={…} />`. The parts `env-top-bar-actions` is gone; the end is `env-top-bar-end`, and the bar adds `env-top-bar-lead`, `env-top-bar-middle`, `env-top-bar-center` and `env-top-bar-title-text`, with `data-centered` on the bar. An `img` or `svg` in TopBar's or PageHeader's `start` is no longer sized for it: use a Graphic.
- NavigationDrawer's part `env-navigation-drawer-branch-row` is renamed `env-navigation-drawer-row`, which also holds a destination with an `end`. A drawer is no longer as wide as its longest destination between 15 and 20 rem: it is the drawer width, 17.5 rem, within its container.
- Breadcrumbs' item `label` is a string.
- A Dialog's, a Sheet's and a ConfirmDialog's `description` renders a `div` rather than a `p`, so it can hold any content.
- `--env-z-backdrop` is now only a backdrop in the page; modal backdrops are at `--env-z-modal`.
