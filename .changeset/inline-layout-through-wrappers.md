---
'@envsemble/eslint-plugin-envui': patch
---

`envui/no-inline-layout` reads a style through optional chaining and a non-null assertion, as `envui/no-html-elements` reads a component: `style={styles?.toolbar}` and `display: d!` are now reported where the constant they read sets a layout display.
