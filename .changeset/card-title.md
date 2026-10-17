---
'@envsemble/envui': major
---

Card takes its heading as `title`, as Alert, EmptyState and Dialog do, where it was `heading`; `headingLevel` still sets its level. The native `title` attribute is no longer a prop of a card.

Migrate with the codemods: `envui-codemods v1-props` renames `heading` to `title`, and `v1-structure` keeps ActionCard's and FeatureCard's `title` as it is. Move a native `title` tooltip of a 0.x content card to an element inside it.

Migration guide: [Content and display](../../docs/migration.md#content-and-display).
