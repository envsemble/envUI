---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
---

Every color token follows one grammar, `--env-color-{bg|fg|border}-{role}…`, where a component that names a color is its role:

- the avatars' `--env-color-avatar-bg-*`, `--env-color-avatar-fg-*` and `--env-color-avatar-figure-*` are `--env-color-bg-avatar-*`, `--env-color-fg-avatar-*` and `--env-color-fg-avatar-figure-*`, the unsuffixed ones included;
- `--env-color-list-item-bg`, `-hover` and `-pressed` are `--env-color-bg-list-item`, `-hover` and `-pressed`;
- `--env-color-rating-star` is `--env-color-fg-rating-star` and `--env-color-skeleton-shine` `--env-color-bg-skeleton-shine`;
- `--env-color-fg-link-on-tint` and its states are `--env-color-fg-link-on-muted`, for a link on a `*-muted` tint;
- `--env-counter-badge-height` is `--env-badge-count-height`, for Badge's count.

`--env-color-bg-navigation` is new, the transparent rest of a navigation item, beside its hover and pressed tokens. `v1-classes` renames the old names; no color changes.
