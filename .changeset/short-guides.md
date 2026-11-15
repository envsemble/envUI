---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

The guides are short, and the customizing and foundations pages are generated:

- **Customize** (`docs/customizing.md`) is the styling contract of every component, generated from `docs/generated/parts.json`: its part classes, with the slots marked, its state attributes, its color properties and its public properties, beside the theme settings (`surface`, `selection`, `corners` in `defineTheme`), recoloring an area through the tokens, and the tokens layouts line up with.
- **The foundations** (`docs/foundations/`) are their figures and a few sentences, with every token in a generated table: colors by role in light and dark, spacing, corners, controls and rows, type, icon sizes, window classes, layout widths, the stacking order and motion, each with its value in both scales and what it is for.
- **Setup, Writing and Dev mode** keep what installs and runs with a few sentences around it. Writing keeps its vocabulary table, which `envui/label-vocabulary` reads, and a few lines on sentence case and the ellipsis on an action that asks for more.
