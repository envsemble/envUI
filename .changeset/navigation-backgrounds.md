---
'@envsemble/envui': minor
---

The navigation and the top bar sit on a background instead of behind lines. Drawer, Rail, Bar and TopBar each fill a plain, square rectangle with the navigation's background, the default surface color (`--env-color-bg-default`), flush with the window's edges and the body in a Scaffold, with no divider line; on a surface, such as a Sheet, they take that surface's color. A new `background` prop, `'default' | 'page'` (type `NavigationBackground`, named as Surface's and Card's fills), puts one on the page's background with `background="page"`, so an application can give the navigation a background and leave the top bar on the page, or the other way round; `'default'` is the default. On a surface both take the surface's color, and a sticky TopBar stays opaque either way. TopBar no longer draws a hairline below it, and Bar none above it. Under forced colors, where the system paints no backgrounds, each keeps an edge toward the body.
