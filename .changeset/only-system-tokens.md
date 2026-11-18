---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Every `--env-*` custom property is now public: a token, a component's color property or a property listed under `properties` in `docs/generated/parts.json`. The layout values applications line up with are tokens, defined at the root of every theme in every scale:

- `--env-page-gutter`: a Page's gutter, spacing step 4. A Page 37.5 rem or wider in its container keeps step 5, and a Page without a gutter none; inside a Page the token is the gutter it keeps.
- `--env-page-width-sm`, `--env-page-width-md` and `--env-page-width-lg`: a Page's column widths, 40, 60 and 76 rem.
- `--env-navigation-rail-width`: a NavigationRail's width, 5 rem.
- `--env-navigation-drawer-width`: the width a resizable NavigationDrawer starts at, 17.5 rem; on a resizable drawer, the width it has.
- `--env-panes-size` and `--env-panes-other-min`: the sized pane of Panes, 22.5 rem until people resize it, and the least width of the other pane, 16 rem.
- `--env-sheet-width-md` and `--env-sheet-width-lg`: a side Sheet's widths, 24 and 44 rem.
- `--env-dialog-width-md` and `--env-dialog-width-lg`: a Dialog's widths, 28 and 44 rem.

`--env-avatar-dense` (Avatar) and `--env-spinner-color` (Spinner) are listed as public properties, as their docs already described them.

Breaking change: the components' private custom properties, such as `--env-card-padding`, `--env-button-height`, `--env-surface-color`, `--env-icon-size` or `--env-popup-fill`, were never public and are gone; the components now use the tokens directly, and what they still keep for themselves takes the private `--_` prefix, which may change in any release. An application that set or read one sets a token instead, such as `--env-space-4`, or a component's color property, such as `--env-card-container`; `npm run lint:css` with `@envsemble/stylelint-config-envui` reports an `--env-*` name envUI doesn't define.
