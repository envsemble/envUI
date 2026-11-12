---
'@envsemble/envui': major
'@envsemble/eslint-plugin-envui': patch
---

NavList and NavList.Skeleton are gone: Bar, Rail and Drawer show an application's destinations from one array.

- A NavList.Item is a destination in the array: `selected` is `current`, a count in `end` is `count`, NavList.Group's `label` is each destination's `group`, and `iconOnly` in a sidebar's rail is the Rail. End content other than a count has no place in a destination.
- The `navList` messages are `navigation`: `itemCount` keeps its meaning, and `itemEnd` is gone.
- A Tabs item's button is a Button or an IconButton: a NavList.Item as a tab is a ghost Button with `startIcon`.
- NavList's parts are gone: `env-nav-list`, `env-nav-list-group`, `env-nav-list-group-label`, `env-nav-list-group-list`, `env-nav-list-item`, `env-nav-list-item-dot`, `env-nav-list-item-end`, `env-nav-list-skeleton` and `env-nav-list-skeleton-item`, with their states `data-selected`, `data-icon-only` and `data-rail`. The navigation forms' parts are `env-bar-*`, `env-rail-*` and `env-drawer-*`, the current item with `data-current`.
- No codemod rewrites a NavList, since its items are elements and a destination is data. `v1-names` reports NavList, and with `envui/no-renamed-exports` 0.x's NavigationItem and NavigationItemProps, with what to use instead, and `v1-classes` reports the `env-navigation-*` and `env-nav-list-*` classes instead of renaming them.

Migration guide: [Navigation forms](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
