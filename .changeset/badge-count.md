---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
'@envsemble/eslint-plugin-envui': patch
---

CounterBadge folds into Badge: a Badge with `count` is a compact count.

- `<Badge count={12} />` shows a count, a number or short text such as 99+, in a compact round pill with tabular figures, in place of a label. It takes the tones and variants of any badge: neutral and soft by default, with the figures in the default text color, and `tone="accent" variant="solid"` for the filled count that needs attention. Its `aria-label`, such as 12 unread, is read in place of the number.
- CounterBadge and `CounterBadgeProps` are gone, and so are 0.x's Counter and `CounterProps`, which 1.0.0-prerelease.0 renamed to them: `<CounterBadge value tone>` is `<Badge count tone>`, with `variant="solid"` in the accent tone. Bar's counts and Toast's count of hidden notices are Badges with `count`.
- The part classes `env-counter-badge` and `env-counter-badge-label` are `.env-badge[data-count]` and `env-badge-count-label`, and the hooks a control sets for the counts inside it, `--env-counter-badge-fg`, `-bg` and `-border`, are `--env-badge-count-fg`, `-bg` and `-border`.
- `v1-structure` rewrites CounterBadge and Counter into a Badge with `count`, and reports a `tone` that is an expression; `v1-names` renames `CounterBadgeProps` and `CounterProps` to `BadgeProps`, and `v1-classes` renames the classes and hooks. `envui/no-renamed-exports` reports Counter with what replaces it.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md#folded-components-and-patterns).
