---
'@envsemble/envui': minor
---

NavigationRail's current destination now looks like a NavigationDrawer's current row: the whole item, icon and label, takes the selected fill with the drawer's corners, its label turns semibold and its icon stays filled. Before, only a rounded rectangle behind the icon was filled. Hover and press fill the whole item too, the keyboard focus ring goes around it, and the rail has a small inline padding so the items sit inside it. NavigationBar is unchanged.

`--env-navigation-rail-item-selected` now colors the current item's fill, and `--env-navigation-rail-item-selected-content` its icon and label; `--env-navigation-rail-item-container` colors each item's fill at rest.
