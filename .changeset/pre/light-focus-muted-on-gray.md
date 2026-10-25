---
'@envsemble/envui': patch
---

In the light theme at standard contrast, focus rings and muted text are a step darker, so they keep their contrast on light gray surfaces as well as on white. On a surface a little grayer than the page, about 0.035 lower in OKLCH lightness, a focus ring inside a pressed tab reached only 2.81:1 and a pressed tab's muted label 4.46:1. `--env-color-border-focus` goes from `#1872e7` to `#0366da`, 3.30:1 there, and `--env-color-fg-muted` from `#54575c` to `#4b4d51`, 5.21:1 there. `--env-color-fg-muted-hover` and `--env-color-fg-muted-pressed` move one step darker with it, so hovered and pressed muted text still gains contrast. The dark theme and both high-contrast themes are unchanged.
