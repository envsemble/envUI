---
'@envsemble/envui': major
'@envsemble/envui-codemods': patch
'@envsemble/eslint-plugin-envui': patch
'@envsemble/stylelint-config-envui': patch
---

envUI draws no drop shadows. Menus, Select and Combobox lists, popovers, hover cards, pickers, rich text suggestions, docked panels, tooltips, toasts, dialogs, sheets and the command palette separate by their fill, their edge and, for modals, the scrim.

- The elevation edge, `--env-elevation-{1|2|3}-border`, is clearly visible now, one color for every level: about 2:1 against a popup and the page, and at least 1.6:1 against every surface a popup floats over. In high contrast it stays the 4.5:1 boundary. In dark, the edge of tooltips and toasts, `--env-color-border-{neutral|success|info|danger}-strong`, is this edge too.
- The elevation shadows `--env-elevation-{0|1|2|3}-shadow` are removed, and with them the 0.7 names `--elevation-{0|1|2|3}-shadow`, which no longer take the prefix. `v1-classes` reports each use. Delete the `box-shadow`. If your own floating layer relied on it, give the layer its level's edge instead: `border: 1px solid var(--env-elevation-2-border)`.
- A row that moves in a reorderable list takes the elevation edge as a ring, and the color picker's thumbs take a ring outside their white edge. Neither has a shadow any more. Docked panels and the active one are no longer set apart by shadows: the active docked panel's edge takes the accent, `--env-color-border-accent-emphasis`, in every theme and contrast.
- Focus rings, halos, inset edges and selection bars drawn with `box-shadow` are rings, not shadows, and stay.

Migration guide: [Tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
