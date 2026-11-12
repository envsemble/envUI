---
'@envsemble/envui': patch
'@envsemble/eslint-plugin-envui': patch
'@envsemble/stylelint-config-envui': patch
---

The soft accent badge takes a tint of its own, `--env-color-bg-accent-badge`: in the light theme the accent blue at 5%, fainter than `--env-color-bg-accent-muted` at 12%, so its blue text keeps 4.5:1 on list rows and muted surfaces. The blue itself is unchanged. In dark and at high contrast the new token has the value of `--env-color-bg-accent-muted`, and info alerts keep `--env-color-bg-accent-muted` in every theme. The ESLint plugin and the Stylelint config accept the new token.
