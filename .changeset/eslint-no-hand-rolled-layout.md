---
'@envsemble/eslint-plugin-envui': minor
---

A new rule, `no-hand-rolled-layout`, warns on `display: flex`, `inline-flex`, `grid` and `inline-grid` in JSX `style` objects and names the layout primitive to use instead: Row for a flex row, Column for a flex column, and Grid for a grid. It reads every object in a `style` value, through conditions, spreads and calls, and a `const` of the same file that holds the style object, as in `style={row}` or `style={styles.toolbar}`. `configs.recommended` turns it on as a warning, not an error, since plain CSS stays allowed where a primitive can't do what the layout needs; disable it on that line and say why.
