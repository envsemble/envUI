---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
'@envsemble/eslint-plugin-envui': major
'@envsemble/stylelint-config-envui': major
---

envUI's CSS moves into cascade layers, and every token takes the `--env-` prefix.

- **Cascade layers.** Every rule of `styles.css` is in a layer of `env`: `env.reset`, `env.tokens`, `env.base`, `env.components` and `env.utilities`, in that order. An application's CSS outside cascade layers overrides envUI's whatever its specificity, so selectors and `!important` that only out-weighed envUI's rules can go. An application puts its resets and element styles in a layer before `env` and its own layers after it, declared once, such as `@layer reset, env, app;`: an element rule outside layers would restyle envUI's components too. The font face stays outside layers.
- **The `--env-` prefix.** Every token is a custom property with the prefix: `--space-4` is `--env-space-4` and `--color-fg-muted` is `--env-color-fg-muted`, in Tokens.css, the token reference, the manifest and the MCP server. The application hooks take it too: `--env-line-height-body`, `--env-avatar-group-ring` and the pill corner `--env-radius-full`.
- **The 0.7 aliases are removed.** `--color-text-muted`, `--color-row`, `--color-checkbox` and the other 0.7 names that were aliases of the semantic roles are gone; use the role that replaces each. The list item's per-theme fill and the avatar's fixed blues are component tokens now: `--env-color-list-item-bg` with `-hover` and `-pressed`, and `--env-color-avatar-bg`, `-fg` and `-figure`. `--md-sys-shape-corner-*` is retired for one radius scale, `--env-radius-{none|xs|sm|md|lg|xl|full}`, with `--env-radius-surface` and the row radii as its roles; `--radius-standard` is `--env-radius-sm` and `--radius-large` `--env-radius-lg`.
- **Consistent color names.** A tone's edges grow from `border-{tone}-muted`, an alert's faint edge, through `border-{tone}`, an outlined badge's translucent edge, to the solid `border-accent-emphasis` and `border-danger-emphasis`, the edges of a focused and an invalid field, which were `border-accent` and `border-danger`. `border-translucent` is `border-media` and `bg-page-muted` is `bg-inset`, named for their roles, and the tones' state layers gain a resting `bg-{tone}-subtle`.
- **Forced colors.** Under `forced-colors: active`, such as the system's contrast themes, selected, chosen, current, highlighted, checked, focused, invalid and unavailable states take system colors where a fill or shadow carried them, so they stay visible, and swatches, the color picker and calendar heatmaps keep their colors.
- **Motion** lives in each component's style sheet; it is unchanged, with fades always and movement only without a reduced-motion preference.

To migrate, run `npx @envsemble/envui-codemods v1-classes src`: it rewrites the old custom properties in style sheets and scripts, declared or read, to their 1.0 names, the 0.7 aliases straight to the tokens that replace them, and reports `--color-white`, `--color-canvas-dark` and the removed names with what to use instead. The migration guide lists every name. The ESLint plugin and the Stylelint config suggest the prefixed tokens.

Migration guide: [Cascade layers](https://github.com/envsemble/envUI/blob/main/docs/migration.md#cascade-layers) and [Tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md#tokens).
