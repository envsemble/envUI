---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': patch
---

NavList and NavList.Skeleton are gone: Bar, Rail and NavigationDrawer show an application's destinations from one array.

- A NavList.Item is a destination in the array: `selected` is `current`, a count in `end` is `count`, NavList.Group's `label` is each destination's `group`, and `iconOnly` in a sidebar's rail is the Rail. End content other than a count has no place in a destination.
- The `navList` messages are `navigation`: `itemCount` keeps its meaning, and `itemEnd` is gone.
- A Tabs item's button is a Button or an IconButton: a NavList.Item as a tab is a ghost Button with `startIcon`.
- The `env-nav-list-*` classes are gone; the navigation forms' parts are `env-bar-*`, `env-rail-*` and `env-drawer-*`, with `data-current`.
- Meter's and Progress's shared props type, `BarProps`, is `RangeBarProps`, as `BarProps` is the navigation bar's.
- No codemod rewrites a NavList, since its items are elements and a destination is data. `v1-names` and `envui/no-renamed-exports` report 0.x's NavigationItem and NavigationItemProps with what to use instead, and `v1-classes` reports the `env-navigation-*` classes instead of renaming them.

Migration guide: [Navigation forms](https://github.com/envsemble/envUI/blob/main/docs/migration.md#navigation-forms).
