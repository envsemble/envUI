---
'@envsemble/envui': minor
'@envsemble/envui-codemods': patch
---

Bar, Rail and Drawer, the navigation forms: the navigation bar for compact windows, the rail for medium ones and the drawer from expanded, which Scaffold picks by window class.

- Each takes the same array of destinations, `Destination` items: `{ label, icon, href or onSelect, count, group, current }`. A destination with `href` is a link through the `LinkProvider`'s link component, and one without is a button that runs `onSelect`.
- Each renders a `nav` landmark, named "Main" from `messages.navigation.label` unless it has `aria-label` or `aria-labelledby`, with `aria-current="page"` on the current destination, whose Material Symbol fills. A count shows on the destination, 999+ above 999, and its name says it, such as "Inbox, 3 new", from `messages.navigation.itemCount`.
- Drawer heads each run of a `group` and shows the count at the item's end; its icons are optional (`DrawerDestination`). Rail and Bar show the icon in a pill-shaped indicator above the label, with the count on it, and keep the groups' order without headings. Bar shows five destinations at most: past five, the first four and More, a menu with the rest. Rail and Drawer take a `header` and a `footer`.
- Their parts are `env-bar-*`, `env-rail-*` and `env-drawer-*`, the current item with `data-current`. Bar's indicator and label are `env-bar-icon` and `env-bar-text`, since 0.x's Meter used `env-bar-indicator` and `env-bar-label`, which the codemods rename to `env-meter-*`; `v1-classes` renames 0.x's `env-bar` alone, and leaves the Bar's other parts.
- Menu.Item takes `aria-current` and `aria-label`, which the Bar's More menu sets on its destinations. Drawer's group headings are headings, `h2` unless `headingLevel` gives another level.
