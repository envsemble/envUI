---
'@envsemble/envui': major
---

Text, Skeleton, Surface and Stack take the 1.0 vocabulary, and `render` replaces `as`.

- Text: `tone` is `emphasis`, `default`, `muted` or `subtle` (`primary` is `default`, `quiet` is `subtle`). The variants `page-heading`, `section-heading` and `supporting` are `headline`, `title` and `body-sm`. `as="h2"` is `render={<h2 />}`. `TextTone` is `TextEmphasis`, and `TextElement` is gone. The classes `env-text-{variant}` and `env-text-tone-{tone}` are `[data-variant]` and `[data-emphasis]` on `.env-text`.
- Skeleton: `tone` is `emphasis`: `base` is `muted`, the default, and `highlight` is `default`; `env-skeleton-highlight` is `[data-emphasis='default']`.
- Surface: `tone` is `background`, `default`, `muted`, `page` or `raised` (`pane`, `row`, `canvas` and `alternate` before), and `corners` is `radius`, named after the radius tokens: `xl`, `sm`, `full` or `none` (`surface`, `standard`, `pill` and `none` before). `as` is `render`. `SurfaceTone` is `SurfaceBackground` and `SurfaceCorners` `SurfaceRadius`. The classes `env-surface-{tone}` and `env-surface-corners-{corners}` are `[data-background]` and `[data-radius]`.
- Stack lays out rows too: `direction="row"`, `wrap` and `justify` (`start`, `center`, `end` or `between`). `as` is `render`, and `StackElement` is gone.
- ActionGroup is gone. A row of actions is `<Stack direction="row" wrap align="center" gap={4}>`, with `justify="end"` for `align="end"`, and a stacked group `<Stack gap={2}>` with `fullWidth` on each labelled Button.
- The icon wrapper's class `env-symbol` is `env-icon`, sized by the custom property `--env-icon-size`, which a container such as a button sets.

Migrate with the codemods: `envui-codemods v1-structure` rewrites ActionGroup into Stack and reports a `stacked` it can't read; `v1-render` turns a literal `as` into `render` and reports an expression; `v1-props` renames `tone`, `corners` and the Text variants and maps their literal values, reporting an expression; `v1-names` renames the types and reports the removed ones; and `v1-classes` rewrites the classes and `env-symbol`.

Migration guide: [Variants, tones and render](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
