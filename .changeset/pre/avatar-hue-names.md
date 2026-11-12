---
'@envsemble/envui': major
'@envsemble/eslint-plugin-envui': patch
'@envsemble/stylelint-config-envui': patch
---

Avatar hues are named for their colors: `blue` is `powder`, `teal` `seafoam`, `green` `sage`, `amber` `butter`, `red` `blush`, `violet` `periwinkle`, `purple` `orchid` and `slate` `oat`, in `hue`, `avatarHues`, `AvatarHue` and `avatarHue`, and as the values of `data-hue`: `[data-hue='blue']`, `[data-hue='teal']`, `[data-hue='green']`, `[data-hue='amber']`, `[data-hue='red']`, `[data-hue='violet']`, `[data-hue='purple']` and `[data-hue='slate']` are `[data-hue='powder']`, `[data-hue='seafoam']`, `[data-hue='sage']`, `[data-hue='butter']`, `[data-hue='blush']`, `[data-hue='periwinkle']`, `[data-hue='orchid']` and `[data-hue='oat']`. A name keeps the hue it had, now under its new name.

The tokens follow: `--env-color-avatar-bg-teal` and the others are `--env-color-avatar-bg-seafoam` and so on, with `--env-color-avatar-fg-{hue}` and `--env-color-avatar-figure-{hue}` beside them, and each hue, powder included, has tokens of its own. `--env-color-avatar-bg`, `--env-color-avatar-fg` and `--env-color-avatar-figure` stay, the powder hue's.

To migrate, `v1-props` rewrites a literal `hue`, such as `<Avatar hue="teal">` to `hue="seafoam"`, and `v1-classes` the token names; rename `data-hue` values in your own CSS by hand. A fill you set on an old `--env-color-avatar-bg-{hue}` for a color of your own now sits under the hue's deep foreground, so set `--env-color-avatar-fg-{hue}` and `--env-color-avatar-figure-{hue}` beside it, to a color that keeps 4.5:1 on that fill. The ESLint plugin and the Stylelint config know the new token names.
