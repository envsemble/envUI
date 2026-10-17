---
'@envsemble/envui-codemods': minor
'@envsemble/eslint-plugin-envui': patch
---

The rename map covers Card, Badge, Avatar, Stat, SegmentedControl, Kbd and the logos: `v1-structure` turns ActionCard and FeatureCard into a Card and drops or converts Card's `as`, and a structure case can add an element prop, such as `render={<article />}`; `v1-names` renames ClickableCard, InfoChip and SegmentedControlOption and reports BrandLogo and EnvUILogo; `v1-props` moves Card's and Stat.Group's `tone`, the avatar sizes, `detail`, `options` and Badge's `subtle`; `v1-classes` renames the Card family's, InfoChip's, the segments', the avatar sizes', Kbd's combination and Stat's classes. The ESLint plugin's `no-renamed-exports` knows the renamed and removed names.
