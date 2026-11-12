---
'@envsemble/envui': major
---

ClickableCard, ActionCard and FeatureCard are one Card.

- A card with `href` is a link and one with `onClick` a native button; `as` is gone, and `render` sets the element of a content card, such as `render={<article />}`.
- A content card takes `title`, `meta`, `description` and `actions`, which puts its controls in a strip along the bottom; `headingLevel` sets the title's level, `h3` by default. `layout="feature"` is FeatureCard: an icon, an `h2` heading in the headline type, a description and the actions at the end, which stack in a card narrower than 38 rem. `layout`'s `content` and `action` values are gone.
- `tone` is `background`: `row` is `muted`, the default, `pane` is `default` and `canvas` is `page`.
- A link card's accessible name is its text: the components overview names its cards by their content, which removes the overview's label-content-name-mismatch entries.
- The classes are `env-card` with `data-interactive`, `data-actions` and `data-layout`, and the parts `env-card-header`, `-heading`, `-meta`, `-body`, `-footer`, `-layout`, `-icon` and `-description`.

Migrate with the codemods: `envui-codemods v1-names` renames ClickableCard and its props type; `v1-structure` turns ActionCard and FeatureCard into a Card and drops or converts Card's `as`; `v1-props` moves `tone` and drops `layout="content"` and `"action"`; `v1-classes` renames the classes. An `as` that is an expression is reported.

Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
