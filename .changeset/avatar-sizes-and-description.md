---
'@envsemble/envui': major
---

Avatar, AvatarGroup and AvatarButton take the 1.0 sizes and slot words.

- `size` is `sm`, `md` (the default), `lg` or `xl` on Avatar and AvatarGroup, and `sm`, `md` or `lg` on AvatarButton, for `small`, `standard`, `large` and `display`; the sizes are `data-size` attributes instead of the `env-avatar-{size}` and `env-avatar-group-{size}` classes.
- AvatarButton's `detail` is `description`. It renders through envUI's action element and takes `ref`.
- AvatarGroup's strings come from `messages.avatarGroup`, whose `more` and `label` receive the count in the locale's digits as `number`; `formatMore` and `formatLabel` still override them. It rings its avatars through Avatar's new `--env-avatar-ring` hook.
- Avatar's initials take the provider's locale for their capitals.

Migrate with the codemods: `envui-codemods v1-props` maps the sizes and renames `detail`, and `v1-classes` turns the size classes into attribute selectors.

Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).
