---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': patch
---

Drawer, the panel that slides in over the page, is Sheet, after Material's side and bottom sheets; the name Drawer is the navigation drawer's. Sheet takes Drawer's props, and `side="bottom"` for a bottom sheet, as wide as the window up to 40 rem and as tall as its content, with rounded top corners and a swipe down to close.

- Its widths follow the window classes of the `env-window` container instead of the viewport: a `md` side sheet takes the whole width of a compact window, below 37.5 rem, and a `lg` one of a compact or medium window, below 52.5 rem.
- The part classes `env-drawer-popup`, `env-drawer-viewport` and `env-drawer-backdrop` are `env-sheet-popup`, `env-sheet-viewport` and `env-sheet-backdrop`, with the same state attributes, `data-side`, `data-width`, `data-starting-style`, `data-ending-style` and `data-swiping`.
- `v1-structure` turns a 0.x `<Dialog placement="right">` into a Sheet. 0.x had no Drawer, and the name is the navigation drawer's now, so no codemod renames one: rename `Drawer` and `DrawerProps` from the prerelease to `Sheet` and `SheetProps`, and the `env-drawer-*` classes to `env-sheet-*`, by hand. `v1-structure` reports a Drawer without `destinations`, and `v1-classes` the classes.

Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
