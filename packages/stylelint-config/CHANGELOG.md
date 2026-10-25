# @envsemble/stylelint-config-envui

## 1.0.0-prerelease.3

### Major Changes

- Part names are public; component tokens are private.
  - **Part classes and state attributes are public and versioned.** Every part of a component has a class, `env-<component>-<part>`, such as `.env-card-header`, and a component shows its state in `data-*` attributes, such as `[data-tone='danger']`. An application's CSS may target them, and from now on a release that renames or removes one is a major release with a migration note. `docs/generated/parts.json` lists every component's root class, its parts with what each one is, and its state attributes with their values; the manifest gives each component page its `parts`, the MCP server's `get_component` returns them, and llms.txt names each component's root classes.
  - **Component tokens are private.** The custom properties a component declares for itself, such as `--env-card-padding` or `--env-badge-fill`, may change in any release. Set the system tokens, such as `--env-space-4` or `--env-color-bg-muted`, instead.
  - **The `no-private-classes` rules are removed** from the ESLint plugin (`envui/no-private-classes`) and the Stylelint config (`envui/no-private-classes`), since the classes they reported are public now. To migrate, delete the rule from any configuration or disable comment that names it: ESLint and Stylelint report a rule they don't know.

  Migration guide: [Part names and component tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md#part-names-and-component-tokens).

### Patch Changes

- The soft accent badge takes a tint of its own, `--env-color-bg-accent-badge`: in the light theme the accent blue at 5%, fainter than `--env-color-bg-accent-muted` at 12%, so its blue text keeps 4.5:1 on list rows and muted surfaces. The blue itself is unchanged. In dark and at high contrast the new token has the value of `--env-color-bg-accent-muted`, and info alerts keep `--env-color-bg-accent-muted` in every theme. The ESLint plugin and the Stylelint config accept the new token.
- Avatar hues are named for their colors: `blue` is `powder`, `teal` `seafoam`, `green` `sage`, `amber` `butter`, `red` `blush`, `violet` `periwinkle`, `purple` `orchid` and `slate` `oat`, in `hue`, `avatarHues`, `AvatarHue` and `avatarHue`, and as the values of `data-hue`: `[data-hue='blue']`, `[data-hue='teal']`, `[data-hue='green']`, `[data-hue='amber']`, `[data-hue='red']`, `[data-hue='violet']`, `[data-hue='purple']` and `[data-hue='slate']` are `[data-hue='powder']`, `[data-hue='seafoam']`, `[data-hue='sage']`, `[data-hue='butter']`, `[data-hue='blush']`, `[data-hue='periwinkle']`, `[data-hue='orchid']` and `[data-hue='oat']`. A name keeps the hue it had, now under its new name.

  The tokens follow: `--env-color-avatar-bg-teal` and the others are `--env-color-avatar-bg-seafoam` and so on, with `--env-color-avatar-fg-{hue}` and `--env-color-avatar-figure-{hue}` beside them, and each hue, powder included, has tokens of its own. `--env-color-avatar-bg`, `--env-color-avatar-fg` and `--env-color-avatar-figure` stay, the powder hue's.

  To migrate, `v1-props` rewrites a literal `hue`, such as `<Avatar hue="teal">` to `hue="seafoam"`, and `v1-classes` the token names; rename `data-hue` values in your own CSS by hand. A fill you set on an old `--env-color-avatar-bg-{hue}` for a color of your own now sits under the hue's deep foreground, so set `--env-color-avatar-fg-{hue}` and `--env-color-avatar-figure-{hue}` beside it, to a color that keeps 4.5:1 on that fill. The ESLint plugin and the Stylelint config know the new token names.

- envUI draws no drop shadows. Menus, Select and Combobox lists, popovers, hover cards, pickers, rich text suggestions, docked panels, tooltips, toasts, dialogs, sheets and the command palette separate by their fill, their edge and, for modals, the scrim.
  - The elevation edge, `--env-elevation-{1|2|3}-border`, is clearly visible now, one color for every level: about 2:1 against a popup and the page, and at least 1.6:1 against every surface a popup floats over. In high contrast it stays the 4.5:1 boundary. In dark, the edge of tooltips and toasts, `--env-color-border-{neutral|success|info|danger}-strong`, is this edge too.
  - The elevation shadows `--env-elevation-{0|1|2|3}-shadow` are removed, and with them the 0.7 names `--elevation-{0|1|2|3}-shadow`, which no longer take the prefix. `v1-classes` reports each use. Delete the `box-shadow`. If your own floating layer relied on it, give the layer its level's edge instead: `border: 1px solid var(--env-elevation-2-border)`.
  - A row that moves in a reorderable list takes the elevation edge as a ring, and the color picker's thumbs take a ring outside their white edge. Neither has a shadow any more. Docked panels and the active one are no longer set apart by shadows: the active docked panel's edge takes the accent, `--env-color-border-accent-emphasis`, in every theme and contrast.
  - Focus rings, halos, inset edges and selection bars drawn with `box-shadow` are rings, not shadows, and stay.

  Migration guide: [Tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md#tokens).

## 1.0.0-prerelease.0

### Major Changes

- envUI's CSS moves into cascade layers, and every token takes the `--env-` prefix.
  - **Cascade layers.** Every rule of `styles.css` is in a layer of `env`: `env.reset`, `env.tokens`, `env.base`, `env.components` and `env.utilities`, in that order. An application's CSS outside cascade layers overrides envUI's whatever its specificity, so selectors and `!important` that only out-weighed envUI's rules can go. An application puts its resets and element styles in a layer before `env` and its own layers after it, declared once, such as `@layer reset, env, app;`: an element rule outside layers would restyle envUI's components too. The font face stays outside layers.
  - **The `--env-` prefix.** Every token is a custom property with the prefix: `--space-4` is `--env-space-4` and `--color-fg-muted` is `--env-color-fg-muted`, in Tokens.css, the token reference, the manifest and the MCP server. The application hooks take it too: `--env-line-height-body`, `--env-avatar-group-ring` and the pill corner `--env-radius-full`.
  - **The 0.7 aliases are removed.** `--color-text-muted`, `--color-row`, `--color-checkbox` and the other 0.7 names that were aliases of the semantic roles are gone; use the role that replaces each. The list item's per-theme fill and the avatar's fixed blues are component tokens now: `--env-color-list-item-bg` with `-hover` and `-pressed`, and `--env-color-avatar-bg`, `-fg` and `-figure`. `--md-sys-shape-corner-*` is retired for one radius scale, `--env-radius-{none|xs|sm|md|lg|xl|full}`, with `--env-radius-surface` and the row radii as its roles; `--radius-standard` is `--env-radius-sm` and `--radius-large` `--env-radius-lg`.
  - **Consistent color names.** A tone's edges grow from `border-{tone}-muted`, an alert's faint edge, through `border-{tone}`, an outlined badge's translucent edge, to the solid `border-accent-emphasis` and `border-danger-emphasis`, the edges of a focused and an invalid field, which were `border-accent` and `border-danger`. `border-translucent` is `border-media` and `bg-page-muted` is `bg-inset`, named for their roles, and the tones' state layers gain a resting `bg-{tone}-subtle`.
  - **Forced colors.** Under `forced-colors: active`, such as the system's contrast themes, selected, chosen, current, highlighted, checked, focused, invalid and unavailable states take system colors where a fill or shadow carried them, so they stay visible, and swatches, the color picker and calendar heatmaps keep their colors.
  - **Motion** lives in each component's style sheet; it is unchanged, with fades always and movement only without a reduced-motion preference.

  To migrate, run `npx @envsemble/envui-codemods v1-classes src`: it rewrites the old custom properties in style sheets and scripts, declared or read, to their 1.0 names, the 0.7 aliases straight to the tokens that replace them, and reports `--color-white`, `--color-canvas-dark` and the removed names with what to use instead. The migration guide lists every name. The ESLint plugin and the Stylelint config suggest the prefixed tokens.

  Migration guide: [Cascade layers](https://github.com/envsemble/envUI/blob/main/docs/migration.md#cascade-layers) and [Tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md#tokens).

- The first release: a Stylelint config for applications built with envUI, for Stylelint 17. It reports selectors of envUI's private `env-` classes (besides the `.env-theme` boundary), raw colors, a literal `z-index`, and px outside hairlines, and each message says what to use instead: the component's props, the envUI color tokens for the property by name, rem, or for `z-index`, envUI's stacking tokens (`--env-z-…`).

  The config is released with `@envsemble/envui` at the same version; install the version that matches envUI.

  Migration guide: [Upgrade from envUI 0.x to 1.0](https://github.com/envsemble/envUI/blob/main/docs/migration.md#upgrade-from-envui-0x-to-10).
