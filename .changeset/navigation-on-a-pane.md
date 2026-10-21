---
'@envsemble/envui': patch
---

The navigation sits on a pane instead of behind lines. Drawer and Rail paint the default surface background (`--env-color-bg-default`) with a Surface's corners, and Scaffold sets their pane 0.5 rem clear of the window's edges and the body; on another surface, such as a Sheet, they take that surface's color rather than nesting a pane in it. Bar is a filled bar of the same color with no line above it, and TopBar sits on the page's background with no line below it. Under forced colors, where the system paints no backgrounds, the panes and bars keep an edge. No prop changes.
