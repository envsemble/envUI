---
'@envsemble/envui': major
'@envsemble/eslint-plugin-envui': patch
---

Stat is a pattern now, not a component: a figure carries no behavior of its own, and applications arrange their figures differently.

- Stat, with Stat.Root, Stat.Group and the `Stat.RootProps`, `Stat.GroupProps`, `Stat.Trend` and `Stat.TrendTone` types, is gone. The key figures pattern, `docs/patterns/key-figures.md`, builds a figure from a muted Text label, a headline Text figure in tabular digits and a Badge that says the trend in words, in its tone and with a trending icon, and a group from a Surface with `role="group"` around a Grid of even columns. Its notes keep what Stat took care of: the trend said in words, tabular digits, and the group's name.
- The part classes `env-stat`, `env-stat-label`, `env-stat-value`, `env-stat-footer`, `env-stat-trend`, `env-stat-description` and `env-stat-group` go, with the `data-direction` and `data-tone` of the trend. The `stat` page opens the pattern.
- `v1-names` reports Stat, 0.x's Stat and StatGroup and their types where they are used, and `v1-classes` reports the `env-stat-*` classes; no codemod rewrites them. `envui/no-renamed-exports` reports them with the pattern to use instead.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
