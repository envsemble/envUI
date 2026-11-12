---
'@envsemble/envui': minor
---

Each component brings its own styles: its module imports its style sheet, after the base every component shares (the layer order, tokens, theme and font), so a bundler such as Vite or webpack puts in the page only the CSS of the components the application uses. A small application with Theme, Button, TextField and Card loads about 13 kB of CSS (gzip) instead of 49 kB, and a typical one with 23 components about 26 kB. In Node, as for server rendering and tests without a bundler, the same modules load without their CSS: the package's style sheet imports resolve to an empty module under the `node` condition, and to the CSS under the `module` condition bundlers set. `styles.css` still holds every style, for applications without a bundler.

Migration: remove the `@envsemble/envui/styles.css` import when you use a bundler; importing it as well loads the styles twice. An application that declares cascade layers declares their order in a style sheet imported before any component.
