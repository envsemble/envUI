---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
'@envsemble/eslint-plugin-envui': patch
---

Card's feature layout is built from envUI's components now: Card keeps its surface and its parts, and a feature card is a Card holding envUI's own components.

- Card's `layout` and `icon` props are gone, with the `data-layout` attribute, `[data-layout='feature']`, `[data-layout='stack']` and the part classes `env-card-layout` and `env-card-icon`. A card with actions is `.env-card[data-actions]`, and a card's title is an `h3` by default whatever it holds.
- The feature card on Card's page, `docs/components/card.md`, builds one from a Card holding a Row with the icon in muted Text, a Column with a headline Text heading and a Text sentence, and the Button that starts the feature, which moves below the text in a narrow card. The page keeps the heading's level in the page's outline.
- `v1-props` drops `layout="stack"` and reports `layout="feature"` and `icon`, `v1-structure` reports 0.x's FeatureCard instead of writing the feature layout, and `v1-classes` reports `env-feature-card-*`, `env-card-layout`, `env-card-icon` and `[data-layout]` on a card.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md#folded-components-and-patterns).
